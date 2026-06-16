import { requireAdminUser } from "@/lib/auth/admin";
import { runGscPageIndexingImportAgent } from "@/lib/ai-agents/gsc-url-issue-audit-agent";
import { readGscPageIndexingImportOptions } from "@/lib/ai-agents/gsc-url-issue-route-options";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  await requireAdminUser();

  try {
    const options = await readGscPageIndexingImportOptions(request);

    if (options.rows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "No import rows found. Send JSON { reason, urls } / { rows } or CSV with a URL column.",
        },
        { status: 400 }
      );
    }

    const result = await runGscPageIndexingImportAgent(options);

    return NextResponse.json({
      ...result,
      message: "Imported successfully. Run audit next.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "GSC page indexing import failed.",
      },
      { status: 500 }
    );
  }
}
