const Jimp = require("jimp");
const {
  findLongestWord,
  getFontSizeRecommendation,
} = require("../../utils/utils");

require("dotenv").config();

async function generateBanner(
  bgPath,
  logoPath,
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

        // Load the logo image and resize it to 50x50
        return Jimp.read(logoPath).then((logo) => {
          logo.resize(100, 100);

          // Compose the logo onto the new layer image at the top center position
          const layer = new Jimp(
            background.bitmap.width,
            background.bitmap.height
          );
          layer.composite(
            logo,
            (background.bitmap.width - logo.bitmap.width) / 2,
            120
          );

          // Darken the image by adding a black layer and adjusting its opacity
          background.color([{ apply: "mix", params: ["#000000", "70"] }]);

          // Compose the background and the new layer image
          background.composite(layer, 0, 0);

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
              background.print(
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

              return background.writeAsync(outputPath);
            })
            .then(() => {
              resolve(outputPath);
            });
        });
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

module.exports = generateBanner;
