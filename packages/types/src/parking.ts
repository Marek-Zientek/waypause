export type ParkingType = 'free' | 'paid' | 'street';
export type ParkingSource = 'osm' | 'user' | 'operator';

export interface Parking {
  id: string;
  name: string;
  type: ParkingType;
  pricePerHour: number | null;
  source: ParkingSource;
  osmId: string | null;
  verified: boolean;
  location: {
    lat: number;
    lng: number;
  };
  distanceMeters?: number;
}

export interface ParkingSearchParams {
  lat: number;
  lng: number;
  radiusMeters?: number;
  type?: ParkingType;
}
