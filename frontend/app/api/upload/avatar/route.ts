export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json()

    const region = process.env.NEXT_PUBLIC_S3_REGION
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      return NextResponse.json({ error: "Missing S3 env vars" }, { status: 500 })
    }

    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")
    const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner")

    const extension = fileName.split(".").pop() || "jpg"
    const key = `avatars/${crypto.randomUUID()}.${extension}`

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    })

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return NextResponse.json({
      uploadUrl,
      publicUrl,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to create upload URL",
        detail: error?.message,
      },
      { status: 500 }
    )
  }
}