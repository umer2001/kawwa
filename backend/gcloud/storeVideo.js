const {
  downloadAudio,
  downloadVideo,
  combineAudioVideo,
} = require("../core-functions/ytdl");
const uploadToBucket = require("../core-functions/uploadToBucket");
const ytdl = require("ytdl-core");
require("dotenv").config();

exports.storeVideo = async (req, res) => {
  try {
    const { videoUrl } = req.query;
    console.info("videoUrl", videoUrl);
    // print info
    const info = await ytdl.getInfo(videoUrl);
    console.info("info", info);

    // download audio & video
    const [audioPath, videoPath] = await Promise.all([
      downloadAudio(videoUrl),
      downloadVideo(videoUrl),
    ]);

    // combine audio and video into single file
    const outputPath = `${process.env.TEMP_FOLDER}/${
      videoUrl.split("=")[1]
    }-merged.mp4`;
    const combinedPath = await combineAudioVideo(
      audioPath,
      videoPath,
      outputPath
    );

    if (combinedPath) {
      console.info(`Video combined to: ${combinedPath}`);
      uploadToBucket(process.env.RAW_BUCKET_NAME, combinedPath).then(
        (result) => {
          console.info("result", result);
          res.status(200).send(
            JSON.stringify({
              body: result,
            })
          );
        }
      );
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(
      JSON.stringify({
        body: error,
      })
    );
  }
};
