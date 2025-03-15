import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - BingeBox",
  description: "Terms of Service for using BingeBox",
}

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container px-4 py-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-semibold mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using BingeBox, you agree to be bound by these Terms
            of Service. If you do not agree to all the terms and conditions, you
            must not access or use our services.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            2. Description of Service
          </h2>
          <p>
            BingeBox provides a platform for users to discover and stream movies
            and TV shows. We do not host any content directly but may provide
            links to third-party sources.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            3. User Registration and Accounts
          </h2>
          <p>
            Some features of BingeBox may require registration. You agree to
            provide accurate information during registration and to keep your
            account information updated.
          </p>
          <p>
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">4. User Conduct</h2>
          <p>
            You agree not to use BingeBox for any illegal purposes or in
            violation of any applicable local, state, national, or international
            law or regulation.
          </p>
          <p>
            You agree not to attempt to circumvent, disable, or otherwise
            interfere with security-related features of BingeBox.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            5. Content and Copyright
          </h2>
          <p>
            BingeBox respects intellectual property rights and expects users to
            do the same. We do not claim ownership of content that we link to.
          </p>
          <p>
            If you believe that your copyrighted work has been copied in a way
            that constitutes copyright infringement, please contact us with the
            relevant information.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            6. Disclaimer of Warranties
          </h2>
          <p>
            BingeBox is provided &#34;as is&#34; without warranties of any kind,
            either express or implied. We do not guarantee the accuracy,
            quality, or reliability of our service.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            7. Limitation of Liability
          </h2>
          <p>
            In no event shall BingeBox be liable for any indirect, incidental,
            special, consequential, or punitive damages resulting from your use
            of or inability to use the service.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            8. Changes to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Service at any time.
            We will provide notice of significant changes by posting the new
            Terms on our website.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">9. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the jurisdiction in
            which BingeBox operates, without regard to its conflict of law
            provisions.
          </p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            10. Contact Information
          </h2>
          <p>
            If you have any questions about these Terms, please contact us at
            support@bingebox.com.
          </p>

          <p className="mt-8 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  )
}
