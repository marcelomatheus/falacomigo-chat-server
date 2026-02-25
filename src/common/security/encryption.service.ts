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
    if (typeof text !== 'string') {
      throw new TypeError('Text to encrypt must be a string');
    }
    try {
      const iv = randomBytes(this.ivLength);
      const cipher = createCipheriv(this.algorithm, this.key, iv);
      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();
      return Buffer.concat([iv, authTag, encrypted]).toString('base64');
    } catch (error) {
      throw new Error(`Encryption failed: ${(error as Error).message}`);
    }
  }

  decrypt(base64Data: string): string {
    try {
      const data = Buffer.from(base64Data, 'base64');

      if (data.length < this.ivLength + this.tagLength) {
        throw new Error('Data too short to be valid encrypted content');
      }

      const iv = data.subarray(0, this.ivLength);
      const tag = data.subarray(this.ivLength, this.ivLength + this.tagLength);
      const encryptedText = data.subarray(this.ivLength + this.tagLength);

      const decipher = createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(tag);

      return Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      return "Mensagem indisponível.";
    }
  }
}
