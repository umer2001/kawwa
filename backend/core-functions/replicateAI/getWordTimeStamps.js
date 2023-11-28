const replicate = require("./replicate");

const model =
    "carnifexer/whisperx:1e0315854645f245d04ff09f5442778e97b8588243c7fe40c644806bde297e04";

async function getWordTimeStamps(
    audioLink,
    webhookUrl,
) {
    const input = {
        audio: audioLink,
        only_text: false,
        batch_size: 16,
        align_output: true,
    };

    try {
        console.log("audioLink", audioLink);
        const res = await replicate.predictions.create({
            version: model.split(":")[1],
            input,
            webhook: webhookUrl,
            webhook_events_filter: ["completed"]
        });
        return res;
    } catch (err) {
        console.log(err);
    }
}

module.exports = getWordTimeStamps;
