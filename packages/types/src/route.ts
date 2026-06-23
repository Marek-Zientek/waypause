export interface Route {
  id: string;
  userId: string;
  origin: string;
  destination: string;
  travelTimeMinutes: number;
  createdAt: string;
  stops?: Stop[];
}

export interface Stop {
  id: string;
  routeId: string;
  city: string;
  orderIndex: number;
  aiSuggested: boolean;
}

export interface CreateRouteDto {
  origin: string;
  destination: string;
  travelTimeMinutes: number;
}

export interface AiStopSuggestion {
  city: string;
  reason: string;
  detourMinutes: number;
}
