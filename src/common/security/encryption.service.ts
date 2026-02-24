import { Injectable } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  scryptSync,
  randomBytes,
} from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 12;
  private readonly tagLength = 16;
  private readonly key: Buffer;

  constructor() {
    const password = process.env.ENCRYPTION_KEY;
    if (!password) {
      throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }

    this.key = scryptSync(password, 'salt-static', 32);
  }

  encrypt(text: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(base64Data: string): string {
    const data = Buffer.from(base64Data, 'base64');

    const iv = data.subarray(0, this.ivLength);
    const tag = data.subarray(this.ivLength, this.ivLength + this.tagLength);
    const encryptedText = data.subarray(this.ivLength + this.tagLength);

    const decipher = createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]).toString('utf8');
  }
}
