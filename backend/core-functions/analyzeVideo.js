const videoIntelligence = require("@google-cloud/video-intelligence");
const fs = require("fs");

async function analyzeVideo(videoPath) {
  const client = new videoIntelligence.VideoIntelligenceServiceClient();

  const request = {
    inputUri: videoPath,
    features: ["LABEL_DETECTION"],
  };

  // Execute request
  const [operation] = await client.annotateVideo(request);
  console.log("operation", JSON.stringify(operation, null, 2));
  // write to a json file
  fs.writeFile("operation.json", JSON.stringify(operation, null, 2), (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });

  // console.log(
  //   "Waiting for operation to complete... (this may take a few minutes)"
  // );

  // const [operationResult] = await operation.promise();

  // // Gets annotations for video
  // const annotations = operationResult.annotationResults[0];

  // // Gets labels for video from its annotations
  // const labels = annotations.segmentLabelAnnotations;
  // labels.forEach((label) => {
  //   console.log(`Label ${label.entity.description} occurs at:`);
  //   label.segments.forEach((segment) => {
  //     segment = segment.segment;
  //     console.log(
  //       `\tStart: ${segment.startTimeOffset.seconds}.${(segment.startTimeOffset.nanos / 1e6).toFixed(0)}s`
  //     );
  //     console.log(
  //       `\tEnd: ${segment.endTimeOffset.seconds}.` +
  //         `${(segment.endTimeOffset.nanos / 1e6).toFixed(0)}s`
  //     );
  //   });
  // });
}

module.exports = analyzeVideo;
