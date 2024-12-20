import { NextResponse } from 'next/server';
import { searchPlaces } from '@/utils/googlePlaces';

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const location = searchParams.get('location');

    if (!keyword || !location) {
      return NextResponse.json(
        { error: 'Missing required parameters: keyword and location' },
        { status: 400 }
      );
    }

    console.log('API: Searching for:', { keyword, location });
    const results = await searchPlaces(keyword, location);
    console.log('API: Found results:', { count: results.results?.length ?? 0 });

    return NextResponse.json({
      results: results.results,
      metadata: {
        count: results.results?.length ?? 0,
        query: { keyword, location }
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
