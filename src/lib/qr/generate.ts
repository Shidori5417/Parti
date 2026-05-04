import { randomBytes } from "crypto";
import QRCode from "qrcode";

export function generateQrToken() {
  return randomBytes(32).toString("hex");
}

export function toQrPayload(token: string) {
  return `PARTY_TICKET:${token}`;
}

export async function toQrDataUrl(token: string) {
  return QRCode.toDataURL(toQrPayload(token), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
  });
}
