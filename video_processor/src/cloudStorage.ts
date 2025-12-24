import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

// init gcs
const storage = new Storage();

// cloud storage bucket names
const rawVideoBucketName = 'pzha-raw-videos';
const processedVideoBucketName = 'pzha-processed-videos';

// local storage paths
const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = './processed-videos/';

// create local directories for both raw and processed videos
export function setupDirectories() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
}

export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // scale video to 360p
        .on("end", () => {
            console.log("Video processing successfully completed.");
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            reject();
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}` });
    
    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`
    );
}

export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`@{localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );

    await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.log(`Error deleting file at path ${filePath}: ${err.message}`);
                    reject(err);
                } else {
                    console.log(`File at path ${filePath} deleted successfully.`);
                    resolve();
                }
            });  
        } else {
            console.log(`File at path ${filePath} does not exist.`);
            
        }
    });
}

function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // create parent directories if they do not exist
        console.log(`Directory created at path: ${dirPath}`);
    }
}