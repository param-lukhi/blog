import React from 'react';
import { ShieldCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'About Us - TechPulse Reviews',
  description: 'Learn about our testing methodology, review standards, and editorial independence.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4">
        <span className="text-xs uppercase font-extrabold tracking-wider text-brand-600">
          Our Mission & Promise
        </span>
        <h1 className="text-4xl font-extrabold text-neutral-900 tracking-tight">
          About TechPulse Reviews
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          We test, benchmark, and review thousands of tech products to cut through manufacturer marketing fluff and help you buy with total confidence.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80 space-y-3">
          <Award className="w-8 h-8 text-brand-600" />
          <h3 className="font-bold text-neutral-900 text-base">Hands-on Benchmarks</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Every product we review undergoes real-world daily testing, battery endurance checks, and benchmark analysis.
          </p>
        </div>

        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80 space-y-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
          <h3 className="font-bold text-neutral-900 text-base">Zero Sponsored Bias</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            We purchase products directly or borrow evaluation units. Brands never pay us for favorable review scores.
          </p>
        </div>

        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200/80 space-y-3">
          <Sparkles className="w-8 h-8 text-amber-500" />
          <h3 className="font-bold text-neutral-900 text-base">Daily Amazon Price Tracking</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Our system automatically tracks Amazon price drops so you get the best deal when you click to buy.
          </p>
        </div>
      </div>
    </div>
  );
}
