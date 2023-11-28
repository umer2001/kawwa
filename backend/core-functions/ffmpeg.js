const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");
const { path: ffprobeStatic } = require('ffprobe-static');
const { combineAudioVideo } = require("./ytdl");

require("dotenv").config();

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic);

function cutVideoSection(inputVideo, startSecond, duration, outputVideoPath = `${process.env.TEMP_FOLDER}/cutVideo.mp4`) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(inputVideo)
            .setStartTime(startSecond)
            .duration(duration)
            .output(outputVideoPath)
            .on('error', function (err) {
                console.error('Error:', err);
                reject(err);
            })
            .on('end', function () {
                console.log('Video section cut successfully');
                resolve(outputVideoPath);
            })
            .run();
    });
}

function cutFirstHalf(inputVideo, startSecond, outputVideo = `${process.env.TEMP_FOLDER}/beforeSection.mp4`) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(inputVideo)
            .setStartTime(0)
            .setDuration(startSecond)
            .output(outputVideo)
            .on('error', function (err) {
                console.error('Error:', err);
                reject(err);
            })
            .on('end', function () {
                console.log('Before section extracted');
                resolve(outputVideo);
            })
            .run();
    });
}

function cutSecondHalf(inputVideo, startSecond, outputVideo = `${process.env.TEMP_FOLDER}/afterSection.mp4`) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(inputVideo)
            .setStartTime(startSecond)
            .output(outputVideo)
            .on('error', function (err) {
                console.error('Error:', err);
                reject(err);
            })
            .on('end', function () {
                console.log('After section extracted');
                resolve(outputVideo);
            })
            .run();
    });
}

function combineAllVideos(beforeSection, cutVideo, afterSection, outputVideo) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(beforeSection)
            .input(cutVideo)
            .input(afterSection)
            .on('progress', function (progress) {
                console.log('Processing: ' + progress.percent + '% done');
            }
            )
            .on('error', function (err) {
                console.error('Error:', err);
                reject(err);
            })
            .on('end', function () {
                console.log('Video section inserted successfully');
                resolve(outputVideo);
            })
            .mergeToFile(outputVideo);
    });
}

function generateCutVideo(inputVideoPath, inputAudioPath, insertionStartSecond, outputVideoPath) {
    return new Promise(async (resolve, reject) => {
        try {
            // Get insertion audio length (duration)
            ffmpeg.ffprobe(inputAudioPath, async function (err, metadata) {
                if (err) {
                    console.error('Error getting audio duration:', err);
                    reject(err);
                }
                const audioDuration = metadata.format.duration;
                console.log('Audio duration:', audioDuration);
                // Cut the section from the input video
                const cutVideoPath = await cutVideoSection(inputVideoPath, insertionStartSecond, audioDuration);
                // Replace audio in the cut section
                await combineAudioVideo(inputAudioPath, cutVideoPath, outputVideoPath);
                resolve(outputVideoPath);
            });
        }
        catch (err) {
            console.error('Error:', err);
            reject(err);
        }
    });
}

function insertCutSection(inputVideo, cutVideo, startSecond, outputVideoPath) {
    return new Promise(async (resolve, reject) => {
        try {
            const [beforeSection, afterSection] = await Promise.all([
                cutFirstHalf(inputVideo, startSecond),
                cutSecondHalf(inputVideo, startSecond)
            ]);
            await combineAllVideos(beforeSection, cutVideo, afterSection, outputVideoPath);
            resolve(outputVideoPath);
        }
        catch (err) {
            console.error('Error:', err);
            reject(err);
        }
    });
}

function getAudioDuration(inputAudioPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputAudioPath, function (err, metadata) {
            if (err) {
                console.error('Error getting audio duration:', err);
                reject(err);
            }
            const audioDuration = metadata.format.duration;
            console.log('Audio duration:', audioDuration);
            resolve(audioDuration);
        });
    });
}

module.exports = {
    generateCutVideo,
    insertCutSection,
    getAudioDuration
};
