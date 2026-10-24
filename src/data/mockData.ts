export type RiskLevel = "high" | "medium" | "low";

export interface Hotspot {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  riskScore: number;
  riskLevel: RiskLevel;
  lastReport: string;
  reportCount: number;
  trend: "rising" | "stable" | "falling";
  factors: string[];
  status: "active" | "scheduled" | "cleaned";
}

export interface CitizenReport {
  id: string;
  location: string;
  time: string;
  description: string;
  severity: RiskLevel;
  verified: boolean;
}

export interface Alert {
  id: string;
  message: string;
  zone: string;
  time: string;
  level: RiskLevel;
}

// Centered on a generic city — Johannesburg-ish coords for realism
export const hotspots: Hotspot[] = [
  {
    id: "Z001",
    name: "Industrial Belt — Sector 7",
    district: "Germiston East",
    lat: -26.2041,
    lng: 28.0473,
    riskScore: 94,
    riskLevel: "high",
    lastReport: "14 min ago",
    reportCount: 47,
    trend: "rising",
    factors: ["Missed collection ×3", "Heavy rain forecast", "Night activity"],
    status: "active",
  },
  {
    id: "Z002",
    name: "Khumalo Street Corridor",
    district: "Soweto",
    lat: -26.2678,
    lng: 27.8546,
    riskScore: 88,
    riskLevel: "high",
    lastReport: "32 min ago",
    reportCount: 39,
    trend: "rising",
    factors: ["High density", "Low bin coverage", "Weekend pattern"],
    status: "active",
  },
  {
    id: "Z003",
    name: "N12 Highway Underpass",
    district: "Alberton",
    lat: -26.2489,
    lng: 28.1219,
    riskScore: 81,
    riskLevel: "high",
    lastReport: "1 hr ago",
    reportCount: 28,
    trend: "stable",
    factors: ["CCTV blind spot", "Repeat offender zone"],
    status: "scheduled",
  },
  {
    id: "Z004",
    name: "Rivergate Market Perimeter",
    district: "Midrand",
    lat: -25.9993,
    lng: 28.1272,
    riskScore: 67,
    riskLevel: "medium",
    lastReport: "2 hr ago",
    reportCount: 19,
    trend: "stable",
    factors: ["Market overflow", "Irregular collection"],
    status: "active",
  },
  {
    id: "Z005",
    name: "Park Moroka Drainage Canal",
    district: "Soweto",
    lat: -26.2899,
    lng: 27.8921,
    riskScore: 61,
    riskLevel: "medium",
    lastReport: "3 hr ago",
    reportCount: 14,
    trend: "falling",
    factors: ["Flood risk amplifier", "Low patrol frequency"],
    status: "active",
  },
  {
    id: "Z006",
    name: "Bram Fischer Drive Lay-by",
    district: "Randburg",
    lat: -26.0952,
    lng: 27.9887,
    riskScore: 44,
    riskLevel: "medium",
    lastReport: "5 hr ago",
    reportCount: 9,
    trend: "falling",
    factors: ["Commuter dump pattern"],
    status: "active",
  },
  {
    id: "Z007",
    name: "Sandton CBD Perimeter",
    district: "Sandton",
    lat: -26.1076,
    lng: 28.0567,
    riskScore: 22,
    riskLevel: "low",
    lastReport: "8 hr ago",
    reportCount: 3,
    trend: "stable",
    factors: ["High patrol density"],
    status: "cleaned",
  },
  {
    id: "Z008",
    name: "Fourways Junction East",
    district: "Fourways",
    lat: -26.0167,
    lng: 28.0089,
    riskScore: 18,
    riskLevel: "low",
    lastReport: "12 hr ago",
    reportCount: 2,
    trend: "stable",
    factors: ["Regular collection"],
    status: "cleaned",
  },
];

export const citizenReports: CitizenReport[] = [
  {
    id: "R-4421",
    location: "17 Eloff St, Germiston",
    time: "09:14",
    description: "Large pile of construction debris outside abandoned warehouse",
    severity: "high",
    verified: true,
  },
  {
    id: "R-4420",
    location: "Khumalo Rd, near Shell",
    time: "08:57",
    description: "Household waste dumped overnight, approx 40 bags",
    severity: "high",
    verified: true,
  },
  {
    id: "R-4419",
    location: "N12 Underpass, Alberton",
    time: "08:31",
    description: "Mattresses and old appliances blocking pedestrian path",
    severity: "medium",
    verified: false,
  },
  {
    id: "R-4418",
    location: "Rivergate Market, Gate 3",
    time: "07:45",
    description: "Organic waste overflow from market stalls",
    severity: "medium",
    verified: true,
  },
  {
    id: "R-4417",
    location: "Moroka Canal bank",
    time: "06:20",
    description: "Tyres and plastic dumped near canal edge",
    severity: "low",
    verified: false,
  },
];

export const alerts: Alert[] = [
  {
    id: "A01",
    message: "Risk threshold exceeded — immediate dispatch recommended",
    zone: "Industrial Belt Sector 7",
    time: "09:41",
    level: "high",
  },
  {
    id: "A02",
    message: "Rainfall forecast — elevated dump probability +34%",
    zone: "Soweto Corridor",
    time: "09:28",
    level: "medium",
  },
  {
    id: "A03",
    message: "CCTV anomaly detected — reviewing footage",
    zone: "N12 Underpass",
    time: "09:05",
    level: "medium",
  },
];

export const weeklyTrend = [
  { day: "Mon", high: 3, medium: 7, low: 12 },
  { day: "Tue", high: 4, medium: 6, low: 11 },
  { day: "Wed", high: 5, medium: 8, low: 9 },
  { day: "Thu", high: 7, medium: 9, low: 8 },
  { day: "Fri", high: 6, medium: 7, low: 10 },
  { day: "Sat", high: 9, medium: 11, low: 7 },
  { day: "Sun", high: 8, medium: 10, low: 9 },
];

export const collectionStats = {
  scheduled: 24,
  completed: 11,
  missed: 3,
  inProgress: 5,
};
