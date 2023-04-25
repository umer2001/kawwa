const combineAd = require("./core-functions/bannerAds/combineAd");
const generatePrompt = require("./core-functions/openAI/generatePrompt");
const generateBg = require("./core-functions/replicateAI/generateBg");
const generateBanner = require("./core-functions/bannerAds/generateBanner");

const adWidth = 200;
const videoPath = "raw/qLGmj86-j4k.mp4";
const outputVideoPath = "final/qLGmj86-j4k.mp4";

(async function main() {
  const { prompt, marketingText } = await generatePrompt({
    brandName: "Mulab",
    brandType: "Wedding organizer",
    brandDescription:
      "A wedding organizer that helps you to organize your wedding. It has a collection of themes that will help you to organize your wedding.",
  });
  const bgPath = await generateBg(prompt);
  const bannerAdPath = await generateBanner(bgPath, marketingText);
  combineAd(videoPath, bannerAdPath, outputVideoPath, adWidth);
})();
