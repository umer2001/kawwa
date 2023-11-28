const combineAd = require("../core-functions/bannerAds/combineAd");
const generateBanner = require("../core-functions/bannerAds/generateBanner");
const { BlendRequest, FieldValue } = require("../core-functions/firebase/request");
const { generatePrompt } = require("../core-functions/openAI/generatePrompt");
const generateBg = require("../core-functions/replicateAI/generateBg");
const { uploadToBucket, downloadFromBucket } = require("../core-functions/storageService");
require("dotenv").config();

exports.embedBanner = async (event, context) => {
  const { id: reqId } = JSON.parse(Buffer.from(event.data, "base64").toString());

  const blendRequest = new BlendRequest({ id: reqId });
  const req = await blendRequest.getRequest();

  blendRequest.addLog("Video processing started");

  blendRequest.addLog("Generating prompt");
  const { prompt, marketingText } = await generatePrompt({
    brandName: req.brandName,
    brandType: req.brandType,
    brandDescription: req.brandDescription,
  });

  const logoBucketPath = req.logo.split(process.env.RAW_BUCKET_NAME)[1].substring(1);
  const logoPath = await downloadFromBucket(process.env.RAW_BUCKET_NAME, logoBucketPath, `${process.env.TEMP_FOLDER}`);

  blendRequest.addLog("Generating background");
  const bgPath = await generateBg(prompt);
  blendRequest.addLog("Generating banner ad");
  const bannerAdPath = await generateBanner(bgPath, logoPath, marketingText);
  blendRequest.addLog("Combining banner ad with video");
  const outputPath = await combineAd(
    req?.assets.rawVideo ?? `https://storage.googleapis.com/***REMOVED***/videos/${reqId}-${req.youtubeVideoLink.split("=")[1]}-merged.mp4`,
    bannerAdPath,
    `${process.env.TEMP_FOLDER}/${reqId}-processed.mp4`
  );
  // upload to bucket
  const publicUrl = await uploadToBucket(process.env.TARGET_BUCKET_NAME, outputPath, "processed");
  // update request
  await blendRequest.updateRequest({
    status: "completed",
    processedVideo: publicUrl,
    logs: FieldValue.arrayUnion({
      timestamp: new Date().toISOString(),
      message: "Video processed and stored in target bucket",
    }),
  });
  return publicUrl;
};
