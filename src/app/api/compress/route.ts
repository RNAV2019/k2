// app/api/compress/route.ts
import { NextResponse } from "next/server";
import sharp, { type AvailableFormatInfo, format } from "sharp";

export async function POST(request: Request) {
  try {
    // Get the file from the request
    const data = await request.formData();
    const file = data.get("file") as Blob | null;
    const filetype = (data.get("filetype") as string | null) ?? "webp";
    const quality = (data.get("quality") as string | null) ?? "80";
    const scale = (data.get("scale") as string | null) ?? "100";
    const width = (data.get("width") as string | null) ?? "100";
    const height = (data.get("height") as string | null) ?? "100";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert filetype
    let newFiletype: AvailableFormatInfo;
    if (filetype == "jpg") {
      newFiletype = format.jpg;
    } else if (filetype == "png") {
      newFiletype = format.png;
    } else {
      newFiletype = format.webp;
    }
    const newWidth = Math.floor((parseFloat(scale) / 100) * parseFloat(width));
    const newHeight = Math.floor(
      (parseFloat(scale) / 100) * parseFloat(height),
    );
    // Compress and optimize the image
    const optimizedImageBuffer = await sharp(buffer)
      .resize({ width: newWidth, height: newHeight })
      .toFormat(newFiletype, { quality: parseInt(quality), compression: "av1" })
      .toBuffer();

    // Return the optimized image as a response
    return new Response(optimizedImageBuffer, {
      headers: {
        "Content-Type": `image/${filetype}`,
        "Content-Disposition": `attachment; filename='optimized.${filetype}'`,
      },
    });
  } catch (error) {
    console.error("Error compressing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 },
    );
  }
}
