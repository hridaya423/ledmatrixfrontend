/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';

let currentMatrixData: Array<{r: number, g: number, b: number}> = [];

if (currentMatrixData.length === 0) {
  currentMatrixData = Array(64 * 32).fill(null).map(() => ({r: 0, g: 0, b: 0}));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || typeof body !== 'object') {
      return NextResponse.json({
        success: false,
        error: 'Invalid request body'
      }, { status: 400 });
    }
    
    const { pixels } = body;
    
    if (!Array.isArray(pixels)) {
      return NextResponse.json({
        success: false,
        error: 'Pixels must be an array'
      }, { status: 400 });
    }
    
    const processedPixels = [];
    for (let i = 0; i < 64 * 32; i++) {
      if (i < pixels.length) {
        const pixel = pixels[i];
        processedPixels.push({
          r: Math.min(255, Math.max(0, Math.round(Number(pixel.r || 0)))),
          g: Math.min(255, Math.max(0, Math.round(Number(pixel.g || 0)))),
          b: Math.min(255, Math.max(0, Math.round(Number(pixel.b || 0))))
        });
      } else {
        processedPixels.push({ r: 0, g: 0, b: 0 });
      }
    }
    
    currentMatrixData = processedPixels;
    
    return NextResponse.json({
      success: true,
      message: 'Matrix data updated successfully',
      pixelCount: currentMatrixData.length
    });
  } catch (error: any) {
    console.error('Error processing matrix data:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      pixels: currentMatrixData,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in GET request:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
