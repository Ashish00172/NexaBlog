import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const mediaPayload = z.object({
  secureUrl: z.string().url(),
  publicId: z.string().min(1),
  resource: z.string().min(1),
  format: z.string().optional(),
  bytes: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  blogId: z.string().cuid().optional()
});

export async function POST(req: Request) {
  try {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult.error;

    const body = await req.json();
    const parsed = mediaPayload.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const media = await prisma.media.create({
      data: {
        secureUrl: parsed.data.secureUrl,
        publicId: parsed.data.publicId,
        resource: parsed.data.resource,
        format: parsed.data.format,
        bytes: parsed.data.bytes,
        width: parsed.data.width,
        height: parsed.data.height,
        blogId: parsed.data.blogId,
        userId: authResult.user.id
      }
    });

    return NextResponse.json({ data: media }, { status: 201 });
  } catch (error) {
    console.error("UPLOAD_MEDIA_ERROR", error);
    return NextResponse.json({ error: "Unable to save media" }, { status: 500 });
  }
}
