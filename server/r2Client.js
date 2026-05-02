//server/r2Client.js
import dotenv from "dotenv";
import path from 'path';
dotenv.config({ path: path.resolve('./server/.env') });  

import { S3Client } from "@aws-sdk/client-s3"; // used to interact with AWS S3 service
// Create an S3 client configured for Cloudflare R2
//r2 stands for "Reliable, Rapid, and Redundant" object storage by Cloudflare

export const r2Client = new S3Client({
  region: "auto", // R2 uses 'auto' region
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, // R2 endpoint
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID, 
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});


export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

export const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;