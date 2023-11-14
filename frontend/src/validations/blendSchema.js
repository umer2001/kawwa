import * as yup from "yup";

export const blendSchema = yup.object().shape({
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