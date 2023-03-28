// upload a vido from videos folder in current directory to google cloud storage bucket
// and return the public url of the video

require("dotenv").config();
const ytdl = require("ytdl-core");
const fs = require("fs");

async function downloadVideo(videoUrl) {
  // vide with audio
  const video = ytdl(videoUrl, {
    filter: (format) => format.qualityLabel === "720p" && format.hasAudio,
  });

  video.on("info", function (info) {
    console.log("Downloading video: " + info.videoDetails.title);
    console.log(
      "length: " +
        (info.videoDetails.lengthSeconds / 60).toFixed(2) +
        " minutes"
    );
    console.log("Category: " + info.videoDetails.category);
    console.log("Keywords: " + info.videoDetails.keywords);
  });

  const videoID = videoUrl.split("=")[1];
  video.pipe(fs.createWriteStream(`raw/${videoID}.mp4`));

  return new Promise((resolve, reject) => {
    video.on("end", () => {
      console.info("Video downloaded successfully");
      resolve(`raw/${videoID}.mp4`);
    });
    video.on("error", (err) => {
      console.error("Error downloading video");
      console.error(err);
      reject(null);
    });
  });
}

module.exports = downloadVideo;
