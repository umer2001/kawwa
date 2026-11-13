require("dotenv").config();
const ElevenLabs = require("elevenlabs-node");

const voice = new ElevenLabs(
    {
        apiKey: process.env.ELEVEN_LABS_API_KEY,
        voiceId: process.env.ELEVEN_LABS_VOICE_ID
    }
);


async function textToSpeech(text, { voiceId, outputFilePath = "/tmp/audio.mp3" }) {
    const result = await voice.textToSpeech({
        // Required Parameters
        fileName: outputFilePath,
        textInput: text,
        voiceId: voiceId,

        // Optional Parameters
        stability: 0.55,
        similarityBoost: 0.75,
        modelId: "eleven_multilingual_v2",
        speakerBoost: true,
    });
    return result.status === "ok" ? outputFilePath : null;
};

module.exports = { textToSpeech };