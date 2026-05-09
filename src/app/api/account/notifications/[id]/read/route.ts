import { NextResponse } from "next/server";
import { getAccountContext } from "@/lib/auth/account";
import { markNotificationRead } from "@/lib/notifications";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const account = await getAccountContext();
  const { id } = await params;

  await markNotificationRead({
    notificationId: id,
    userId: account.user.id,
  });

  return NextResponse.json({ ok: true });
}