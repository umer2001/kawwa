const Jimp = require("jimp");
const {
  findLongestWord,
  getFontSizeRecommendation,
} = require("../../utils/utils");

require("dotenv").config();

async function generateBanner(
  bgPath,
  marketingText,
  outputPath = `${process.env.TEMP_FOLDER}/ads/banners/banner.png`
) {
  // Load the background image
  return new Promise((resolve, reject) => {
    Jimp.read(bgPath)
      .then((background) => {
        // Resize the background image to 256x720
        background.resize(256, 720);

        // Create a new image with the same dimensions as the background
        const image = new Jimp(
          background.bitmap.width,
          background.bitmap.height,
          "#000000"
        );

        // Compose the background onto the image
        image.composite(background, 0, 0);

        // Darken the image by adding a black layer and adjusting its opacity
        image.color([{ apply: "mix", params: ["#000000", "70"] }]);

        // Load the font
        return Jimp.loadFont(
          Jimp[
            `FONT_SANS_${getFontSizeRecommendation(
              findLongestWord(marketingText),
              marketingText.length
            )}_WHITE`
          ]
        )
          .then((font) => {
            // Write the text on the new image
            image.print(
              font, // the font to use
              0, // x-coordinate of the text (left-aligned)
              300, // y-coordinate of the text
              {
                text: marketingText, // the text to write
                alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER, // center the text horizontally
                alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE, // center the text vertically
              },
              236, // maximum width of the text (wrap if necessary)
              150 // maximum height of the text (truncate if necessary)
            );

            // Compose the background image and the new image
            background.composite(image, 0, 0);

            return background.writeAsync(outputPath);
          })
          .then(() => {
            resolve(outputPath);
          });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

module.exports = generateBanner;
