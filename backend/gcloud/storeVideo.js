const fs = require("fs");
const ytdl = require("ytdl-core");
const { PubSub } = require("@google-cloud/pubsub");
const {
  downloadAudio,
  downloadVideo,
  combineAudioVideo,
  convertToMp3,
} = require("../core-functions/ytdl");
const { BlendRequest, FieldValue } = require("../core-functions/firebase/request");
const { uploadToBucket, existsInBucket } = require("../core-functions/storageService");
require("dotenv").config();

const RAW_BUCKET_VODEOS_FOLDER = "videos";
const RAW_BUCKET_AUDIOS_FOLDER = "audios";

exports.storeVideo = async (cloudEvent) => {
  try {
    const { youtubeVideoLink: { stringValue: videoLink }, approach: { stringValue: integrationApproach } } = cloudEvent.value.fields;
    const reqId = cloudEvent.value.name.split("/").pop();
    const videoId = videoLink.split("=")[1].trim();
    console.info("videoLink", videoLink);
    // print info
    const info = await ytdl.getInfo(videoLink);
    console.info("info", info.videoDetails.title);

    const assets = {
      rawVideo: null,
    };

    // check if already exists in bucket
    const exists = await existsInBucket(process.env.RAW_BUCKET_NAME, `${RAW_BUCKET_VODEOS_FOLDER}/${videoId}.mp4`);
    let videoTargetPath = `https://storage.googleapis.com/${process.env.RAW_BUCKET_NAME}/${RAW_BUCKET_VODEOS_FOLDER}/${videoId}.mp4`
    if (!exists) {
      // download audio & video
      const [audioPath, videoPath] = await Promise.all([
        downloadAudio(videoLink),
        downloadVideo(videoLink),
      ]);

      console.log("audioPath", audioPath);
      console.log("videoPath", videoPath);

      // combine audio and video into single file
      const outputPath = `${process.env.TEMP_FOLDER}/${videoId}.mp4`;
      const combinedPath = await combineAudioVideo(
        audioPath,
        videoPath,
        outputPath
      );

      if (combinedPath) {
        console.info(`Video combined to: ${combinedPath}`);
        assets.rawVideo = await uploadToBucket(process.env.RAW_BUCKET_NAME, combinedPath, RAW_BUCKET_VODEOS_FOLDER)
      }
    }
    else {
      assets.rawVideo = videoTargetPath;
      console.info("Video already exists in bucket");
    }

    // init blend request
    const blendRequest = new BlendRequest({ id: reqId });

    // if approach needs audio
    if (integrationApproach === "voice") {
      // check if already exists in bucket
      const exists = await existsInBucket(process.env.RAW_BUCKET_NAME, `${RAW_BUCKET_AUDIOS_FOLDER}/${videoId}.mp3`);
      const audioTargetPath = `https://storage.googleapis.com/${process.env.RAW_BUCKET_NAME}/${RAW_BUCKET_AUDIOS_FOLDER}/${videoId}.mp3`
      if (!exists) {
        // download audio
        const videoPath = `${process.env.TEMP_FOLDER}/${videoId}-raw-audio.mp4`;
        if (!fs.existsSync(videoPath)) {
          await downloadAudio(videoLink);
        }
        blendRequest.addLog("converting to mp3...");
        const convertedAudioPath = await convertToMp3(videoPath, `${process.env.TEMP_FOLDER}/${videoId}.mp3`);
        if (convertedAudioPath) {
          blendRequest.addLog("uploading mp3 to bucket...");
          assets.rawAudio = await uploadToBucket(process.env.RAW_BUCKET_NAME, convertedAudioPath, RAW_BUCKET_AUDIOS_FOLDER);
        }
      }
      else {
        assets.rawAudio = audioTargetPath;
        console.info("Audio already exists in bucket");
      }
    }

    await blendRequest.updateRequest({
      assets,
      logs: FieldValue.arrayUnion({
        timestamp: new Date().toISOString(),
        message: "Video/audio stored in raw bucket",
      }),
    });

    // trigger approach initializer
    const dataBuffer = Buffer.from(JSON.stringify({
      id: reqId,
      videoPath: videoTargetPath,
    }));
    const pubSubClient = new PubSub();
    const messageId = await pubSubClient.topic(process.env.APPROACH_INITIALIZER_TOPIC).publish(dataBuffer);
    console.log(`Message(${messageId}) for request (${reqId}) published to topic ${process.env.APPROACH_INITIALIZER_TOPIC}.`);
  } catch (error) {
    console.error(error);
    return {
      body: error,
    }
  }
};
