import { auth } from "@clerk/nextjs/server";
import Imagekit from "imagekit";
import { NextResponse } from "next/server";

const imagekit = new Imagekit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {

    console.log("API HIT");
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = await formData.get("file");
    const fileName = await formData.get("fileName");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timeStamp = Date.now();
    const sanitizedFilename =
      fileName?.replace(/[^a-zA-Z0-9]/g, "_") || "upload";
    const uniqueFileName = `${userId}/${timeStamp}_${sanitizedFilename}`;

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: uniqueFileName,
      folder: "/blog_images",
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.url,
      filedId: uploadResponse.fileId,
      width: uploadResponse.width,
      height: uploadResponse.height,
      size: uploadResponse.size,
      name: uploadResponse.name,
    });
  } catch (error) {
    console.error("Imagekit upload error : ", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
        detail: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
