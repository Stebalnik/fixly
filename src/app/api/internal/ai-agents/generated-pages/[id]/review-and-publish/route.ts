import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth/admin";

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
    const { reviewAndPublishGeneratedPage } = await import(
      "@/lib/ai-agents/page-quality-review-agent"
    );
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
