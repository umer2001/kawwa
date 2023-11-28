const { uploadToBucket } = require("../core-functions/storageService");
const { BlendRequest, FieldValue } = require("../core-functions/firebase/request");
const { PubSub } = require("@google-cloud/pubsub");
const path = require('path');
const os = require('os');
const fs = require('fs');
const cors = require("cors")({ origin: true });
require("dotenv").config();

const RAW_BUCKET_SUBTITLES_FOLDER = "subtitles";

exports.generateSubtitlesWebhook = async (req, res) => {
    return cors(req, res, async () => {
        const subtitles = JSON.parse(req.body.output);
        const subtitleReqId = req.body.id;
        const videoId = req.body.input.audio.split("/").pop().split(".")[0].trim();

        const blendRequest = new BlendRequest();
        const requests = await blendRequest.find({
            field: "approachSpecifics.subtitleReqId",
            operator: "==",
            value: subtitleReqId,
        });

        if (requests.length === 0) {
            return res.status(404).send("Request not found");
        }

        // save subtitles to bucket
        const subtitlesPath = path.join(process.env.TEMP_FOLDER ?? os.tmpdir(), `${videoId}.json`);
        fs.writeFileSync(subtitlesPath, JSON.stringify(subtitles));
        const subtitlesUrl = await uploadToBucket(process.env.RAW_BUCKET_NAME, subtitlesPath, RAW_BUCKET_SUBTITLES_FOLDER);


        const blendReq = requests[0];
        blendRequest.id = blendReq.id;
        await blendRequest.getRequest();

        if (blendReq.assets?.rawSubtitles) {
            return res.status(200).send("Subtitles already exist in bucket.");
        }

        await blendRequest.updateRequest({
            assets: {
                ...blendReq.assets,
                rawSubtitles: subtitlesUrl,
            },
            logs: FieldValue.arrayUnion({
                timestamp: new Date().toISOString(),
                message: `Subtitles generation completed.`,
            }),
        });

        // trigger voice generation
        const dataBuffer = Buffer.from(JSON.stringify({
            id: blendRequest.id,
        }));

        const pubSubClient = new PubSub();
        const messageId = await pubSubClient.topic(process.env.VOICE_TOPIC).publish(dataBuffer);
        const msg = `Message(${messageId}) for request (${blendRequest.id}) published to topic ${process.env.VOICE_TOPIC}.`;
        console.log(msg);
        blendRequest.addLog(msg);
    });
};