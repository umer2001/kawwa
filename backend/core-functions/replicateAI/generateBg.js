const Replicate = require("replicate");
const fetch = require("node-fetch");
const fs = require("fs");

const replicate = new Replicate({
  auth: "***REMOVED***",
});

const model =
  "stability-ai/stable-diffusion:f178fa7a1ae43a9a9af01b833b9d2ecf97b1bcb0acfd2dc5dd04895e042863f1";

async function generateBg(
  prompt,
  outputPath = `${process.env.TEMP_FOLDER}/ad-background.png`,
  width = 256,
  height = 768
) {
  const input = {
    prompt,
    width,
    height,
  };

  try {
    const res = await replicate.run(model, { input });
    const imageUrl = res[0];
    const buffer = await fetch(imageUrl).then((res) => res.buffer());
    fs.writeFile(outputPath, buffer, () => console.log("done"));
    return outputPath;
  } catch (err) {
    console.log(err);
    return generateBg(prompt, width, height);
  }
}

module.exports = generateBg;
