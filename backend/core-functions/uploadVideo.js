// upload a vido from videos folder in current directory to google cloud storage bucket
// and return the public url of the video

require("dotenv").config();
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
const path = require("path");

const storage = new Storage({
  keyFilename: path.join(
    __dirname,
    process.env.GOOGLE_APPLICATION_CREDENTIALS ??
      "GOOGLE_APPLICATION_CREDENTIALS.json"
  ),
  projectId: process.env.GCP_PROJECT_ID,
});

// upload a video to google cloud storage bucket
async function uploadVideo(videoPath) {
  // upload video to google cloud storage bucket
  await storage.bucket(process.env.RAW_BUCKET_NAME).upload(videoPath, {
    gzip: true,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  // get the public url of the video
  const publicUrl = `https://storage.googleapis.com/${
    process.env.RAW_BUCKET_NAME
  }/${path.basename(videoPath)}`;

  console.info(`Video uploaded to: ${publicUrl}`);

  return publicUrl;
}

module.exports = uploadVideo;
