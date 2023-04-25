const functions = require("@google-cloud/functions-framework");
const { storeVideo } = require("./gcloud/storeVideo");
const { embedBanner } = require("./gcloud/embedBanner");

// exprt all functions
exports.storeVideo = storeVideo;
exports.embedBanner = embedBanner;
