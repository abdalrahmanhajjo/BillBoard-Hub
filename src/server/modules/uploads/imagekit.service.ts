import { getUploadAuthParams } from '@imagekit/next/server';
import { HttpError } from '@/server/http/http-error';

export type ImageKitAuthParams = {
  token: string;
  signature: string;
  expire: number;
  publicKey: string;
};

/**
 * Client-direct upload flow: the browser uploads straight to ImageKit using
 * short-lived credentials signed here with the private key. The private key
 * never leaves the server.
 */
export const imagekitUploadService = {
  getAuthParams(): ImageKitAuthParams {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      throw new HttpError(503, 'Image uploads are not configured.');
    }

    const { token, signature, expire } = getUploadAuthParams({ privateKey, publicKey });

    return { token, signature, expire, publicKey };
  },
};
