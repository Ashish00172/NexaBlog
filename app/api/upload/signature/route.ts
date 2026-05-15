import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    const body = await req.json();
    const folder = typeof body.folder === "string" ? body.folder : "nexablog";

    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = { timestamp, folder };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET as string);

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder
    });
  } catch (error) {
    console.error("CLOUDINARY_SIGNATURE_ERROR", error);
    return NextResponse.json({ error: "Unable to generate upload signature" }, { status: 500 });
  }
}
