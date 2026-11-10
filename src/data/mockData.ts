import { NetworkGraph, IncidentReport, StreetEdge, SafeHaven } from '../utils/safetyMath';

// Center coordinates: North Campus / Delhi NCR pilot locality (representative of the pilot survey of 120 commuters)
export const DEFAULT_MAP_CENTER: [number, number] = [28.6912, 77.2085];

export const INITIAL_GRAPH: NetworkGraph = {
  nodes: {
    node_metro: {
      id: 'node_metro',
      name: 'Vishwa Vidyalaya Metro Gate 2',
      lat: 28.6945,
      lng: 77.2060,
    },
    node_bazaar: {
      id: 'node_bazaar',
      name: 'Old Bazaar Alley Junction',
      lat: 28.6920,
      lng: 77.2075,
    },
    node_liquor_bend: {
      id: 'node_liquor_bend',
      name: 'Dark Corner near Liquor Vend',
      lat: 28.6895,
      lng: 77.2090,
    },
    node_market_avenue: {
      id: 'node_market_avenue',
      name: 'Main University Road (Lit Market)',
      lat: 28.6938,
      lng: 77.2115,
    },
    node_central_crossing: {
      id: 'node_central_crossing',
      name: 'Chattra Marg Crossing (Police Beat Post)',
      lat: 28.6910,
      lng: 77.2130,
    },
    node_bus_terminal: {
      id: 'node_bus_terminal',
      name: 'Bus Rapid Transit (BRT) Shelter #14',
      lat: 28.6875,
      lng: 77.2070,
    },
    node_hostel_campus: {
      id: 'node_hostel_campus',
      name: 'Girls Hostel & Residential Complex',
      lat: 28.6880,
      lng: 77.2140,
    },
    node_park_blindspot: {
      id: 'node_park_blindspot',
      name: 'Municipal Park Back Perimeter',
      lat: 28.6860,
      lng: 77.2105,
    },
  },
  edges: [
    // 1. Dangerous Shortcut Path (Standard GPS often picks this: Metro -> Bazaar -> Liquor Vend -> Hostel)
    {
      id: 'edge_bazaar_shortcut',
      name: 'Old Bazaar Narrow Back-lane',
      fromNode: 'node_metro',
      toNode: 'node_bazaar',
      distanceMeters: 520,
      lightingScore: 0.18, // Very dim sodium bulb
      opennessScore: 0.25, // Narrow 2m alley, blind corners
      baseCrowdScore: 0.20,
      isAlleyOrUnmapped: true,
      coordinates: [
        [28.6945, 77.2060],
        [28.6932, 77.2068],
        [28.6920, 77.2075],
      ],
    },
    {
      id: 'edge_liquor_alley',
      name: 'Approach Road past Liquor Vend',
      fromNode: 'node_bazaar',
      toNode: 'node_liquor_bend',
      distanceMeters: 480,
      lightingScore: 0.12, // Broken streetlight pole #L-104
      opennessScore: 0.30,
      baseCrowdScore: 0.15,
      isAlleyOrUnmapped: true,
      coordinates: [
        [28.6920, 77.2075],
        [28.6908, 77.2082],
        [28.6895, 77.2090],
      ],
    },
    {
      id: 'edge_park_shortcut',
      name: 'Unlit Park Boundary Lane',
      fromNode: 'node_liquor_bend',
      toNode: 'node_hostel_campus',
      distanceMeters: 450,
      lightingScore: 0.22,
      opennessScore: 0.20, // Overgrown bushes, zero sightline
      baseCrowdScore: 0.10,
      isAlleyOrUnmapped: true,
      coordinates: [
        [28.6895, 77.2090],
        [28.6888, 77.2115],
        [28.6880, 77.2140],
      ],
    },

    // 2. SurakshaPath Recommended Lit Safe Corridor (Metro -> Market -> Police Post -> Hostel)
    {
      id: 'edge_main_market_north',
      name: 'University Main Commercial Avenue',
      fromNode: 'node_metro',
      toNode: 'node_market_avenue',
      distanceMeters: 620,
      lightingScore: 0.95, // Bright LED white lighting
      opennessScore: 0.90, // Wide 4-lane divided avenue
      baseCrowdScore: 0.88, // Active shops, tea stalls, students
      isAlleyOrUnmapped: false,
      coordinates: [
        [28.6945, 77.2060],
        [28.6942, 77.2090],
        [28.6938, 77.2115],
      ],
    },
    {
      id: 'edge_chattra_marg',
      name: 'Chattra Marg (Lit Corridor with Police Post)',
      fromNode: 'node_market_avenue',
      toNode: 'node_central_crossing',
      distanceMeters: 490,
      lightingScore: 0.92,
      opennessScore: 0.85,
      baseCrowdScore: 0.80,
      isAlleyOrUnmapped: false,
      coordinates: [
        [28.6938, 77.2115],
        [28.6924, 77.2122],
        [28.6910, 77.2130],
      ],
    },
    {
      id: 'edge_hostel_approach_lit',
      name: 'Campus Boulevard & Hostel Gate Road',
      fromNode: 'node_central_crossing',
      toNode: 'node_hostel_campus',
      distanceMeters: 470,
      lightingScore: 0.88,
      opennessScore: 0.82,
      baseCrowdScore: 0.70,
      isAlleyOrUnmapped: false,
      coordinates: [
        [28.6910, 77.2130],
        [28.6895, 77.2135],
        [28.6880, 77.2140],
      ],
    },

    // 3. Cross connection edges
    {
      id: 'edge_bus_connector',
      name: 'BRT Terminal Link Road',
      fromNode: 'node_liquor_bend',
      toNode: 'node_bus_terminal',
      distanceMeters: 380,
      lightingScore: 0.35,
      opennessScore: 0.50,
      baseCrowdScore: 0.40,
      isAlleyOrUnmapped: false,
      coordinates: [
        [28.6895, 77.2090],
        [28.6885, 77.2080],
        [28.6875, 77.2070],
      ],
    },
    {
      id: 'edge_crossing_to_bazaar',
      name: 'Middle Cross-Street (RWA Barrier)',
      fromNode: 'node_bazaar',
      toNode: 'node_central_crossing',
      distanceMeters: 650,
      lightingScore: 0.65,
      opennessScore: 0.60,
      baseCrowdScore: 0.50,
      isAlleyOrUnmapped: false,
      coordinates: [
        [28.6920, 77.2075],
        [28.6915, 77.2100],
        [28.6910, 77.2130],
      ],
    },
  ],
};

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-101',
    type: 'broken_light',
    category: 'environmental',
    timestamp: Date.now() - 3 * 3600 * 1000, // 3 hours ago
    severity: 4,
    lat: 28.6905,
    lng: 77.2084,
    verifiedCount: 7,
    status: 'verified',
  },
  {
    id: 'inc-102',
    type: 'catcalling',
    category: 'behavioral',
    timestamp: Date.now() - 5 * 3600 * 1000, // 5 hours ago
    severity: 5,
    lat: 28.6898,
    lng: 77.2092,
    verifiedCount: 5,
    status: 'verified',
  },
  {
    id: 'inc-103',
    type: 'blocked_sightline',
    category: 'environmental',
    timestamp: Date.now() - 24 * 3600 * 1000, // 1 day ago
    severity: 3,
    lat: 28.6925,
    lng: 77.2072,
    verifiedCount: 4,
    status: 'verified',
  },
  {
    id: 'inc-104',
    type: 'loitering',
    category: 'behavioral',
    timestamp: Date.now() - 8 * 3600 * 1000, // 8 hours ago
    severity: 4,
    lat: 28.6877,
    lng: 77.2072,
    verifiedCount: 6,
    status: 'verified',
  },
  {
    id: 'inc-105',
    type: 'deserted_area',
    category: 'environmental',
    timestamp: Date.now() - 14 * 3600 * 1000,
    severity: 3,
    lat: 28.6885,
    lng: 77.2110,
    verifiedCount: 3,
    status: 'verified',
  },
];

export interface H3HexCell {
  id: string;
  res: number;
  centerLat: number;
  centerLng: number;
  safetyScore: number;
  lightingIndex: number;
  crowdIndex: number;
  incidentCount: number;
  kAnonymityCount: number; // k >= 3 requirement
  riskLevel: 'safe' | 'caution' | 'high_risk';
  wardNumber: string;
  lastAuditedText: string;
}

export const INITIAL_HEX_CELLS: H3HexCell[] = [
  {
    id: '8928308280fffff',
    res: 9,
    centerLat: 28.6942,
    centerLng: 77.2088,
    safetyScore: 0.91,
    lightingIndex: 0.94,
    crowdIndex: 0.88,
    incidentCount: 0,
    kAnonymityCount: 14,
    riskLevel: 'safe',
    wardNumber: 'Ward 47 - North University',
    lastAuditedText: 'Audited 42m ago by 3 NSS student walkers',
  },
  {
    id: '8928308281fffff',
    res: 9,
    centerLat: 28.6915,
    centerLng: 77.2078,
    safetyScore: 0.32,
    lightingIndex: 0.15,
    crowdIndex: 0.18,
    incidentCount: 8,
    kAnonymityCount: 12,
    riskLevel: 'high_risk',
    wardNumber: 'Ward 47 - Old Bazaar Lane',
    lastAuditedText: 'Audited 1h ago · 2 broken streetlights tagged',
  },
  {
    id: '8928308282fffff',
    res: 9,
    centerLat: 28.6896,
    centerLng: 77.2091,
    safetyScore: 0.28,
    lightingIndex: 0.12,
    crowdIndex: 0.15,
    incidentCount: 11,
    kAnonymityCount: 9,
    riskLevel: 'high_risk',
    wardNumber: 'Ward 48 - Liquor Vend Cluster',
    lastAuditedText: 'Audited 2h ago · 3 verbal harassment reports',
  },
  {
    id: '8928308283fffff',
    res: 9,
    centerLat: 28.6925,
    centerLng: 77.2125,
    safetyScore: 0.89,
    lightingIndex: 0.91,
    crowdIndex: 0.82,
    incidentCount: 1,
    kAnonymityCount: 19,
    riskLevel: 'safe',
    wardNumber: 'Ward 47 - Chattra Marg',
    lastAuditedText: 'Audited 25m ago · Police PCR van patrol active',
  },
  {
    id: '8928308284fffff',
    res: 9,
    centerLat: 28.6882,
    centerLng: 77.2138,
    safetyScore: 0.84,
    lightingIndex: 0.86,
    crowdIndex: 0.72,
    incidentCount: 1,
    kAnonymityCount: 16,
    riskLevel: 'safe',
    wardNumber: 'Ward 48 - Campus Hostel Gates',
    lastAuditedText: 'Audited 15m ago · Well illuminated perimeter',
  },
  {
    id: '8928308285fffff',
    res: 9,
    centerLat: 28.6872,
    centerLng: 77.2072,
    safetyScore: 0.44,
    lightingIndex: 0.38,
    crowdIndex: 0.42,
    incidentCount: 4,
    kAnonymityCount: 8,
    riskLevel: 'caution',
    wardNumber: 'Ward 48 - BRT Terminal Bus Shelter',
    lastAuditedText: 'Audited 3h ago · Dim shelter light & loitering',
  },
];

export interface CivicWorkOrder {
  id: string;
  department: 'PWD_LIGHTING' | 'POLICE_PCR' | 'MUNICIPAL_MCD';
  title: string;
  location: string;
  h3Index: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'PENDING' | 'IN_PROGRESS' | 'REPAIRED_AWAITING_VERIFICATION' | 'RESOLVED';
  reportedIncidentsCount: number;
  averageLuxLevel: number; // e.g. 8 lux (standard requires 30 lux)
  lat: number;
  lng: number;
  generatedDate: string;
  actionRequired: string;
}

export const INITIAL_CIVIC_WORK_ORDERS: CivicWorkOrder[] = [
  {
    id: 'WO-PWD-2026-084',
    department: 'PWD_LIGHTING',
    title: 'Replace burnt-out 70W sodium lamp with 120W LED fixture',
    location: 'Old Bazaar Alley, Pole #L-104 to #L-107',
    h3Index: '8928308281fffff',
    priority: 'CRITICAL',
    status: 'REPAIRED_AWAITING_VERIFICATION', // Ready for closed loop community verification prompt!
    reportedIncidentsCount: 8,
    averageLuxLevel: 6,
    lat: 28.6912,
    lng: 77.2077,
    generatedDate: '2026-11-08',
    actionRequired: 'Replace non-functional sodium bulb; clear tree branches blocking fixture cone.',
  },
  {
    id: 'WO-POLICE-2026-192',
    department: 'POLICE_PCR',
    title: 'Evening PCR Beat Van Patrol Scheduling (19:30 - 22:30)',
    location: 'Liquor Vend back-approach towards BRT shelter',
    h3Index: '8928308282fffff',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    reportedIncidentsCount: 11,
    averageLuxLevel: 10,
    lat: 28.6896,
    lng: 77.2091,
    generatedDate: '2026-11-09',
    actionRequired: 'Deploy static motorcycle patrol & disperse illegal loitering after 8:00 PM.',
  },
  {
    id: 'WO-MCD-2026-051',
    department: 'MUNICIPAL_MCD',
    title: 'Trim overgrown perimeter foliage obstructing pedestrian sightlines',
    location: 'Municipal Park Back Boundary Path',
    h3Index: '8928308282fffff',
    priority: 'HIGH',
    status: 'PENDING',
    reportedIncidentsCount: 5,
    averageLuxLevel: 14,
    lat: 28.6865,
    lng: 77.2102,
    generatedDate: '2026-11-10',
    actionRequired: 'Clear blind-spot hedge and install secondary solar flood lamp.',
  },
];

export const INITIAL_SAFE_HAVENS: SafeHaven[] = [
  {
    id: 'haven-pink-booth-4',
    name: 'Delhi Police Pink Booth #4 (All-Women Staff)',
    type: 'police_pink_booth',
    address: 'Chattra Marg Crossing (near Police Beat Post)',
    lat: 28.6912,
    lng: 77.2132,
    isOpen247: true,
    hasCctvAndStaff: true,
    contactPhone: '112 / 011-27667100',
  },
  {
    id: 'haven-apollo-pharmacy',
    name: 'Apollo Pharmacy 24/7 & Emergency First Aid',
    type: 'pharmacy_247',
    address: 'Shop 14, Main University Road Market',
    lat: 28.6937,
    lng: 77.2112,
    isOpen247: true,
    hasCctvAndStaff: true,
    contactPhone: '+91 98110-24724',
  },
  {
    id: 'haven-indianoil-petrol',
    name: 'Indian Oil 24hr Station (Floodlit & CCTV)',
    type: 'fuel_station',
    address: 'Outer University Boulevard Junction',
    lat: 28.6948,
    lng: 77.2082,
    isOpen247: true,
    hasCctvAndStaff: true,
    contactPhone: '011-27668900',
  },
  {
    id: 'haven-metro-cisf',
    name: 'Vishwa Vidyalaya Metro CISF Security Desk',
    type: 'metro_cisf',
    address: 'Metro Station Concourse Gate 2',
    lat: 28.6944,
    lng: 77.2058,
    isOpen247: true,
    hasCctvAndStaff: true,
    contactPhone: '155370',
  },
];

