"use strict";
const pulumi = require("@pulumi/pulumi");
const gcp = require("@pulumi/gcp");
const archive = require("@pulumi/archive");
require("dotenv").config();

// package the code
const code = archive.getFile({
    type: "zip",
    sourceDir: "../backend",
    excludes: [".env", "raw", "tmp", "node_modules", ".pulumi"],
    outputPath: "functions_payload.zip",
}).then((result) => result.outputPath);


// service account
const serviceAccount = new gcp.serviceaccount.Account("kawwa", {
    accountId: "sakawwa",
    displayName: "Kawwa",
});

// buckets
const codeBucket = new gcp.storage.Bucket("kawwa-code", {
    location: "us"
});
const rawContentBucket = new gcp.storage.Bucket("raw-kawwa", {
    location: "asia-south2",
});
const videoBucket = new gcp.storage.Bucket("kawwa", {
    location: "asia-south2",
});

// bucket permissions/polices
new gcp.storage.DefaultObjectAccessControl("publicReadAcl", {
    bucket: videoBucket.name,
    role: "READER",
    entity: "allUsers",
});

new gcp.storage.BucketIAMMember("storeVideoBucketMember", {
    bucket: rawContentBucket.name,
    role: "roles/storage.admin",
    member: `serviceAccount:${process.env.SERVICE_ACCOUNT_EMAIL}`,
});

new gcp.storage.BucketIAMMember("embedBannerBucketMember", {
    bucket: videoBucket.name,
    role: "roles/storage.objectCreator",
    member: `serviceAccount:${process.env.SERVICE_ACCOUNT_EMAIL}`,
});

// Topics and subscriptions
const approachInitializerTopic = new gcp.pubsub.Topic("approachInitializer");
const sidebarTopic = new gcp.pubsub.Topic("sidebar");
const voiceTopic = new gcp.pubsub.Topic("voice");
const voiceInitTopic = new gcp.pubsub.Topic("generateSubtitles");

new gcp.projects.IAMMember("sidebarPublisher", {
    project: process.env.GCP_PROJECT_ID,
    role: "roles/pubsub.publisher",
    member: `serviceAccount:${process.env.SERVICE_ACCOUNT_EMAIL}`,
});

// fire store
const firestore = new gcp.firestore.Database("kawwa", {
    name: "(default)",
    locationId: "asia-south2",
    type: "FIRESTORE_NATIVE",
});

new gcp.projects.IAMMember("firestoreAdmin", {
    project: process.env.GCP_PROJECT_ID,
    role: "roles/datastore.owner",
    member: `serviceAccount:${process.env.SERVICE_ACCOUNT_EMAIL}`,
});


// Create a Cloud Function using the bucket object
const codeObject = new gcp.storage.BucketObject("functionArchiveBucketObject", {
    bucket: codeBucket.name,
    source: new pulumi.asset.FileArchive(code),
});

// cloud functions
const TIME_OUT = 540;
const initRequest = new gcp.cloudfunctions.Function("initRequest", {
    serviceAccountEmail: serviceAccount.email,
    sourceArchiveBucket: codeBucket.name,
    sourceArchiveObject: codeObject.name,
    entryPoint: "initRequest",
    runtime: "nodejs16",
    availableMemoryMb: 512,
    triggerHttp: true,
    environmentVariables: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        RAW_BUCKET_NAME: rawContentBucket.name,
        TEMP_FOLDER: process.env.TEMP_FOLDER,
        FIRESTORE_DB_NAME: firestore.name,
    },
});

const storeVideo = new gcp.cloudfunctions.Function("storeVideo", {
    serviceAccountEmail: serviceAccount.email,
    sourceArchiveBucket: codeBucket.name,
    sourceArchiveObject: codeObject.name,
    entryPoint: "storeVideo",
    runtime: "nodejs16",
    timeout: TIME_OUT,
    availableMemoryMb: 512,
    eventTrigger: {
        eventType: "providers/cloud.firestore/eventTypes/document.create",
        resource: `projects/${process.env.GCP_PROJECT_ID}/databases/(default)/documents/requests/{requestId}`,
    },
    environmentVariables: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        RAW_BUCKET_NAME: rawContentBucket.name,
        TEMP_FOLDER: process.env.TEMP_FOLDER,
        FIRESTORE_DB_NAME: firestore.name,
        APPROACH_INITIALIZER_TOPIC: approachInitializerTopic.name,
    },
});

new gcp.cloudfunctions.FunctionIamMember("invoker", {
    cloudFunction: initRequest.name,
    role: "roles/cloudfunctions.invoker",
    member: "allUsers",
});

const approachInitializer = new gcp.cloudfunctions.Function("approachInitializer", {
    serviceAccountEmail: serviceAccount.email,
    sourceArchiveBucket: codeBucket.name,
    sourceArchiveObject: codeObject.name,
    entryPoint: "approachInitializer",
    runtime: "nodejs16",
    availableMemoryMb: 8192,
    eventTrigger: {
        eventType: "google.pubsub.topic.publish",
        resource: approachInitializerTopic.name,
    },
    environmentVariables: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        RAW_BUCKET_NAME: rawContentBucket.name,
        TEMP_FOLDER: process.env.TEMP_FOLDER,
        FIRESTORE_DB_NAME: firestore.name,
        SIDEBAR_TOPIC: sidebarTopic.name,
        VOICE_INIT_TOPIC: voiceInitTopic.name,
    },
});

const embedBanner = new gcp.cloudfunctions.Function("embedBanner", {
    serviceAccountEmail: serviceAccount.email,
    sourceArchiveBucket: codeBucket.name,
    sourceArchiveObject: codeObject.name,
    entryPoint: "embedBanner",
    runtime: "nodejs16",
    timeout: TIME_OUT,
    availableMemoryMb: 8192,
    eventTrigger: {
        eventType: "google.pubsub.topic.publish",
        resource: sidebarTopic.name,
    },
    environmentVariables: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        RAW_BUCKET_NAME: rawContentBucket.name,
        TARGET_BUCKET_NAME: videoBucket.name,
        TEMP_FOLDER: process.env.TEMP_FOLDER,
        FIRESTORE_DB_NAME: firestore.name,
    },
});

const generateSubtitlesWebhook = new gcp.cloudfunctions.Function("generateSubtitlesWebhook", {
    serviceAccountEmail: serviceAccount.email,
    sourceArchiveBucket: codeBucket.name,
    sourceArchiveObject: codeObject.name,
    entryPoint: "generateSubtitlesWebhook",
    runtime: "nodejs16",
    timeout: TIME_OUT,
    availableMemoryMb: 512,
    triggerHttp: true,
    environmentVariables: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        RAW_BUCKET_NAME: rawContentBucket.name,
        TEMP_FOLDER: process.env.TEMP_FOLDER,
        FIRESTORE_DB_NAME: firestore.name,
        VOICE_TOPIC: voiceTopic.name,
    },
});

new gcp.cloudfunctions.FunctionIamMember("generateSubtitlesWebhookInvoker", {
    cloudFunction: generateSubtitlesWebhook.name,
    role: "roles/cloudfunctions.invoker",
    member: "allUsers",
});

const generateSubtitles = new gcp.cloudfunctions.Function("generateSubtitles", {
    serviceAccountEmail: serviceAccount.email,
    sourceArchiveBucket: codeBucket.name,
    sourceArchiveObject: codeObject.name,
    entryPoint: "generateSubtitles",
    runtime: "nodejs16",
    timeout: TIME_OUT,
    availableMemoryMb: 512,
    eventTrigger: {
        eventType: "google.pubsub.topic.publish",
        resource: voiceInitTopic.name,
    },
    environmentVariables: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        RAW_BUCKET_NAME: rawContentBucket.name,
        TEMP_FOLDER: process.env.TEMP_FOLDER,
        FIRESTORE_DB_NAME: firestore.name,
        AFTER_SUBTITLE_WEEBHOOK_URL: generateSubtitlesWebhook.httpsTriggerUrl,
        VOICE_TOPIC: voiceTopic.name,
    },
});

const embedVoice = new gcp.cloudfunctions.Function("embedVoice", {
    serviceAccountEmail: serviceAccount.email,
    sourceArchiveBucket: codeBucket.name,
    sourceArchiveObject: codeObject.name,
    entryPoint: "embedVoice",
    runtime: "nodejs16",
    timeout: TIME_OUT,
    availableMemoryMb: 8192,
    eventTrigger: {
        eventType: "google.pubsub.topic.publish",
        resource: voiceTopic.name,
    },
    environmentVariables: {
        GCP_PROJECT_ID: process.env.GCP_PROJECT_ID,
        FIRESTORE_DB_NAME: firestore.name,
        RAW_BUCKET_NAME: rawContentBucket.name,
        TEMP_FOLDER: process.env.TEMP_FOLDER,
        TARGET_BUCKET_NAME: videoBucket.name,
    },
});

const rvcVm = new gcp.compute.Instance("rvc-v2", {
    machineType: "g2-standard-4",
    scheduling: {
        onHostMaintenance: "TERMINATE",
    },
    bootDisk: {
        initializeParams: {
            image: "ubuntu-os-cloud/ubuntu-2004-focal-v20231101",
            size: 80,
        },
    },
    // allow http traffic
    networkInterfaces: [
        {
            network: "default",
            accessConfigs: [{}], // must be empty to request an ephemeral IP
        },
    ],
    serviceAccount: {
        email: serviceAccount.email,
        scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    },
    // metadataStartupScript: `#!/bin/bash
    // sudo cos-extensions install gpu
    // cd ~
    // git clone https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI.git
    // cd Retrieval-based-Voice-Conversion-WebUI
    // sed -i '/no_proxy/d' .env
    // docker build -t rvc .
    // docker run -d -p 80:7865 --name rvc  --volume /var/lib/nvidia/lib64:/usr/local/nvidia/lib64 --volume /var/lib/nvidia/bin:/usr/local/nvidia/bin --device /dev/nvidia0:/dev/nvidia0 --device /dev/nvidia-uvm:/dev/nvidia-uvm --device /dev/nvidiactl:/dev/nvidiactl --volume ./weights:/app/assets/weights --volume ./opt:/app/opt --volume ./dataset:/app/dataset rvc
    // `,
});

// Allow HTTP traffic
new gcp.compute.Firewall("http-firewall", {
    network: "default",
    allows: [{
        protocol: "tcp",
        ports: ["80", "443"],
    }],
    sourceRanges: ["0.0.0.0/0"],
});

// Export the URL of the function
exports.serviceAccountEmail = serviceAccount.email;
exports.rawContentBucket = rawContentBucket.name;
exports.videoBucket = videoBucket.name;
exports.sidebarTopic = sidebarTopic.name;
exports.voiceTopic = voiceTopic.name;
exports.voiceInitTopic = voiceInitTopic.name;
exports.initRequest = initRequest.httpsTriggerUrl;
exports.storeVideo = storeVideo.httpsTriggerUrl;
exports.approachInitializer = approachInitializer.name;
exports.embedBanner = embedBanner.name;
exports.generateSubtitles = generateSubtitles.name;
exports.generateSubtitlesWebhook = generateSubtitlesWebhook.httpsTriggerUrl;
exports.embedVoice = embedVoice.name;
exports.firestore = firestore.name;
// exports.rvcVm = rvcVm.name;
