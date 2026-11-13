require("dotenv").config();
const axios = require("axios");

const RVC_HOST_URL = process.env.RVC_HOST_URL;
const api = axios.create({
    baseURL: RVC_HOST_URL
});


async function refresh() {
    return api.post("/api/infer_refresh", {
        data: []
    }).then((res) => res.data);
}

async function train_preprocess() {
    const result = await app.predict("/train_preprocess", [
        "Howdy!", // string  in 'Enter the path of the training folder:' Textbox component		
        "Howdy!", // string  in 'Enter the experiment name:' Textbox component		
        "40k", // string  in 'Target sample rate:' Radio component		
        0, // number (numeric value between 0 and 4) in 'Number of CPU processes used for pitch extraction and data processing:' Slider component
    ]);

    console.log(result?.data);
}

async function train_extract_f0_feature() {


    const result = await app.predict("/train_extract_f0_feature", [
        "Howdy!", // string  in 'Enter the GPU index(es) separated by '-', e.g., 0-1-2 to use GPU 0, 1, and 2:' Textbox component		
        0, // number (numeric value between 0 and 4) in 'Number of CPU processes used for pitch extraction and data processing:' Slider component		
        "pm", // string  in '选择音高提取算法:输入歌声可用pm提速,高质量语音但CPU差可用dio提速,harvest质量更好但慢,rmvpe效果最好且微吃CPU/GPU' Radio component		
        "true", // string  in 'Whether the model has pitch guidance (required for singing, optional for speech):' Radio component		
        "Howdy!", // string  in 'Enter the experiment name:' Textbox component		
        "v1", // string  in 'Version' Radio component		
        "Howdy!", // string  in 'Enter the GPU index(es) separated by '-', e.g., 0-0-1 to use 2 processes in GPU0 and 1 process in GPU1' Textbox component
    ]);

    console.log(result?.data);
}

async function train_start() {


    const result = await app.predict("/train_start", [
        "Howdy!", // string  in 'Enter the experiment name:' Textbox component		
        "40k", // string  in 'Target sample rate:' Radio component		
        "true", // string  in 'Whether the model has pitch guidance (required for singing, optional for speech):' Radio component		
        0, // number (numeric value between 0 and 4) in 'Please specify the speaker/singer ID:' Slider component		
        1, // number (numeric value between 1 and 50) in 'Save frequency (save_every_epoch):' Slider component		
        2, // number (numeric value between 2 and 1000) in 'Total training epochs (total_epoch):' Slider component		
        1, // number (numeric value between 1 and 40) in 'Batch size per GPU:' Slider component		
        "Yes", // string  in 'Save only the latest '.ckpt' file to save disk space:' Radio component		
        "Howdy!", // string  in 'Load pre-trained base model G path:' Textbox component		
        "Howdy!", // string  in 'Load pre-trained base model D path:' Textbox component		
        "Howdy!", // string  in 'Enter the GPU index(es) separated by '-', e.g., 0-1-2 to use GPU 0, 1, and 2:' Textbox component		
        "Yes", // string  in 'Cache all training sets to GPU memory. Caching small datasets (less than 10 minutes) can speed up training, but caching large datasets will consume a lot of GPU memory and may not provide much speed improvement:' Radio component		
        "Yes", // string  in 'Save a small final model to the 'weights' folder at each save point:' Radio component		
        "v1", // string  in 'Version' Radio component
    ]);

    console.log(result?.data);
}

async function one_click_train() {


    const result = await app.predict("/train_start_all", [
        "Howdy!", // string  in 'Enter the experiment name:' Textbox component		
        "40k", // string  in 'Target sample rate:' Radio component		
        "true", // string  in 'Whether the model has pitch guidance (required for singing, optional for speech):' Radio component		
        "Howdy!", // string  in 'Enter the path of the training folder:' Textbox component		
        0, // number (numeric value between 0 and 4) in 'Please specify the speaker/singer ID:' Slider component		
        0, // number (numeric value between 0 and 4) in 'Number of CPU processes used for pitch extraction and data processing:' Slider component		
        "pm", // string  in '选择音高提取算法:输入歌声可用pm提速,高质量语音但CPU差可用dio提速,harvest质量更好但慢,rmvpe效果最好且微吃CPU/GPU' Radio component		
        1, // number (numeric value between 1 and 50) in 'Save frequency (save_every_epoch):' Slider component		
        2, // number (numeric value between 2 and 1000) in 'Total training epochs (total_epoch):' Slider component		
        1, // number (numeric value between 1 and 40) in 'Batch size per GPU:' Slider component		
        "Yes", // string  in 'Save only the latest '.ckpt' file to save disk space:' Radio component		
        "Howdy!", // string  in 'Load pre-trained base model G path:' Textbox component		
        "Howdy!", // string  in 'Load pre-trained base model D path:' Textbox component		
        "Howdy!", // string  in 'Enter the GPU index(es) separated by '-', e.g., 0-1-2 to use GPU 0, 1, and 2:' Textbox component		
        "Yes", // string  in 'Cache all training sets to GPU memory. Caching small datasets (less than 10 minutes) can speed up training, but caching large datasets will consume a lot of GPU memory and may not provide much speed improvement:' Radio component		
        "Yes", // string  in 'Save a small final model to the 'weights' folder at each save point:' Radio component		
        "v1", // string  in 'Version' Radio component		
        "Howdy!", // string  in 'Enter the GPU index(es) separated by '-', e.g., 0-0-1 to use 2 processes in GPU0 and 1 process in GPU1' Textbox component
    ]);

    console.log(result?.data);
}

module.exports = {
    refresh,
    train_preprocess,
    train_extract_f0_feature,
    train_start,
    one_click_train,
}