/**
 * Environment configuration
 * Centralized environment variable management
 */

export const env = {
  // Socket Server
  SOCKET_PORT: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",

  // Next.js
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Feature Flags
  ENABLE_LOGGING: process.env.ENABLE_LOGGING !== "false",
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required = [
    // Add any required env vars here
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

