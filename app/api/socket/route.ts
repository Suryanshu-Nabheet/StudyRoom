/**
 * Next.js API route for Socket.io
 * This can be used for health checks or socket server status
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Socket server is running",
    timestamp: new Date().toISOString(),
  });
}

