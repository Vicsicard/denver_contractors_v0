import { PrismaClient, Business } from '@prisma/client';
import { Bottleneck } from 'bottleneck';

// Initialize rate limiter for Google Places API
const limiter = new Bottleneck({
  maxConcurrent: 1, // Number of concurrent requests
  minTime: 200, // Minimum time between requests (in ms)
});

// Initialize Prisma client
const prisma = new PrismaClient();

// Type for Google Places API response
interface GooglePlacesResponse {
  name: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_address?: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_phone_number?: string;
  website?: string;
  business_status?: string;
  types?: string[];
}

export const REFRESH_THRESHOLD_HOURS = 24; // Refresh data older than 24 hours

export async function shouldRefreshData(business: Business): Promise<boolean> {
  if (!business.updatedAt) return true;
  
  const now = new Date();
  const lastUpdate = new Date(business.updatedAt);
  const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceUpdate >= REFRESH_THRESHOLD_HOURS;
}

export async function refreshBusinessData(placeId: string): Promise<Business | null> {
  try {
    // First check if we have this business in our database
    const existingBusiness = await prisma.business.findFirst({
      where: { id: placeId }
    });

    // If we have the business and it's recent enough, return it
    if (existingBusiness && !await shouldRefreshData(existingBusiness)) {
      return existingBusiness;
    }

    // Rate-limited Google Places API call
    const placeDetails = await limiter.schedule(() => fetchGooglePlaceDetails(placeId));

    if (!placeDetails) return null;

    // Update or create business in database
    const updatedBusiness = await prisma.business.upsert({
      where: { id: placeId },
      update: {
        name: placeDetails.name,
        rating: placeDetails.rating || 0,
        reviewCount: placeDetails.user_ratings_total || 0,
        address: placeDetails.formatted_address || '',
        location: {
          lat: placeDetails.geometry?.location.lat || 0,
          lng: placeDetails.geometry?.location.lng || 0,
        },
        categories: placeDetails.types || [],
        phone: placeDetails.formatted_phone_number,
        website: placeDetails.website,
        businessStatus: placeDetails.business_status,
        updatedAt: new Date(),
      },
      create: {
        id: placeId,
        name: placeDetails.name,
        rating: placeDetails.rating || 0,
        reviewCount: placeDetails.user_ratings_total || 0,
        address: placeDetails.formatted_address || '',
        location: {
          lat: placeDetails.geometry?.location.lat || 0,
          lng: placeDetails.geometry?.location.lng || 0,
        },
        categories: placeDetails.types || [],
        phone: placeDetails.formatted_phone_number,
        website: placeDetails.website,
        businessStatus: placeDetails.business_status,
      },
    });

    return updatedBusiness;
  } catch (error) {
    console.error('Error refreshing business data:', error);
    return null;
  }
}

async function fetchGooglePlaceDetails(placeId: string): Promise<GooglePlacesResponse | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('Google Places API key not found');
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_address,geometry,formatted_phone_number,website,business_status,types&key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching place details:', error);
    return null;
  }
}