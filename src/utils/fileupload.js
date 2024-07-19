import AWS from 'aws-sdk';
import fs, { unlink, unlinkSync, readFileSync } from "fs";

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

const s3 = new AWS.S3();  
const bucketname= process.env.AWS_BUCKET

const uploadons3 = async (localFilePath, localFileName) => {
    try {
        if(!localFilePath) return null
        const fileContent = fs.readFileSync(localFilePath)
        const params = {Bucket: bucketname, Key: localFileName, Body: fileContent};
        const data = await s3.upload(params).promise();
        console.log("file uploaded", data.Location);
        fs.unlinkSync(localFilePath)
        return data;

    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadons3}
