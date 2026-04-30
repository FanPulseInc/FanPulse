export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
      const body = await req.json()

      return NextResponse.json({
        ok: true,
        message: "JSON POST reached avatar route",
        body,
      })
    }

    const region = process.env.NEXT_PUBLIC_S3_REGION
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME
    const accessKeyId = process.env.S3_ACCESS_KEY_ID
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY

    if (!region || !bucket || !accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        {
          error: "Missing S3 env vars",
          region: !!region,
          bucket: !!bucket,
          accessKeyId: !!accessKeyId,
          secretAccessKey: !!secretAccessKey,
        },
        { status: 500 }
      )
    }

    const { PutObjectCommand, S3Client } = await import("@aws-sdk/client-s3")

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const extension = file.name.split(".").pop() || "jpg"
    const fileName = `avatars/${crypto.randomUUID()}.${extension}`

    const s3 = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    )

    return NextResponse.json({
      url: `https://${bucket}.s3.${region}.amazonaws.com/${fileName}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Upload failed",
        detail: error?.message,
        code: error?.name || error?.Code,
      },
      { status: 500 }
    )
  }
}