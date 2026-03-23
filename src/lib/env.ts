function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function validateEnv() {
  // Only validate at runtime in server context
  if (typeof window !== "undefined") return;

  const required = [
    "DATABASE_URL",
    "LINKEDIN_CLIENT_ID",
    "LINKEDIN_CLIENT_SECRET",
    "LINKEDIN_REDIRECT_URI",
  ];

  const missing = required.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.warn(
      `[Northpath] Missing environment variables: ${missing.join(", ")}. Some features may not work.`
    );
  }
}

export { requireEnv };
