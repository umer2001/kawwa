const functions = require("@google-cloud/functions-framework");
const { storeVideo } = require("./gcloud/storeVideo");
const { embedBanner } = require("./gcloud/embedBanner");
const { initRequest } = require("./gcloud/initRequest");
const { approachInitializer } = require("./gcloud/approachInitializer");
const { generateSubtitles } = require("./gcloud/generateSubtitles");
const { generateSubtitlesWebhook } = require("./gcloud/generateSubtitlesWebhook");
const { embedVoice } = require("./gcloud/embedVoice");

// exprt all functions
exports.initRequest = initRequest;
exports.storeVideo = storeVideo;
exports.approachInitializer = approachInitializer;
exports.embedBanner = embedBanner;
exports.embedVoice = embedVoice;
exports.generateSubtitles = generateSubtitles;
exports.generateSubtitlesWebhook = generateSubtitlesWebhook;
