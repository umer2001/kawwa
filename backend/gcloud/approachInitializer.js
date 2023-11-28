const { BlendRequest } = require("../core-functions/firebase/request");
const { PubSub } = require("@google-cloud/pubsub");

require("dotenv").config();

exports.approachInitializer = async (cloudEvent) => {
    const { id: reqId } = JSON.parse(Buffer.from(cloudEvent.data, "base64").toString());
    try {

        const blendRequest = new BlendRequest({ id: reqId });
        const req = await blendRequest.getRequest();

        // publish to approach topic
        const approaches = { sidebar: process.env.SIDEBAR_TOPIC, voice: process.env.VOICE_INIT_TOPIC };
        const topicName = approaches[req.approach];
        const dataBuffer = Buffer.from(JSON.stringify({
            ...req,
            id: reqId,
        }));
        const pubSubClient = new PubSub();
        const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);

        // update request
        await blendRequest.addLog(`Message(${messageId}) for request (${reqId}) published to topic ${topicName}.`);

        console.log(`Message(${messageId}) for request (${reqId}) published to topic ${topicName}.`);
    } catch (error) {
        console.error(error);
        return {
            body: error,
        }
    }
};
