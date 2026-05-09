import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/account";
import { markNotificationRead } from "@/lib/notifications";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Login required." },
      { status: 401 }
    );
  }

  const { id } = await context.params;

  await markNotificationRead({
    notificationId: id,
    userId: user.id,
  });

  return NextResponse.json({
    ok: true,
  });
}