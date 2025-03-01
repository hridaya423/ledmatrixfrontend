/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

const matrixCache = {
  data: Array(64 * 32).fill({ r: 0, g: 0, b: 0 }),
  lastUpdated: Date.now(),
  ttl: 5 * 60 * 1000,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body?.pixels || !Array.isArray(body.pixels)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid pixel data format'
      }, { status: 400 });
    }

    const processedPixels = [];
    for (let i = 0; i < 64 * 32; i++) {
      const pixel = body.pixels[i] || { r: 0, g: 0, b: 0 };
      processedPixels.push({
        r: Math.min(255, Math.max(0, Math.round(pixel.r || 0))),
        g: Math.min(255, Math.max(0, Math.round(pixel.g || 0))),
        b: Math.min(255, Math.max(0, Math.round(pixel.b || 0)))
      });
    }

    matrixCache.data = processedPixels;
    matrixCache.lastUpdated = Date.now();

    return NextResponse.json({
      success: true,
      message: 'Matrix updated',
      cacheStatus: `Will persist until ${new Date(matrixCache.lastUpdated + matrixCache.ttl).toLocaleTimeString()}`
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  if (Date.now() - matrixCache.lastUpdated > matrixCache.ttl) {
    matrixCache.data = Array(64 * 32).fill({ r: 0, g: 0, b: 0 });
    matrixCache.lastUpdated = Date.now();
  }

  return NextResponse.json({
    pixels: matrixCache.data,
    expiresAt: matrixCache.lastUpdated + matrixCache.ttl
  });
}
