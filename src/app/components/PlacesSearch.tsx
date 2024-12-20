'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

const PlacesSearch: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Encode the parameters for the URL
    const encodedKeyword = encodeURIComponent(keyword.trim());
    const encodedLocation = encodeURIComponent(location.trim());
    
    // Use the correct route for search results page
    router.push(`/search/results?keyword=${encodedKeyword}&location=${encodedLocation}`);
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword (e.g., Career coaching)"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., Los Angeles County, California)"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default PlacesSearch;