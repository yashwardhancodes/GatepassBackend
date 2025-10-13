
import QRCode from "qrcode";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export const generateQrAndUpload = async (text: string): Promise<string> => {
  const qrDataURL = await QRCode.toDataURL(text, { errorCorrectionLevel: "H", margin: 1 });
  const base64Data = qrDataURL.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "gatepass_qrcodes" },
      (error, response) => {
        if (error) return reject(error);
        resolve(response?.secure_url);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};
