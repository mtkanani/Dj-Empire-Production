import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/AppError.js';
import { HTTP_STATUS } from '../../constants/httpStatusCodes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_ROOT = path.resolve(__dirname, '../../../uploads/identity-docs');

function isR2Configured() {
  return Boolean(env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY && env.R2_BUCKET);
}

function buildObjectKey(userId) {
  const id = crypto.randomUUID();
  return `identity-docs/${userId}/${id}`;
}

let s3ClientPromise = null;

async function getS3Client() {
  if (!isR2Configured()) return null;
  if (!s3ClientPromise) {
    s3ClientPromise = (async () => {
      const { S3Client } = await import('@aws-sdk/client-s3');
      return new S3Client({
        region: env.R2_REGION || 'auto',
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      });
    })();
  }
  return s3ClientPromise;
}

/**
 * Private object storage for identity documents.
 * Uses Cloudflare R2 when configured; falls back to local disk for development.
 * Local disk is ephemeral on Render — production must set R2_* env vars.
 */
export class ObjectStorageService {
  static isRemote() {
    return isR2Configured();
  }

  static async putObject({ userId, body, contentType }) {
    const objectKey = buildObjectKey(userId);

    if (isR2Configured()) {
      const client = await getS3Client();
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      await client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: objectKey,
          Body: body,
          ContentType: contentType,
        })
      );
      return { objectKey, storage: 'r2' };
    }

    const dest = path.join(LOCAL_ROOT, objectKey);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, body);
    return { objectKey, storage: 'local' };
  }

  static async getObjectBuffer(objectKey) {
    if (!objectKey || objectKey.includes('..') || objectKey.startsWith('/') || objectKey.includes('\\')) {
      throw new AppError('Invalid object key', HTTP_STATUS.BAD_REQUEST);
    }

    if (isR2Configured()) {
      const client = await getS3Client();
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const result = await client.send(
        new GetObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: objectKey,
        })
      );
      const chunks = [];
      for await (const chunk of result.Body) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }

    const dest = path.join(LOCAL_ROOT, objectKey);
    const resolved = path.resolve(dest);
    if (!resolved.startsWith(path.resolve(LOCAL_ROOT))) {
      throw new AppError('Invalid object key', HTTP_STATUS.BAD_REQUEST);
    }
    try {
      return await fs.readFile(resolved);
    } catch {
      throw new AppError('Identity document not found', HTTP_STATUS.NOT_FOUND);
    }
  }

  static async getSignedUrl(objectKey, expiresInSeconds = env.IDENTITY_DOC_URL_TTL_SECONDS) {
    if (!isR2Configured()) {
      return null;
    }
    const client = await getS3Client();
    const { GetObjectCommand } = await import('@aws-sdk/client-s3');
    const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: objectKey,
      }),
      { expiresIn: expiresInSeconds }
    );
  }
}
