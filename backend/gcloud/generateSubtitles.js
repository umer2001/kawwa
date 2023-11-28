const { BlendRequest, FieldValue } = require("../core-functions/firebase/request");
const getWordTimeStamps = require("../core-functions/replicateAI/getWordTimeStamps");
const { existsInBucket } = require("../core-functions/storageService");
const { PubSub } = require("@google-cloud/pubsub");
require("dotenv").config();

const RAW_BUCKET_SUBTITLES_FOLDER = "subtitles";

exports.generateSubtitles = async (event, context) => {
    const { id: reqId } = JSON.parse(Buffer.from(event.data, "base64").toString());

    const blendRequest = new BlendRequest({ id: reqId });
    const req = await blendRequest.getRequest();

    const videoId = req.youtubeVideoLink.split("=")[1].trim();
    const exists = await existsInBucket(process.env.RAW_BUCKET_NAME, `${RAW_BUCKET_SUBTITLES_FOLDER}/${videoId}.json`);
    if (exists) {
        console.log("Subtitles already exist in bucket.");
        await blendRequest.updateRequest({
            assets: {
                ...req.assets,
                rawSubtitles: `https://storage.googleapis.com/${process.env.RAW_BUCKET_NAME}/${RAW_BUCKET_SUBTITLES_FOLDER}/${videoId}.json`,
            },
            logs: FieldValue.arrayUnion({
                timestamp: new Date().toISOString(),
                message: `Subtitles generation skipped. Subtitles already exist in bucket.`,
            }),
        });

        // trigger voice generation
        const dataBuffer = Buffer.from(JSON.stringify({
            id: reqId,
        }));

        const pubSubClient = new PubSub();
        const messageId = await pubSubClient.topic(process.env.VOICE_TOPIC).publish(dataBuffer);
        const msg = `Message(${messageId}) for request (${reqId}) published to topic ${process.env.VOICE_TOPIC}.`;
        blendRequest.addLog(msg);
        console.log(msg);
        return msg;
    }

    blendRequest.addLog("Subtitles generation started...");
    const { id } = await getWordTimeStamps(req.assets.rawAudio, process.env.AFTER_SUBTITLE_WEEBHOOK_URL);

    // update request
    await blendRequest.updateRequest({
        approachSpecifics: {
            ...req.approachSpecifics,
            subtitleReqId: id,
        },
        logs: FieldValue.arrayUnion({
            timestamp: new Date().toISOString(),
            message: `Waiting for subtitles generation to complete on id: ${id}`,
        }),
    });
};
