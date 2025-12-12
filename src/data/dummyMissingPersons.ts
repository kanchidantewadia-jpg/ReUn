export interface DummyMissingPerson {
  id: string;
  full_name: string;
  age: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  status: "missing" | "found" | "closed";
  photo_url: string | null;
  latitude: number;
  longitude: number;
}

export const dummyMissingPersons: DummyMissingPerson[] = [
  {
    id: "demo-1",
    full_name: "Sarah Johnson",
    age: 16,
    gender: "Female",
    last_seen_location: "Central Park, New York, NY",
    last_seen_date: "2025-12-01",
    status: "missing",
    photo_url: null,
    latitude: 40.7829,
    longitude: -73.9654,
  },
  {
    id: "demo-2",
    full_name: "Michael Chen",
    age: 45,
    gender: "Male",
    last_seen_location: "Downtown Los Angeles, CA",
    last_seen_date: "2025-11-28",
    status: "missing",
    photo_url: null,
    latitude: 34.0407,
    longitude: -118.2468,
  },
  {
    id: "demo-3",
    full_name: "Emily Rodriguez",
    age: 23,
    gender: "Female",
    last_seen_location: "Miami Beach, FL",
    last_seen_date: "2025-11-15",
    status: "found",
    photo_url: null,
    latitude: 25.7907,
    longitude: -80.1300,
  },
  {
    id: "demo-4",
    full_name: "James Williams",
    age: 67,
    gender: "Male",
    last_seen_location: "Seattle, WA",
    last_seen_date: "2025-12-05",
    status: "missing",
    photo_url: null,
    latitude: 47.6062,
    longitude: -122.3321,
  },
  {
    id: "demo-5",
    full_name: "Aisha Patel",
    age: 12,
    gender: "Female",
    last_seen_location: "Chicago, IL",
    last_seen_date: "2025-12-08",
    status: "missing",
    photo_url: null,
    latitude: 41.8781,
    longitude: -87.6298,
  },
  {
    id: "demo-6",
    full_name: "Robert Thompson",
    age: 55,
    gender: "Male",
    last_seen_location: "Denver, CO",
    last_seen_date: "2025-10-20",
    status: "closed",
    photo_url: null,
    latitude: 39.7392,
    longitude: -104.9903,
  },
  {
    id: "demo-7",
    full_name: "Lisa Martinez",
    age: 34,
    gender: "Female",
    last_seen_location: "Phoenix, AZ",
    last_seen_date: "2025-11-30",
    status: "missing",
    photo_url: null,
    latitude: 33.4484,
    longitude: -112.0740,
  },
  {
    id: "demo-8",
    full_name: "David Kim",
    age: 28,
    gender: "Male",
    last_seen_location: "San Francisco, CA",
    last_seen_date: "2025-12-10",
    status: "missing",
    photo_url: null,
    latitude: 37.7749,
    longitude: -122.4194,
  },
];
