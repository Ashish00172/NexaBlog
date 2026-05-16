import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { cloudinary, ensureCloudinaryConfigured } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    const body = await req.json();
    const folder = typeof body.folder === "string" ? body.folder : "nexablog";

    ensureCloudinaryConfigured();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder
    });
  } catch (error) {
    console.error("CLOUDINARY_SIGNATURE_ERROR", error);
    const message = error instanceof Error ? error.message : "Unable to generate upload signature";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
