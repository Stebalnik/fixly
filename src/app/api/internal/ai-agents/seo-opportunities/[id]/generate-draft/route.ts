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
    const { generatePageDraftFromOpportunity } = await import(
      "@/lib/ai-agents/page-draft-generator"
    );
    const result = await generatePageDraftFromOpportunity(id);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to generate draft.",
      },
      { status: 500 }
    );
  }
}
