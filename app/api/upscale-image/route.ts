import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Using Pollinations.ai upscale endpoint
    const upscaleUrl = `https://image.pollinations.ai/prompt/enhance%20this%20image%20to%204k%20resolution%20with%20high%20detail?width=2048&height=2048&seed=${Math.floor(Math.random() * 10000)}&nologo=true`;

    const response = await fetch(upscaleUrl);
    
    if (!response.ok) {
      throw new Error('Failed to upscale image');
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return NextResponse.json({
      success: true,
      data: base64,
      mimeType: contentType
    });
  } catch (error) {
    console.error('Error upscaling image:', error);
    return NextResponse.json(
      { error: 'Failed to upscale image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
