'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-extrabold text-neutral-900">Contact Us</h1>
        <p className="text-neutral-600 text-base max-w-xl mx-auto">
          Have a question about a product review or want to suggest a product for lab testing? Send us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-neutral-900">Get in Touch</h2>
          <div className="space-y-4 text-sm text-neutral-600">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-600" />
              <span>contact@techpulsereviews.com</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-600" />
              <span>+1 (800) 555-0199</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>TechPulse Media Labs, San Francisco, CA</span>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto text-xl font-bold">✓</div>
            <h3 className="font-bold text-emerald-900 text-lg">Message Sent!</h3>
            <p className="text-xs text-emerald-700">Thank you for reaching out. Our editorial team will get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Your Name</label>
              <input type="text" required className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-brand-500 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Email Address</label>
              <input type="email" required className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-brand-500 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">Message</label>
              <textarea rows={4} required className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm outline-none focus:border-brand-500 bg-white resize-none" />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
