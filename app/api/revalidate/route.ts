import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-demand ISR revalidation endpoint.
 * Called by the backend when articles are published to refresh cached pages.
 * 
 * Usage: GET /api/revalidate?path=/articles/some-slug
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  try {
    // Revalidate the specified path
    revalidatePath(path);
    
    return NextResponse.json({ 
      revalidated: true, 
      path,
      timestamp: Date.now() 
    });
  } catch (error) {
    console.error('[Revalidate] Error:', error);
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
