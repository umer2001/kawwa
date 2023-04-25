const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: "***REMOVED***",
});

const openai = new OpenAIApi(configuration);

async function generatePrompt(
  brand = { brandName: null, brandType: null, brandDescription: null }
) {
  if (!brand.brandName || !brand.brandType || !brand.brandDescription) {
    throw new Error("Invalid brand data");
  }

  const { brandName, brandType, brandDescription } = brand;

  // input prompt
  const prompt = `Following is a metadata of a brand:
    Brand name: ${brandName}
    Brand type: ${brandType}
    Brand description: ${brandDescription}

    Now based on the above data give me a perfect prompt making a scene that I can give to Stable diffusion model for generating an image related to my brand. Where my brand should always be in the center of the image. Secondly, also give me a sample text which I can write on the image to complement the overall look and message`;

  // generate output prompt & sample text
  const res = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 1000,
  });

  console.log("res", res.data);

  const combinedText = res.data.choices[0].text.trim();
  const outputPrompt = combinedText
    .split(":")[1]
    .trim()
    .replace("Sample Text", "")
    .replace("Sample text", "");
  const marketingText = combinedText.split(":")[2].trim();

  return {
    prompt: outputPrompt,
    marketingText,
  };
}

module.exports = generatePrompt;
