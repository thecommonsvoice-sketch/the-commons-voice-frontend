import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | The Commons Voice",
  description:
    "Review The Commons Voice's terms of service for news readers, contributors, and community members.",
  keywords: [
    "terms of service",
    "news portal",
    "user agreement",
    "The Commons Voice",
    "editorial policy",
    "community guidelines",
  ],
  openGraph: {
    title: "Terms of Service | The Commons Voice",
    description:
      "Understand your rights and responsibilities as a reader or contributor to The Commons Voice.",
    url: "/terms",
    siteName: "The Commons Voice",
    locale: "en_US",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <section className="space-y-6 text-base leading-relaxed">
        <p>
          Welcome to The Commons Voice, your independent source for news, analysis,
          and reporting. By accessing or using our website, you agree to comply
          with and be bound by these Terms of Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Use of Website</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>You must be at least 13 years old to use our website.</li>
          <li>
            You agree not to use the website for any unlawful purpose, to spread
            misinformation, or in violation of these terms.
          </li>
          <li>
            Automated scraping, bulk downloading, or unauthorized use of our
            content is prohibited.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          2. Editorial Independence
        </h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            The Commons Voice maintains editorial independence and strives for
            accuracy, fairness, and transparency in all published content.
          </li>
          <li>
            Opinions expressed by contributors do not necessarily reflect those
            of The Commons Voice.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">3. Intellectual Property</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            All articles, images, and other content are the property of The
            Common Voice or its licensors and are protected by copyright laws.
          </li>
          <li>
            You may not reproduce, distribute, or create derivative works from
            our content without written permission, except as permitted by fair
            use.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          4. User Contributions & Comments
        </h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            You are responsible for any content (comments, tips, submissions) you
            contribute to the website.
          </li>
          <li>
            You agree not to post abusive, defamatory, or misleading material.
          </li>
          <li>
            We reserve the right to moderate, edit, or remove user content at our
            discretion.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">5. Disclaimers</h2>
        <p>
          The website is provided "as is" without warranties of any kind. While
          we strive for accuracy, we do not guarantee the completeness or
          reliability of any content.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">
          6. Limitation of Liability
        </h2>
        <p>
          The Commons Voice is not liable for any damages arising from your use of
          the website, reliance on published information, or interactions with
          other users.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">7. Changes to Terms</h2>
        <p>
          We may update these Terms of Service at any time. Changes will be
          posted on this page with an updated effective date.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">8. Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, editorial
          policy, or community guidelines, please contact us at{" "}
          <a
            href="mailto:legal@thecommonvoice.com"
            className="underline text-primary"
          >
            legal@thecommonvoice.com
          </a>
          .
        </p>

        <p className="text-sm text-muted-foreground mt-8">
          Effective Date: August 30, 2025
        </p>
      </section>
    </main>
  );
}