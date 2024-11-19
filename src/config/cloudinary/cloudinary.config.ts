// cloudinary.config.ts
import { registerAs } from '@nestjs/config';
import { CLOUD_KEY, CLOUD_NAME, CLOUD_SECRET } from '../enviroments';

export default registerAs('cloudinary', () => ({
  cloudName: CLOUD_NAME,
  apiKey: CLOUD_KEY,
  apiSecret: CLOUD_SECRET,
}));