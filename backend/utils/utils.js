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

module.exports = { findLongestWord, getFontSizeRecommendation };
