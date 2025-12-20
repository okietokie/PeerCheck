import dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.resolve('./server/.env') });  
console.log('Loaded R2 keys in server:', process.env.R2_ACCESS_KEY_ID, process.env.R2_SECRET_ACCESS_KEY);

import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});


export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;


console.log("\naccesskey: ", process.env.R2_ACCESS_KEY_ID, "\nsecretaccesskey: ", process.env.R2_SECRET_ACCESS_KEY, "\nbucketname: ", process.env.R2_BUCKET_NAME, "\n")
