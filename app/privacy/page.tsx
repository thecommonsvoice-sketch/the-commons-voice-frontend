import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | The Commons Voice",
  description: "Read The Commons Voice's privacy policy to learn how we collect, use, and protect your information.",
  keywords: ["privacy policy", "data protection", "user information", "The Commons Voice", "news portal"],
  openGraph: {
    title: "Privacy Policy | The Commons Voice",
    description: "Learn how The Commons Voice collects, uses, and protects your personal information.",
    url: "/privacy",
    siteName: "The Commons Voice",
    locale: "en_US",
    type: "article",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <section className="space-y-6 text-base leading-relaxed">
        <p>
          At The Commons Voice, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our news portal.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">1. Information We Collect</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>
            <strong>Personal Information:</strong> Name, email address, and other contact details you provide when contacting us, signing up, or submitting news tips.
          </li>
          <li>
            <strong>Usage Data:</strong> Information about how you use our website, such as pages visited, articles read, time spent, and device/browser information.
          </li>
          <li>
            <strong>Cookies:</strong> We use cookies and similar technologies to enhance your experience, remember preferences, and analyze site usage.
          </li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>To provide, operate, and maintain our news portal and services.</li>
          <li>To communicate with you, respond to inquiries, and send updates or newsletters (if subscribed).</li>
          <li>To improve our website, content, and user experience.</li>
          <li>To comply with legal obligations and protect our rights.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">3. Sharing Your Information</h2>
        <p>
          We do not sell or rent your personal information. We may share information with trusted service providers who assist us in operating our website, or if required by law or to protect our rights.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">4. Data Security</h2>
        <p>
          We implement reasonable security measures to protect your information. However, no method of transmission over the Internet or electronic storage is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">5. Your Rights</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>You may request access to, correction of, or deletion of your personal information.</li>
          <li>Contact us at <a href="mailto:privacy@thecommonvoice.com" className="underline text-primary">privacy@thecommonvoice.com</a> for privacy-related requests.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-2">6. Third-Party Links</h2>
        <p>
          Our news portal may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2">8. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@thecommonvoice.com" className="underline text-primary">privacy@thecommonvoice.com</a>.
        </p>

        <p className="text-sm text-muted-foreground mt-8">Effective Date: August 30, 2025</p>
      </section>
    </main>
  );
}