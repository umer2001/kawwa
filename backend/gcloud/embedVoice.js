const { textToSpeech } = require("../core-functions/elevenLabs");
const { generateCutVideo, insertCutSection, getAudioDuration } = require("../core-functions/ffmpeg");
const { BlendRequest, FieldValue } = require("../core-functions/firebase/request");
const { generateSubtitleModifications } = require("../core-functions/openAI/generatePrompt");
const { uploadToBucket, downloadFromBucket } = require("../core-functions/storageService");
const { extractModifications, getTimeStamp, calculateCumulativeDuration } = require("../utils/utils");
const fs = require("fs");
require("dotenv").config();

exports.embedVoice = async (event, context) => {
    const { id: reqId } = JSON.parse(Buffer.from(event.data, "base64").toString());

    const blendRequest = new BlendRequest({ id: reqId });
    const req = await blendRequest.getRequest();

    blendRequest.addLog("Video processing started");

    blendRequest.addLog("Generating new subtitles...");
    const subtitlesPath = await downloadFromBucket(process.env.RAW_BUCKET_NAME, req.assets.rawSubtitles.split(process.env.RAW_BUCKET_NAME)[1].substring(1), `${process.env.TEMP_FOLDER}`);
    const { modified_subtitles: newSubtitles } = await generateSubtitleModifications(subtitlesPath, {
        brandName: req.brandName,
        brandType: req.brandType,
        brandDescription: req.brandDescription,
    });
    console.log("newSubtitles", newSubtitles);

    blendRequest.addLog("extracting modifications...");
    const modifications = extractModifications(newSubtitles);

    const wordTimestamps = JSON.parse(fs.readFileSync(subtitlesPath, "utf8"));

    const newModifications = modifications.map((modification) => ({
        ...modification,
        before: {
            text: modification.before,
            timeStamp: getTimeStamp(modification.before, "end", wordTimestamps),
        },
        after: {
            text: modification.after,
            timeStamp: getTimeStamp(modification.after, "start", wordTimestamps),
        },
    }));

    console.log("modifications", newModifications);

    // update request
    await blendRequest.updateRequest({
        approachSpecifics: {
            ...req.approachSpecifics,
            modifications: newModifications,
        },
        logs: FieldValue.arrayUnion({
            timestamp: new Date().toISOString(),
            message: `Subtitles & modification generation completed.`,
        }),
    });

    // generate cloned audios
    blendRequest.addLog("Generating synthesized audios...");
    const synthesizedAudios = await Promise.all(newModifications.map(({ modification }, idx) => textToSpeech(
        modification,
        { outputFilePath: `${process.env.TEMP_FOLDER}/synthesized-${reqId}-${idx}.mp3` }
    ))
    );
    console.log("synthesizedAudios", synthesizedAudios);

    // download video
    blendRequest.addLog("Downloading video...");
    const videoPath = await downloadFromBucket(
        process.env.RAW_BUCKET_NAME,
        req.assets.rawVideo.split(process.env.RAW_BUCKET_NAME)[1].substring(1)
    );
    console.log("videoPath", videoPath);

    // generate cut videos
    blendRequest.addLog("Generating cut videos...");
    const cutVideos = await Promise.all(
        newModifications.map(({ before }, idx) => generateCutVideo(
            videoPath,
            synthesizedAudios[idx],
            before.timeStamp,
            `${process.env.TEMP_FOLDER}/cut-${reqId}-${idx}.mp4`
        ))
    );
    console.log("cutVideos", cutVideos);

    // combine cut videos
    blendRequest.addLog("Combining cut videos...");
    let finalOutput;
    for (const [idx, cutVideo] of cutVideos.entries()) {
        let insertionSecond, inputVideoPath;
        if (idx === 0) {
            inputVideoPath = videoPath;
            insertionSecond = newModifications[idx].before.timeStamp;
        }
        else {
            inputVideoPath = `${process.env.TEMP_FOLDER}/${reqId}-${idx - 1}.mp4`;
            const cumulativeDuration = await calculateCumulativeDuration(synthesizedAudios, idx);
            insertionSecond = newModifications[idx].before.timeStamp + cumulativeDuration;
        }
        console.log({
            insertionSecond,
            index: idx,
        });
        finalOutput = await insertCutSection(
            inputVideoPath,
            cutVideo,
            insertionSecond,
            idx === cutVideos.length - 1 ? `${process.env.TEMP_FOLDER}/${reqId}.mp4` : `${process.env.TEMP_FOLDER}/${reqId}-${idx}.mp4`
        )
    }
    console.log("finalOutput", finalOutput);

    // upload to bucket
    const publicUrl = await uploadToBucket(process.env.TARGET_BUCKET_NAME, finalOutput, "processed");
    // update request
    await blendRequest.updateRequest({
        status: "completed",
        processedVideo: publicUrl,
        logs: FieldValue.arrayUnion({
            timestamp: new Date().toISOString(),
            message: "Video processed and stored in target bucket",
        }),
    });
};
