export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: March 23, 2026</p>

        <div className="prose prose-gray prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold text-gray-900">1. Overview</h2>
            <p>
              Northpath is a personal LinkedIn account management tool. This policy describes how we handle data when you use the application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">2. Data We Collect</h2>
            <p>When you connect a LinkedIn account, we store:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your LinkedIn profile name and profile URL</li>
              <li>OAuth access and refresh tokens (used to post on your behalf)</li>
              <li>Post content you create within Northpath</li>
              <li>Analytics data related to your LinkedIn posts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">3. How We Use Your Data</h2>
            <p>Your data is used solely to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Publish and schedule posts to your LinkedIn account(s)</li>
              <li>Display analytics and performance metrics</li>
              <li>Manage your content calendar</li>
            </ul>
            <p>We do not sell, share, or distribute your data to any third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">4. Data Storage</h2>
            <p>
              All data is stored securely in a PostgreSQL database hosted on Supabase. OAuth tokens are stored encrypted at rest. The application is hosted on Vercel.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">5. Third-Party Services</h2>
            <p>Northpath integrates with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>LinkedIn API</strong> — to publish posts and retrieve analytics</li>
              <li><strong>Supabase</strong> — database hosting</li>
              <li><strong>Vercel</strong> — application hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">6. Data Deletion</h2>
            <p>
              You can disconnect a LinkedIn account at any time from the Accounts page, which deletes all associated data including posts and analytics. To request full data deletion, contact the site administrator.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900">7. Contact</h2>
            <p>
              For questions about this privacy policy, reach out to the application administrator.
            </p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
