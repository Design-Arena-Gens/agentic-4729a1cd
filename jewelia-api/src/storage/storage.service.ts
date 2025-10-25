import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private s3 = new S3Client({ region: process.env.AWS_REGION, credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID!, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! } });

  async presign(key: string, contentType: string) {
    const command = new PutObjectCommand({ Bucket: process.env.AWS_S3_BUCKET!, Key: key, ContentType: contentType, ACL: 'public-read' as any });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 600 });
    const publicUrl = `${process.env.ASSETS_CDN_BASE || ''}/${key}`.replace(/\/+/, '/');
    return { url, publicUrl, key, contentType, expiresIn: 600 };
  }
}
