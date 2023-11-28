// upload a vido from videos folder in current directory to google cloud storage bucket
// and return the public url of the video

require("dotenv").config();
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
const path = require("path");

const storage = new Storage({
  // keyFilename: path.join(
  //   __dirname,
  //   process.env.GOOGLE_APPLICATION_CREDENTIALS ??
  //     "GOOGLE_APPLICATION_CREDENTIALS.json"
  // ),
  projectId: process.env.GCP_PROJECT_ID,
});

// upload a video to google cloud storage bucket
async function uploadToBucket(bucketName, objectPath, targetFolder = "") {
  // upload video to google cloud storage bucket
  await storage.bucket(bucketName).upload(objectPath, {
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
    destination: `${targetFolder}/${path.basename(objectPath)}`,
  });

  // get the public url of the object
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${targetFolder}/${path.basename(
    objectPath
  )}`;

  console.info(`Object uploaded to: ${publicUrl}`);

  return publicUrl;
}

async function downloadFromBucket(bucketName, objectPath, targetFolder = process.env.TEMP_FOLDER) {
  const destination = `${targetFolder}/${path.basename(objectPath)}`;
  await storage.bucket(bucketName).file(objectPath).download({
    destination,
  });
  console.info(`Object downloaded to: ${destination}`);
  return destination;
}

async function existsInBucket(bucketName, objectPath) {
  const [exists] = await storage.bucket(bucketName).file(objectPath).exists();
  return exists;
}

module.exports = { uploadToBucket, downloadFromBucket, existsInBucket };
