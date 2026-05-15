export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getRequestsPath } from "@/lib/routes/marketplace";

export const metadata = {
  title: "Open Jobs | Fixly Pro",
};

export default function ProLeadsPage() {
  redirect(getRequestsPath("us"));
}