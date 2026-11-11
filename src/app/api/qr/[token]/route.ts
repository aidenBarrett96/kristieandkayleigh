import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/site";

// Returns a PNG QR code that points at the guest's personal RSVP link.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const url = `${siteUrl()}/rsvp/${token}`;

  const png = await QRCode.toBuffer(url, {
    type: "png",
    width: 640,
    margin: 2,
    color: { dark: "#3A3A38", light: "#ECEAE6" },
  });

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
