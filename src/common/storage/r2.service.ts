import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Readable } from "node:stream";

type PutObjectBody = string | Uint8Array | Buffer | Readable;

@Injectable()
export class R2Service {
  private readonly bucket: string;
  private readonly client: S3Client;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>("r2.endpoint");
    const bucket = this.configService.get<string>("r2.bucket");
    const accessKeyId = this.configService.get<string>("r2.accessKeyId");
    const secretAccessKey =
      this.configService.get<string>("r2.secretAccessKey");
    const region = this.configService.get<string>("r2.region", "auto");

    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "R2 configuration is missing. Please set R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.",
      );
    }

    this.bucket = bucket;
    this.endpoint = endpoint.replace(/\/$/, "");
    this.client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadObject(
    key: string,
    body: PutObjectBody,
    contentType?: string,
  ): Promise<{ bucket: string; key: string }> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return { bucket: this.bucket, key };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async getObjectStream(key: string) {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return response.Body;
  }

  async getSignedUrl(key: string, expiresInSeconds = 300): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  getPublicUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  getKeyFromUrl(url: string): string | undefined {
    const prefix = `${this.endpoint}/${this.bucket}/`;
    if (url.startsWith(prefix)) {
      return url.slice(prefix.length);
    }
    return undefined;
  }
}
