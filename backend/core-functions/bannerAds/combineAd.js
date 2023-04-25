const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegStatic);

async function combineAd(videoPath, adPath, outputVideoPath, adWidth = 256) {
  // ffmpeg add paddind on only left side of video
  const video = ffmpeg(videoPath)
    .addInput(adPath)
    .complexFilter([
      {
        filter: "scale",
        options: {
          w: "iw",
          h: "ih",
        },
        inputs: "1",
        outputs: "scaled",
      },
      {
        filter: "pad",
        options: {
          w: `iw+${adWidth}`,
          h: "ih",
          x: `${adWidth}`,
          y: "0",
          color: "yellow",
        },
        outputs: "padded",
      },
      {
        filter: "overlay",
        options: {
          x: "0",
          y: "0",
        },
        inputs: ["padded", "scaled"],
      },
    ])
    .save(outputVideoPath);

  video.on("progress", (progress) => {
    if (progress.percent) {
      console.log(`Processing: ${Math.floor(progress.percent)}% done`);
    }
  });

  return new Promise((resolve, reject) => {
    video.on("end", function () {
      console.log("Finished processing");
      resolve(outputVideoPath);
    });

    video.on("error", (error) => {
      console.error(error);
      reject(err);
    });
  });
}

module.exports = combineAd;
