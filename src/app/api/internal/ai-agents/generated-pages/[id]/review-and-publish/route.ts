import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";
import { reviewAndPublishGeneratedPage } from "@/lib/ai-agents/page-quality-review-agent";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: RouteProps) {
  await requireAdminUser();

  const { id } = await params;

  try {
    const result = await reviewAndPublishGeneratedPage(id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to review and publish page.",
      },
      { status: 500 }
    );
  }
}