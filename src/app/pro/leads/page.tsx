export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export const metadata = {
  title: "Open Jobs | Fixly Pro",
};

export default function ProLeadsPage() {
  redirect("/requests");
}