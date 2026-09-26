// scripts/check-env.ts
// Run: npx tsx scripts/check-env.ts
// This utility reports missing optional/required environment variables for production.

const required = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'CRON_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

const recommended = [
  'GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL',
  'GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY',
  'GOOGLE_SEARCH_CONSOLE_SITE_URL',
  'AMAZON_AFFILIATE_TAG',
  'ADSENSE_PUBLISHER_ID',
  'RESEND_API_KEY',
  'SENDGRID_API_KEY',
];

function report(keys: string[], label: string) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(`⚠️ ${label} missing:`);
    missing.forEach((k) => console.warn('  -', k));
  } else {
    console.log(`✅ All ${label.toLowerCase()} are set.`);
  }
}

report(required, 'Required environment variables');
report(recommended, 'Recommended environment variables');
