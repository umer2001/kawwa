const readline = require("readline");
const analyzeVideo = require("./core-functions/analyzeVideo");
const downloadVideo = require("./core-functions/downloadVideo");
const getVideoStatus = require("./core-functions/getVideoStatus");
const uploadVideo = require("./core-functions/uploadVideo");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the YouTube video URL: ", async (url) => {
  const videoPath = await downloadVideo(url);
  if (videoPath) {
    console.info(`Video downloaded to: ${videoPath}`);
    uploadVideo(videoPath);
    // uploadVideo("raw/video.mp4");
  }
  rl.close();
});

// analyzeVideo("gs://raw-kawwa/kTZCinivLco.mp4");
// getVideoStatus(
//   "projects/292824132082/locations/asia-east1/operations/7732851285247399311"
// );
