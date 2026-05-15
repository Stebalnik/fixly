export const dynamic = "force-dynamic";

import { Suspense } from "react";
import PublicPageShell from "@/components/PublicPageShell";
import BookRequestForm from "@/features/booking/BookRequestForm";

export const metadata = {
  title: "Request Home Service | Fixly",
  description:
    "Tell Fixly what home service you need and get responses from local pros.",
};

function BookRequestFormFallback() {
  return (
    <div className="card">
      <p>Loading request form...</p>
    </div>
  );
}

export default function BookPage() {
  return (
    <PublicPageShell>
      <main className="page">
        <section className="service-hero">
          <div className="container">
            <p className="eyebrow">Request service</p>

            <h1>Tell us what you need</h1>

            <p className="hero-text">
              Choose a service, select your city, and describe the job. Local
              pros will be able to respond.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container-narrow">
            <Suspense fallback={<BookRequestFormFallback />}>
              <BookRequestForm />
            </Suspense>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}