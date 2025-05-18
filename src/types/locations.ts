
export interface TopLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: "attraction" | "restaurant" | "hotel" | "shopping" | "city" | "town" | "village" | "postcode";
  rating: number;
  searches: number;
  percentChange: number;
  contact?: string;
  password?: string;
  info?: string;
}
