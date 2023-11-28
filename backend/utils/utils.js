const { getAudioDuration } = require("../core-functions/ffmpeg");

function findLongestWord(str) {
  var longestWord = str.split(" ").reduce(function (longest, currentWord) {
    return currentWord.length > longest.length ? currentWord : longest;
  }, "");
  return longestWord.length;
}

function getFontSizeRecommendation(wordLength, sentenceLength) {
  const availableSizes = [8, 10, 12, 14, 16, 32, 64, 128];
  if (wordLength > 4 || sentenceLength > 24) {
    availableSizes.splice(7, availableSizes.length - 1);
  }

  if (wordLength > 8 || sentenceLength > 48) {
    availableSizes.splice(6, availableSizes.length - 1);
  }

  if (wordLength > 16 || sentenceLength > 128) {
    availableSizes.splice(5, availableSizes.length - 1);
  }

  console.log("availableSizes", availableSizes);
  const size = availableSizes[availableSizes.length - 1];
  console.log("recommended size", size);
  return size;
}

function extractModifications(text) {
  const regex = /\[modification-start\](.*?)\[modification-end\]/g;
  const matches = [...text.matchAll(regex)];

  const result = matches.map(match => {
    const modification = match[1].trim();
    const before = text.substring(Math.max(0, match.index - 50), match.index).trim().split(' ').slice(-5).join(' ');
    const after = text.substring(match.index + match[0].length, Math.min(text.length, match.index + match[0].length + 50)).trim().split(' ').slice(0, 5).join(' ');

    return {
      modification,
      before,
      after
    };
  });

  return result;
}

function getTimeStamp(text, type = "start" || "end", wordTimestamps) {
  if (text === "" || !text) return null;
  const sentence = wordTimestamps.find((sentence) => sentence.text.includes(text));
  if (!sentence) {
    if (type === "start") {
      console.log("text", text);
      const newText = text.split(" ").slice(0, -1).join(" ");
      return getTimeStamp(newText, "start");
    };

    if (type === "end") {
      const newText = text.split(" ").slice(1).join(" ");
      return getTimeStamp(newText, "end");
    };
  }

  if (type === "start") {
    const firstWord = text.split(" ")[0];
    let wordIndex = sentence.words.findIndex(({ word }) => word.includes(firstWord));
    const word = sentence.words[wordIndex];
    if (!word.start) {
      return sentence.words[wordIndex - 1].end;
    }
    return word.start;
  }

  if (type === "end") {
    const lastWord = text.split(" ").pop();
    const word = sentence.words.find(({ word }) => word.includes(lastWord));
    if (!word.end) {
      return sentence.words[wordIndex + 1].start;
    }
    return word.end;
  }
}

async function calculateCumulativeDuration(synthesizedAudios, idx) {
  let cumulativeDuration = 0;
  for (let i = 0; i < idx; i++) {
    const audioDuration = await getAudioDuration(synthesizedAudios[i]);
    cumulativeDuration += audioDuration;
  }
  return cumulativeDuration;
}

module.exports = { findLongestWord, getFontSizeRecommendation, extractModifications, getTimeStamp, calculateCumulativeDuration };
