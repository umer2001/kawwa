const { uploadToBucket } = require("../core-functions/storageService");
const { BlendRequest } = require("../core-functions/firebase/request");
const yup = require('yup');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');
const cors = require("cors")({ origin: true });
require("dotenv").config();

const schema = yup.object().shape({
    brandName: yup.string().required(),
    brandType: yup.string().required(),
    brandDescription: yup.string().required(),
    youtubeVideoLink: yup.string().trim().matches(
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=.+$/,
        "Invalid YouTube video link"
    )
        .required(),
    logo: yup.mixed().required(),
    approach: yup.string().oneOf(["sidebar", "background", "voice"]).required(),
});

exports.initRequest = async (req, res) => {
    return cors(req, res, () => {
        if (req.method !== "POST") {

            return res.status(405).send("Method not allowed");
        }
        const busboy = Busboy({ headers: req.headers });
        const fields = {};
        let logoPath = null;

        busboy.on('field', (fieldname, val) => {
            fields[fieldname] = val;
        });

        busboy.on('file', (fieldname, file, { filename }) => {
            fields[fieldname] = filename;
            const filepath = path.join(os.tmpdir(), filename);
            logoPath = filepath;
            file.pipe(fs.createWriteStream(filepath));
        });

        busboy.on('finish', async () => {
            await schema.validate(fields, { abortEarly: false });
            logoUrl = await uploadToBucket(process.env.RAW_BUCKET_NAME, logoPath, "logos")
            const request = {
                status: "pending",
                approach: fields.approach,
                brandName: fields.brandName,
                brandType: fields.brandType,
                brandDescription: fields.brandDescription,
                logo: logoUrl,
                youtubeVideoLink: fields.youtubeVideoLink,
                createdAt: new Date().toISOString(),
            }
            const blendRequest = new BlendRequest(request);
            const reqId = await blendRequest.createRequest();
            return res.status(200).send({
                data: {
                    ...request,
                    id: reqId,
                }
            });
        });

        busboy.end(req.rawBody);
    });
};