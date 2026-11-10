import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateStreetSafetyScore,
  calculateEdgeCost,
  applyBayesianGuardrail,
  calculateDecayedIncidentScore,
  findOptimalRoute,
  NetworkGraph,
  StreetEdge,
  IncidentReport,
  calculateHaversineDistance,
  findNearestSafeHavens,
  generateOfflineEmergencySms,
  checkSafetyTimerExpired,
  findNearestGraphNode
} from './safetyMath';

test('Street Safety Score Formula matches specification: S(e,t) = 0.35L + 0.25O + 0.20C - 0.20*min(1, I/Imax)', () => {
  // Case 1: High quality street - Lit (1.0), Wide open (0.9), crowded (0.8), 0 incidents
  // S = 0.35*1.0 + 0.25*0.9 + 0.20*0.8 - 0 = 0.35 + 0.225 + 0.16 = 0.735
  const score1 = calculateStreetSafetyScore(1.0, 0.9, 0.8, 0, 5.0);
  assert.equal(score1, 0.735);

  // Case 2: Unlit alley - Lighting 0.1, Openness 0.2, Crowd 0.05, Incident score 4.0
  // S = 0.35*0.1 + 0.25*0.2 + 0.20*0.05 - 0.20 * min(1, 4/5)
  // S = 0.035 + 0.05 + 0.01 - 0.20 * 0.8 = 0.095 - 0.16 = -0.065 -> clamped to min 0.05
  const score2 = calculateStreetSafetyScore(0.1, 0.2, 0.05, 4.0, 5.0);
  assert.equal(score2, 0.05);

  // Case 3: Perfectly safe lit market street with high community presence
  // L=1.0, O=1.0, C=1.0, I=0 -> S = 0.35 + 0.25 + 0.20 = 0.80 (before bonus/normal)
  const score3 = calculateStreetSafetyScore(1.0, 1.0, 1.0, 0, 5.0);
  assert.equal(score3, 0.8);
});

test('Routing Edge Cost Formula matches Slide 9: W(e,t) = d(e) * (1 + alpha * (1 - S(e,t))^2)', () => {
  const d = 1000; // 1000 meters
  
  // When alpha = 0 (Standard GPS shortest path), cost is pure distance
  assert.equal(calculateEdgeCost(d, 0.3, 0), 1000);

  // When alpha = 3 and Safety Score = 0.86 (Safe street from Slide 9)
  // penalty = (1 - 0.86)^2 = 0.14^2 = 0.0196
  // cost = 1000 * (1 + 3 * 0.0196) = 1000 * 1.0588 = 1058.8
  const safeCost = calculateEdgeCost(d, 0.86, 3);
  assert.equal(safeCost, 1058.8);

  // When alpha = 3 and Safety Score = 0.38 (High Risk street from Slide 9)
  // penalty = (1 - 0.38)^2 = 0.62^2 = 0.3844
  // cost = 1000 * (1 + 3 * 0.3844) = 1000 * 2.1532 = 2153.2 (over double cost!)
  const unsafeCost = calculateEdgeCost(d, 0.38, 3);
  assert.equal(unsafeCost, 2153.2);
  assert.ok(unsafeCost > safeCost * 2, 'Unsafe route receives massive impedance penalty');
});

test('Bayesian Guardrail penalizes unmapped back-alleys after dark', () => {
  const alleyEdge: StreetEdge = {
    id: 'alley-1',
    name: 'Dark Shortcut Alley',
    fromNode: 'A',
    toNode: 'B',
    distanceMeters: 200,
    lightingScore: 0.2,
    opennessScore: 0.3,
    baseCrowdScore: 0.2,
    isAlleyOrUnmapped: true,
    coordinates: [[28.6139, 77.2090], [28.6145, 77.2098]],
  };

  // At 21:00 (9 PM - after dark)
  const scoreNight = applyBayesianGuardrail(alleyEdge, 0.7, 21);
  assert.equal(scoreNight, 0.35, 'Unmapped alley score must be capped to conservative prior 0.35 after dark');

  // At 14:00 (2 PM - broad daylight)
  const scoreDay = applyBayesianGuardrail(alleyEdge, 0.7, 14);
  assert.equal(scoreDay, 0.7, 'Broad daylight allows higher baseline');
});

test('Temporal risk decay reduces older incidents over time', () => {
  const now = 1700000000000;
  const recentIncident: IncidentReport = {
    id: 'inc-1',
    type: 'catcalling',
    category: 'behavioral',
    timestamp: now - (2 * 3600 * 1000), // 2 hours ago
    severity: 4,
    lat: 28.61,
    lng: 77.20,
    verifiedCount: 3,
    status: 'verified',
  };

  const oldIncident: IncidentReport = {
    id: 'inc-2',
    type: 'catcalling',
    category: 'behavioral',
    timestamp: now - (40 * 24 * 3600 * 1000), // 40 days ago
    severity: 4,
    lat: 28.61,
    lng: 77.20,
    verifiedCount: 3,
    status: 'verified',
  };

  const recentScore = calculateDecayedIncidentScore([recentIncident], now);
  const oldScore = calculateDecayedIncidentScore([oldIncident], now);

  assert.ok(recentScore > oldScore * 5, 'Recent incident carries significantly higher weight than old report');
});

test('A* routing simulation mirrors Slide 9: Standard GPS picks short dark alley vs SurakshaPath takes lit market avenue', () => {
  // Graph matching Slide 9 simulation:
  // Node A: Origin (Metro Station)
  // Node B: Intermediate junction (via dark alley)
  // Node C: Intermediate junction (via lit market)
  // Node D: Destination (College Hostel / Home)
  const testGraph: NetworkGraph = {
    nodes: {
      'A': { id: 'A', name: 'Metro Station Gate 2', lat: 28.612, lng: 77.210 },
      'B': { id: 'B', name: 'Old Bazaar Back-lane', lat: 28.615, lng: 77.212 },
      'C': { id: 'C', name: 'Main Commercial Avenue', lat: 28.614, lng: 77.218 },
      'D': { id: 'D', name: 'College Hostel Campus', lat: 28.620, lng: 77.215 },
    },
    edges: [
      // Dangerous shortcut: A -> B -> D (Total 1,200m)
      {
        id: 'e_shortcut_1',
        name: 'Unlit Approach Alley',
        fromNode: 'A',
        toNode: 'B',
        distanceMeters: 600,
        lightingScore: 0.1, // Dark
        opennessScore: 0.2, // Narrow blind spots
        baseCrowdScore: 0.1,
        isAlleyOrUnmapped: true,
        coordinates: [[28.612, 77.210], [28.615, 77.212]],
      },
      {
        id: 'e_shortcut_2',
        name: 'Liquor Vend Back-lane',
        fromNode: 'B',
        toNode: 'D',
        distanceMeters: 600,
        lightingScore: 0.15, // Poor lighting
        opennessScore: 0.3,
        baseCrowdScore: 0.2,
        isAlleyOrUnmapped: true,
        coordinates: [[28.615, 77.212], [28.620, 77.215]],
      },
      // Safe lit route: A -> C -> D (Total 1,380m: +15% distance)
      {
        id: 'e_safe_1',
        name: 'Main Market High Street',
        fromNode: 'A',
        toNode: 'C',
        distanceMeters: 700,
        lightingScore: 0.95, // Bright LED
        opennessScore: 0.90, // Wide boulevard
        baseCrowdScore: 0.85,
        isAlleyOrUnmapped: false,
        coordinates: [[28.612, 77.210], [28.614, 77.218]],
      },
      {
        id: 'e_safe_2',
        name: 'University Ring Road',
        fromNode: 'C',
        toNode: 'D',
        distanceMeters: 680,
        lightingScore: 0.90, // Well lit with CCTV
        opennessScore: 0.85,
        baseCrowdScore: 0.75,
        isAlleyOrUnmapped: false,
        coordinates: [[28.614, 77.218], [28.620, 77.215]],
      },
    ],
  };

  // 1. With alpha = 0 (Standard GPS shortest route):
  const standardRoute = findOptimalRoute(testGraph, 'A', 'D', 0, 21);
  assert.ok(standardRoute);
  assert.equal(standardRoute.totalDistanceMeters, 1200, 'Standard GPS selects 1,200m shortest path');
  assert.deepEqual(standardRoute.pathNodeIds, ['A', 'B', 'D']);
  assert.ok(standardRoute.unlitAlleysPassed >= 2, 'Standard GPS routes through unlit alleys');
  assert.ok(standardRoute.averageSafetyScore < 0.45, 'Standard GPS has high risk safety score');

  // 2. With alpha = 3 (SurakshaPath Safe Route):
  const surakshaRoute = findOptimalRoute(testGraph, 'A', 'D', 3, 21);
  assert.ok(surakshaRoute);
  assert.equal(surakshaRoute.totalDistanceMeters, 1380, 'SurakshaPath selects 1,380m safe route (+15% trade-off)');
  assert.deepEqual(surakshaRoute.pathNodeIds, ['A', 'C', 'D']);
  assert.equal(surakshaRoute.unlitAlleysPassed, 0, 'SurakshaPath avoids all unlit alleys');
  assert.ok(surakshaRoute.averageSafetyScore >= 0.7, 'SurakshaPath has high safety score (Safe)');
});

test('Safe Haven proximity calculation and sorting', () => {
  // Metro Gate to Police Post distance (~400m)
  const d = calculateHaversineDistance(28.6945, 77.2060, 28.6910, 77.2130);
  assert.ok(d > 300 && d < 1200, `Distance should be reasonable pedestrian meters: got ${d}`);

  const mockHavens = [
    {
      id: 'haven-far',
      name: 'Far Police Station',
      type: 'police_pink_booth' as const,
      address: 'Outer Road',
      lat: 28.7100,
      lng: 77.2200,
      isOpen247: true,
      hasCctvAndStaff: true,
      contactPhone: '112',
    },
    {
      id: 'haven-near',
      name: '24/7 Apollo Pharmacy',
      type: 'pharmacy_247' as const,
      address: 'Main Market',
      lat: 28.6942,
      lng: 77.2065,
      isOpen247: true,
      hasCctvAndStaff: true,
      contactPhone: '011-27660000',
    },
  ];

  const sorted = findNearestSafeHavens(28.6945, 77.2060, mockHavens, 1000);
  assert.equal(sorted.length, 1, 'Only within 1000m radius returned');
  assert.equal(sorted[0].id, 'haven-near');
  assert.ok(sorted[0].distanceMeters! < 100);
});

test('Offline Emergency SMS generator formats coordinates and fallback details', () => {
  const sms = generateOfflineEmergencySms(28.69123, 77.20845, 84, 'TRIP-9988-E2EE', 'Hostel');
  assert.ok(sms.includes('28.69123, 77.20845'));
  assert.ok(sms.includes('Battery: 84%'));
  assert.ok(sms.includes('maps.google.com'));
  assert.ok(sms.includes('112'));
});

test('Safety check-in timer expiration and PIN verification logic', () => {
  const startTime = 1700000000000;
  
  // 10 minutes elapsed, duration 15 mins -> Not expired
  assert.equal(checkSafetyTimerExpired(startTime, 15, startTime + 10 * 60 * 1000, false), false);
  
  // 16 minutes elapsed, duration 15 mins, PIN not verified -> EXPIRED!
  assert.equal(checkSafetyTimerExpired(startTime, 15, startTime + 16 * 60 * 1000, false), true);
  
  // 16 minutes elapsed, but PIN was verified safely -> NOT expired!
  assert.equal(checkSafetyTimerExpired(startTime, 15, startTime + 16 * 60 * 1000, true), false);
});

test('findNearestGraphNode locates closest intersection node from GPS coordinates', () => {
  const nodes = {
    node_metro: { id: 'node_metro', name: 'Metro Gate 2', lat: 28.6945, lng: 77.2060 },
    node_hostel: { id: 'node_hostel', name: 'Girls Hostel', lat: 28.6880, lng: 77.2140 },
  };

  // Coords right next to Metro Gate (approx 30m away)
  const nearest = findNearestGraphNode([28.6947, 77.2062], nodes);
  assert.ok(nearest);
  assert.equal(nearest.nodeId, 'node_metro');
  assert.ok(nearest.distanceMeters < 100);
});


