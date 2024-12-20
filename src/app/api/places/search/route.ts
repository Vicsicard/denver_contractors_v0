import { NextRequest, NextResponse } from 'next/server';
import { makeRequestWithBackoff } from '@/utils/apiUtils';

// This ensures the route is handled at runtime
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Skip API calls during build time
const isBuildTime = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// Validate environment variables at module level
if (!isBuildTime && !process.env.GOOGLE_PLACES_API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY is not defined in environment variables');
}

interface Place {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  types?: string[];
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

interface PlaceDetailsResult {
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
}

interface PlacesApiResponse {
  results: Place[];
  status: string;
  error_message?: string;
}

interface PlaceDetailsApiResponse {
  result: PlaceDetailsResult;
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    // Return mock data during build time
    if (isBuildTime) {
      return NextResponse.json({
        results: [],
        status: 'success',
        _info: 'Build time response'
      });
    }

    // Only access API key after build time check
    const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

    // Enhanced API key validation
    if (!GOOGLE_PLACES_API_KEY) {
      console.error('GOOGLE_PLACES_API_KEY is not defined in environment variables');
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          message: 'The service is not properly configured. Please check the environment variables.',
          code: 'ENV_VAR_MISSING'
        },
        { status: 503 }
      );
    }

    const GOOGLE_PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';
    const GOOGLE_PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places';

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const location = searchParams.get('location') || 'Denver, CO';

    if (!query) {
      return NextResponse.json(
        { 
          error: 'Invalid request',
          message: 'Query parameter is required',
          code: 'MISSING_QUERY'
        },
        { status: 400 }
      );
    }

    const searchQuery = `${query} in ${location}`;
    
    // Using the new Places API v3 format
    const searchRequest = {
      textQuery: searchQuery,
      languageCode: 'en',
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: {
            latitude: 39.7392,  // Denver's latitude
            longitude: -104.9903  // Denver's longitude
          },
          radius: 50000.0  // 50km radius
        }
      }
    };

    let response;
    try {
      response = await makeRequestWithBackoff(() => 
        fetch(GOOGLE_PLACES_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': '*'
          },
          body: JSON.stringify(searchRequest)
        })
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Places API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return NextResponse.json(
          { 
            error: 'External API error',
            message: `Google Places API returned status ${response.status}`,
            code: 'API_ERROR',
            details: errorText
          },
          { status: 502 }
        );
      }

      const data = await response.json();

      if (!data.places || !Array.isArray(data.places)) {
        console.error('Invalid response format:', data);
        return NextResponse.json(
          { 
            error: 'Invalid response',
            message: 'Received invalid response format from Google Places API',
            code: 'INVALID_RESPONSE'
          },
          { status: 502 }
        );
      }

      // Transform the response to match our expected format
      const transformedResults = data.places.map(place => ({
        place_id: place.id,
        name: place.displayName?.text || '',
        formatted_address: place.formattedAddress || '',
        geometry: place.location ? {
          location: {
            lat: place.location.latitude,
            lng: place.location.longitude
          }
        } : undefined,
        rating: place.rating,
        types: place.types || []
      }));

      // Fetch additional details for each place
      const placesWithDetails = await Promise.all(
        transformedResults.map(async (place) => {
          try {
            const detailsResponse = await makeRequestWithBackoff(() =>
              fetch(`${GOOGLE_PLACES_DETAILS_URL}/${place.place_id}`, {
                headers: {
                  'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                  'X-Goog-FieldMask': 'phoneNumber,websiteUri,currentOpeningHours'
                }
              })
            );

            if (!detailsResponse.ok) {
              console.error('Invalid response status:', detailsResponse.status);
              return place;
            }

            const details = await detailsResponse.json();

            return {
              ...place,
              phone_number: details.phoneNumber,
              website: details.websiteUri,
              opening_hours: details.currentOpeningHours ? {
                open_now: details.currentOpeningHours.openNow,
                weekday_text: details.currentOpeningHours.weekdayDescriptions
              } : undefined
            };
          } catch (error) {
            console.error('Error fetching place details:', error);
            // Return the place without details if fetching details fails
            return place;
          }
        })
      );

      return NextResponse.json({
        results: placesWithDetails,
        status: 'success'
      });
    } catch (error) {
      console.error('Failed to fetch from Places API:', error);
      return NextResponse.json(
        { 
          error: 'External API error',
          message: 'Failed to fetch data from Google Places API',
          code: 'API_FETCH_ERROR'
        },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Search places error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
