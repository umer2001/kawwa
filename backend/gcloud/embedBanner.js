const combineAd = require("../core-functions/bannerAds/combineAd");
const generateBanner = require("../core-functions/bannerAds/generateBanner");
const generatePrompt = require("../core-functions/openAI/generatePrompt");
const generateBg = require("../core-functions/replicateAI/generateBg");
const uploadToBucket = require("../core-functions/uploadToBucket");

require("dotenv").config();

exports.embedBanner = async (event, context) => {
  const file = event;
  console.log(`File ${file.name} uploaded to bucket ${file.bucket}`);
  const { prompt, marketingText } = await generatePrompt({
    brandName: "Mulab",
    brandType: "Wedding organizer",
    brandDescription:
      "A wedding organizer that helps you to organize your wedding. It has a collection of themes that will help you to organize your wedding.",
  });
  const bgPath = await generateBg(prompt);
  const bannerAdPath = await generateBanner(bgPath, marketingText);
  const outputPath = await combineAd(
    `https://storage.googleapis.com/${file.bucket}/${file.name}`,
    bannerAdPath,
    `${process.env.TEMP_FOLDER}/${file.name}`
  );
  // upload to bucket
  const publicUrl = await uploadToBucket("kawwa", outputPath, "processed/");
  console.log(`Video uploaded to: ${publicUrl}`);
  return publicUrl;
};
