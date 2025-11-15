/**
 * Environment configuration
 * Centralized environment variable management
 */

// Helper to get socket URL - works in both server and client
function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  
  // In browser, construct URL from current location
  // Since Socket.io is now integrated with Next.js, use the same URL
  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Use the same host and port as the current page (Socket.io is integrated)
    if (port) {
      return `${protocol}//${hostname}:${port}`;
    }
    // No port means standard port (80 for http, 443 for https)
    return `${protocol}//${hostname}`;
  }
  
  // Server-side default - use same port as Next.js
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Helper to get app URL
function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  return "http://localhost:3000";
}

export const env = {
  // Socket Server
  SOCKET_PORT: process.env.SOCKET_PORT 
    ? parseInt(process.env.SOCKET_PORT) 
    : process.env.PORT 
    ? parseInt(process.env.PORT) + 1  // Use PORT+1 for socket server when PORT is set
    : 3001,
  SOCKET_URL: getSocketUrl(),

  // Next.js
  NODE_ENV: process.env.NODE_ENV || "development",
  NEXT_PUBLIC_APP_URL: getAppUrl(),

  // Feature Flags
  ENABLE_LOGGING: process.env.ENABLE_LOGGING !== "false",
} as const;

/**
 * Validate required environment variables
 */
export function validateEnv(): void {
  const required: string[] = [
    // Add any required env vars here
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

