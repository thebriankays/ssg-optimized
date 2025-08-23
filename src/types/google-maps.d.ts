export {}; // This file needs to be a module to augment global types

declare global {
  interface Window {
    googleMapsLoaded?: () => void;
    google: {
      maps: {
        LatLng: new (lat: number, lng: number) => google.maps.LatLng;
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              types?: string[];
              fields?: string[];
            }
          ) => {
            getPlace: () => {
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
              formatted_address?: string;
              address_components?: Array<{
                long_name: string;
                short_name: string;
                types: string[];
              }>;
              name?: string;
              place_id?: string;
            };
            addListener: (event: string, callback: () => void) => void;
          };
          AutocompleteService: new () => {
            getPlacePredictions: (
              request: {
                input: string;
                types?: string[];
              },
              callback: (
                predictions: Array<{
                  place_id: string;
                  description: string;
                }> | null,
                status: string
              ) => void
            ) => void;
          };
          PlacesService: new (attributionNode: HTMLElement) => {
            getDetails: (
              request: {
                placeId: string;
                fields: string[];
              },
              callback: (
                place: {
                  name?: string;
                  geometry?: {
                    location: {
                      lat: () => number;
                      lng: () => number;
                    };
                  };
                  address_components?: Array<{
                    long_name: string;
                    short_name: string;
                    types: string[];
                  }>;
                  place_id?: string;
                } | null,
                status: string
              ) => void
            ) => void;
            nearbySearch: (
              request: {
                location: google.maps.LatLng;
                radius: number;
                type?: string[];
                types?: string[];
              },
              callback: (
                results: google.maps.places.PlaceResult[] | null,
                status: google.maps.places.PlacesServiceStatus
              ) => void
            ) => void;
          };
          PlaceResult: {
            name?: string;
            vicinity?: string;
            geometry?: {
              location: google.maps.LatLng;
            };
            types?: string[];
            rating?: number;
            user_ratings_total?: number;
            price_level?: number;
            opening_hours?: {
              open_now?: boolean;
            };
            place_id?: string;
          };
          LatLng: new (lat: number, lng: number) => {
            lat: () => number;
            lng: () => number;
          };
          PlacesServiceStatus: {
            OK: string;
            NOT_FOUND: string;
            ZERO_RESULTS: string;
            OVER_QUERY_LIMIT: string;
            REQUEST_DENIED: string;
            INVALID_REQUEST: string;
            UNKNOWN_ERROR: string;
          };
        };
      };
    };
  }
}
