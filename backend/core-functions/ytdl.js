const ytdl = require("ytdl-core"); // External modules
const ffmpegStatic = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

require("dotenv").config();
ffmpeg.setFfmpegPath(ffmpegStatic);

async function downloadAudio(videoUrl) {
  const outputPath = `${process.env.TEMP_FOLDER}/${videoUrl.split("=")[1]}.mp3`;
  const audio = ytdl(videoUrl, { quality: "highestaudio" });
  audio.pipe(fs.createWriteStream(outputPath));
  if (process.env.NODE_ENV === "development") {
    audio.on("progress", (proress) => {
      console.log("Audio", proress);
    });
  }
  return new Promise((resolve, reject) => {
    audio.on("end", () => {
      console.log("Audio downloaded");
      resolve(outputPath);
    });

    audio.on("error", (error) => {
      console.error(error);
      reject(error);
    });
  });
}

async function downloadVideo(videoUrl) {
  const outputPath = `${process.env.TEMP_FOLDER}/${videoUrl.split("=")[1]}.mp4`;
  const video = ytdl(videoUrl, {
    filter: (format) => format.qualityLabel === "720p",
  });
  video.pipe(fs.createWriteStream(outputPath));
  if (process.env.NODE_ENV === "development") {
    video.on("progress", (proress) => {
      console.log("Video", proress);
    });
  }
  return new Promise((resolve, reject) => {
    video.on("end", () => {
      console.log("video downloaded");
      resolve(outputPath);
    });

    video.on("error", (error) => {
      console.error(error);
      reject(error);
    });
  });
}

async function combineAudioVideo(
  audioPath,
  videoPath,
  outputPath = "tmp/merged.mp4"
) {
  if (!audioPath || !videoPath) {
    throw new Error("Audio or video path is missing");
  }
  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput(videoPath)
      .addInput(audioPath)
      .addOptions(["-map 0:v", "-map 1:a", "-c:v copy"])
      .format("mp4")
      .saveToFile(outputPath)
      .on("progress", (progress) => {
        console.log("Merged");
      })
      .on("end", () => {
        console.log("Muxed Successfully!");
        resolve(outputPath);
      });
  });
}

module.exports = {
  downloadAudio,
  downloadVideo,
  combineAudioVideo,
};
