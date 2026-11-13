require("dotenv").config();
const { OpenAI } = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  const res = await openai.completions.create({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 1000,
  });

  console.log("res", res.choices);

  const combinedText = res.choices[0].text.trim();
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

async function generateSubtitleModifications(subtitlesPath, brand = { brandName: null, brandType: null, brandDescription: null }) {
  if (!brand.brandName || !brand.brandType || !brand.brandDescription) {
    throw new Error("Invalid brand data");
  }

  if (!subtitlesPath) {
    throw new Error("Invalid subtitles path");
  }

  const { brandName, brandType, brandDescription } = brand;

  const subtitleJson = JSON.parse(fs.readFileSync(subtitlesPath, "utf8"));
  const subtitleText = subtitleJson.reduce((acc, curr) => acc + `${curr.text} `, "");

  // input prompt
  const prompt = `Following is a metadata of a brand:
    Brand name: ${brandName}
    Brand type: ${brandType}
    Brand description: ${brandDescription}
    
    subtitles: ${subtitleText}
    above is subtitle for a video, modify the subtitles in such a way that it promotes or introduces ${brandName} some where in between the video in such a way that it doesn't feel like adding fixed lines in the video, you are allowed extend modify brand description to make it more relivant to video. make sure to not change any other part of the the video
    
    below is an example seenario:
    Brand name: Mulab
    Brand type: Event Management
    Brand description: Mulab is a company that organizes events and concerts. They are known for their high quality events.
    subtitles: "Hi there my friends, today we are going to talk about how to win chess in 4 moves. First, you need to move your pawn forward. Then, you need to move your knight forward. Then, you need to move your bishop forward. Finally, you need to move your queen forward. And that's how you win chess in 4 moves. I hope you enjoyed this video. please like and subscribe to my channel. thank you for watching."
    output: "Hi there my friends, today we are going to talk about how to win chess in 4 moves. [modification-start] Before moving forward, I would like to introduce you to a brand called Mulab,  the event management company known for organizing top-notch events and concerts. They are the unbeatable and unmatchable like me. So next time book Mulab to organize your events to stay unbeatable & unmatchable. Now back to the video So [modification-end] First, you need to move your pawn forward. Then, you need to move your knight forward. Then, you need to move your bishop forward. Finally, you need to move your queen forward. And that's how you win chess in 4 moves. I hope you enjoyed this video. please like and subscribe to my channel. thank you for watching.",

    I need output/reply as a json object with key as "modified_subtitles", lasly don't forget to wrap the modified subtitle in [modification-start] and [modification-end] tags.
    `;

  // generate output prompt & sample text
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  console.log("res type", typeof res.choices[0].message.content);
  console.log("res =>", res.choices[0].message.content);
  const newSubtitles = JSON.parse(res.choices[0].message.content);

  return newSubtitles;
}

module.exports = {
  generatePrompt,
  generateSubtitleModifications,
};
