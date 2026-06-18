import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/account";
import { recordPlatformEvent } from "@/lib/analytics/platform-events";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "pro-profile-media";
const MAX_FILE_SIZE = 750_000;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Profile photo is required." },
      { status: 400 }
    );
  }

  const extension = MIME_EXTENSIONS[file.type];

  if (!extension) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, or WebP image." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Profile photo is too large after compression." },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  const { data: profile, error: profileError } = await admin
    .from("pro_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: "Unable to verify pro profile." },
      { status: 500 }
    );
  }

  if (!profile) {
    return NextResponse.json(
      { error: "Create your pro profile before uploading a photo." },
      { status: 404 }
    );
  }

  const path = `${user.id}/avatar.${extension}`;
  const upload = await admin.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: true,
  });

  if (upload.error) {
    console.error("Failed to upload pro avatar", upload.error);

    return NextResponse.json(
      { error: "Unable to upload profile photo." },
      { status: 500 }
    );
  }

  const publicUrl = admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const versionedUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await admin
    .from("pro_profiles")
    .update({
      avatar_url: versionedUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Failed to save pro avatar URL", updateError);

    return NextResponse.json(
      { error: "Photo uploaded, but profile was not updated." },
      { status: 500 }
    );
  }

  await recordPlatformEvent({
    eventName: "pro_avatar_uploaded",
    eventGroup: "accounts",
    actorUserId: user.id,
    entityType: "pro_profile",
    entityId: user.id,
    metadata: {
      bucket: BUCKET,
      path,
      size: file.size,
      type: file.type,
    },
  });

  return NextResponse.json({
    ok: true,
    avatarUrl: versionedUrl,
  });
}
