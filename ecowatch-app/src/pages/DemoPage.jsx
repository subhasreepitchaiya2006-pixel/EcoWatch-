import React from "react";
import { Link } from "react-router-dom";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="max-w-5xl mx-auto px-container_padding py-20">
        <div className="mb-10">
          <h1 className="text-headline-lg font-bold mb-4">Request a Demo</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Learn how EcoWatch Intelligence can help your organization by scheduling a guided demo with our product team. Explore satellite-driven environmental insights, risk alerts, and predictive analytics tailored to your needs.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-8">
            <h2 className="font-headline-sm text-headline-sm mb-3">What you get</h2>
            <ul className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <li>• Personalized walkthrough of platform features</li>
              <li>• Live satellite and weather analytics examples</li>
              <li>• Enterprise deployment and alerting overview</li>
              <li>• Q&A with our environment intelligence experts</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-8">
            <h2 className="font-headline-sm text-headline-sm mb-3">Next steps</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
              Please contact our sales team or create an account to book a demo session. We’ll help you choose the right plan and launch your environmental monitoring program quickly.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-on-primary font-headline-sm text-headline-sm hover:bg-primary/90 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="mt-12">
          <Link className="text-primary font-medium hover:underline" to="/home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
