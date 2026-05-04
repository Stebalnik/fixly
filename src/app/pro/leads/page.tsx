import { redirect } from "next/navigation";

export const metadata = {
  title: "Open Leads | Fixly Pro",
};

export default function ProLeadsPage() {
  redirect("/requests");
}