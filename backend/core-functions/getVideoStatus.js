const fs = require("fs");
const {
  VideoIntelligenceServiceClient,
} = require("@google-cloud/video-intelligence");

async function getVideoStatus(operationName) {
  const client = new VideoIntelligenceServiceClient();
  const res = await client.checkAnnotateVideoProgress(operationName);
  console.info("done", res.done);
  console.info("metadata", res.metadata);
  console.info("response", res.result);
  console.info("error", res.result.annotationResults[0].error);
  return res;
}

module.exports = getVideoStatus;
