
export interface TopLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: "attraction" | "restaurant" | "hotel" | "shopping";
  rating: number;
  searches: number;
  percentChange: number;
}
