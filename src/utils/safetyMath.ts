/**
 * SurakshaPath Mathematical Safety & Routing Engine
 * Implements the exact formulas from Seva First Innovation Challenge 2026 (Slide 9 & 8):
 * 
 * 1. Street Safety Score Formula:
 *    S(e,t) = 0.35 * L(e) + 0.25 * O(e) + 0.20 * C(e,t) - 0.20 * min(1, I(e,t) / Imax)
 *    where:
 *      L(e) = Lighting index (0.0 to 1.0)
 *      O(e) = Openness / sightline index (0.0 to 1.0)
 *      C(e,t) = Crowd diversity & density at hour t (0.0 to 1.0)
 *      I(e,t) = Time-decayed incident score
 *      Imax = Incident scaling threshold (default 5.0)
 * 
 * 2. Routing Edge Cost Formula:
 *    W(e,t) = d(e) * (1 + alpha * (1 - S(e,t))^2)
 *    where:
 *      d(e) = Physical distance in meters
 *      alpha = Safety aversion coefficient (0 = pure shortest distance, 3 = balanced safe route, 5 = maximum safety priority)
 * 
 * 3. Temporal Risk Decay:
 *    I(t) = sum( severity_i * exp(-lambda * delta_hours) )
 * 
 * 4. Anti-Isolation Bayesian Prior:
 *    Unmapped alleys or zero-audit back-lanes default to conservative low safety score after dark (hour >= 19 or hour < 5).
 */

export interface IncidentReport {
  id: string;
  type: 'broken_light' | 'blocked_sightline' | 'deserted_area' | 'liquor_vend' | 'stalking' | 'catcalling' | 'loitering' | 'following';
  category: 'environmental' | 'behavioral';
  timestamp: number; // epoch ms
  severity: number; // 1 to 5
  lat: number;
  lng: number;
  verifiedCount: number;
  status: 'pending' | 'verified' | 'resolved';
}

export interface StreetEdge {
  id: string;
  name: string;
  fromNode: string;
  toNode: string;
  distanceMeters: number;
  lightingScore: number; // L(e): 0.0 (pitch dark) to 1.0 (bright LED floodlit)
  opennessScore: number; // O(e): 0.0 (blind alley/narrow wall) to 1.0 (wide open boulevard)
  baseCrowdScore: number; // Daytime crowd
  isAlleyOrUnmapped: boolean;
  coordinates: [number, number][]; // [lat, lng]
}

export interface NetworkGraph {
  nodes: Record<string, { id: string; name: string; lat: number; lng: number }>;
  edges: StreetEdge[];
}

/**
 * Calculates diurnal crowd diversity at hour t (0 to 23).
 * Commercial markets have high crowd until 21:30, whereas alleys empty after 18:00.
 */
export function getDiurnalCrowdScore(edge: StreetEdge, hour: number): number {
  if (edge.isAlleyOrUnmapped) {
    if (hour >= 20 || hour < 6) return 0.05;
    if (hour >= 18) return 0.2;
    return edge.baseCrowdScore * 0.6;
  }

  // Main avenues and market roads maintain crowd later
  if (hour >= 8 && hour <= 21) {
    return edge.baseCrowdScore;
  } else if (hour > 21 && hour <= 23) {
    return edge.baseCrowdScore * 0.65;
  } else if (hour > 23 || hour < 5) {
    return Math.max(0.15, edge.baseCrowdScore * 0.3);
  } else {
    // 5 AM - 8 AM early morning
    return edge.baseCrowdScore * 0.5;
  }
}

/**
 * Calculates exponential time decay for incidents on an edge.
 * Slide 8: "Recent incidents carry high weight; older reports decay exponentially over time unless reinforced".
 * halfLifeDays: default 14 days (336 hours).
 */
export function calculateDecayedIncidentScore(
  incidents: IncidentReport[],
  nowMs: number,
  halfLifeHours: number = 336
): number {
  if (!incidents || incidents.length === 0) return 0;

  const lambda = Math.LN2 / halfLifeHours;
  let totalDecayedScore = 0;

  for (const inc of incidents) {
    const elapsedHours = Math.max(0, (nowMs - inc.timestamp) / (1000 * 60 * 60));
    const decayWeight = Math.exp(-lambda * elapsedHours);
    // Behavioral incidents have higher baseline severity factor
    const categoryMultiplier = inc.category === 'behavioral' ? 1.5 : 1.0;
    totalDecayedScore += inc.severity * categoryMultiplier * decayWeight;
  }

  return totalDecayedScore;
}

/**
 * Street Safety Score Formula from Slide 9:
 * S(e,t) = 0.35*L(e) + 0.25*O(e) + 0.20*C(e,t) - 0.20 * min(1, I(e,t)/Imax)
 * Range: Clamped between [0.05, 1.0]
 */
export function calculateStreetSafetyScore(
  lighting: number,
  openness: number,
  crowd: number,
  decayedIncidentScore: number,
  imax: number = 5.0
): number {
  const L = Math.max(0, Math.min(1, lighting));
  const O = Math.max(0, Math.min(1, openness));
  const C = Math.max(0, Math.min(1, crowd));
  const incidentTerm = Math.min(1.0, decayedIncidentScore / imax);

  const rawScore = 0.35 * L + 0.25 * O + 0.20 * C - 0.20 * incidentTerm;
  return Number(Math.max(0.05, Math.min(1.0, rawScore)).toFixed(3));
}

/**
 * Bayesian Guardrail / Anti-Isolation Prior from Slide 8 & 21:
 * "Unmapped alleys default to a conservative low safety score after dark so the router never pushes users into isolated shortcuts."
 */
export function applyBayesianGuardrail(
  edge: StreetEdge,
  calculatedScore: number,
  hour: number
): number {
  const isAfterDark = hour >= 19 || hour < 6;
  if (edge.isAlleyOrUnmapped && isAfterDark) {
    // Cap unmapped alley safety score to conservative prior (0.35 max)
    return Math.min(calculatedScore, 0.35);
  }
  return calculatedScore;
}

/**
 * Routing Edge Cost Formula from Slide 9:
 * W(e,t) = d(e) * (1 + alpha * (1 - S(e,t))^2)
 */
export function calculateEdgeCost(
  distanceMeters: number,
  safetyScore: number,
  alpha: number
): number {
  const penalty = Math.pow(1 - safetyScore, 2);
  const cost = distanceMeters * (1 + alpha * penalty);
  return Number(cost.toFixed(2));
}

export interface RouteStep {
  edgeId: string;
  streetName: string;
  instruction: string;
  distanceMeters: number;
  safetyScore: number;
  lightingScore: number;
  isLit: boolean;
  coordinates: [number, number][];
}

export interface RouteResult {
  pathNodeIds: string[];
  edges: StreetEdge[];
  steps: RouteStep[];
  totalDistanceMeters: number;
  estimatedMinutes: number;
  averageSafetyScore: number;
  minSafetyScore: number;
  unlitAlleysPassed: number;
  allLit: boolean;
  totalCost: number;
  coordinates: [number, number][];
}

/**
 * A* or Dijkstra Pathfinding on our safety graph with dynamic alpha.
 */
export function findOptimalRoute(
  graph: NetworkGraph,
  startNodeId: string,
  endNodeId: string,
  alpha: number,
  hour: number,
  edgeIncidentsMap: Record<string, IncidentReport[]> = {},
  nowMs: number = Date.now()
): RouteResult | null {
  if (!graph.nodes[startNodeId] || !graph.nodes[endNodeId]) return null;

  // Build adjacency list
  const adj: Record<string, { neighbor: string; edge: StreetEdge }[]> = {};
  for (const nodeKey of Object.keys(graph.nodes)) {
    adj[nodeKey] = [];
  }
  for (const edge of graph.edges) {
    if (adj[edge.fromNode]) {
      adj[edge.fromNode].push({ neighbor: edge.toNode, edge });
    }
    // Bi-directional for pedestrian network
    if (adj[edge.toNode]) {
      adj[edge.toNode].push({ neighbor: edge.fromNode, edge });
    }
  }

  // Pre-calculate safety score & cost for each edge
  const edgeMetrics: Record<string, { safetyScore: number; cost: number; crowd: number }> = {};
  for (const edge of graph.edges) {
    const crowd = getDiurnalCrowdScore(edge, hour);
    const incs = edgeIncidentsMap[edge.id] || [];
    const decayedInc = calculateDecayedIncidentScore(incs, nowMs);
    let sScore = calculateStreetSafetyScore(edge.lightingScore, edge.opennessScore, crowd, decayedInc);
    sScore = applyBayesianGuardrail(edge, sScore, hour);
    const cost = calculateEdgeCost(edge.distanceMeters, sScore, alpha);
    edgeMetrics[edge.id] = { safetyScore: sScore, cost, crowd };
  }

  // Priority Queue / Min-heap structure simulation
  const dist: Record<string, number> = {};
  const prev: Record<string, { node: string; edge: StreetEdge } | null> = {};
  const visited = new Set<string>();

  for (const n of Object.keys(graph.nodes)) {
    dist[n] = Infinity;
    prev[n] = null;
  }
  dist[startNodeId] = 0;

  const getLowestUnvisited = () => {
    let lowest: string | null = null;
    let minD = Infinity;
    for (const n of Object.keys(graph.nodes)) {
      if (!visited.has(n) && dist[n] < minD) {
        minD = dist[n];
        lowest = n;
      }
    }
    return lowest;
  };

  while (true) {
    const current = getLowestUnvisited();
    if (!current) break;
    if (current === endNodeId) break;

    visited.add(current);

    const neighbors = adj[current] || [];
    for (const { neighbor, edge } of neighbors) {
      if (visited.has(neighbor)) continue;
      const weight = edgeMetrics[edge.id].cost;
      const newDist = dist[current] + weight;
      if (newDist < dist[neighbor]) {
        dist[neighbor] = newDist;
        prev[neighbor] = { node: current, edge };
      }
    }
  }

  if (dist[endNodeId] === Infinity) return null;

  // Reconstruct path
  const pathNodes: string[] = [];
  const pathEdges: StreetEdge[] = [];
  let curr: string | null = endNodeId;

  while (curr && curr !== startNodeId) {
    pathNodes.unshift(curr);
    const p: { node: string; edge: StreetEdge } | null = prev[curr] ?? null;
    if (!p) break;
    pathEdges.unshift(p.edge);
    curr = p.node;
  }
  pathNodes.unshift(startNodeId);

  let totalDistance = 0;
  let safetySum = 0;
  let minSafety = 1.0;
  let unlitAlleys = 0;
  const coordinates: [number, number][] = [];
  const steps: RouteStep[] = [];

  // Start coordinate
  coordinates.push([graph.nodes[startNodeId].lat, graph.nodes[startNodeId].lng]);

  for (let i = 0; i < pathEdges.length; i++) {
    const edge = pathEdges[i];
    const metrics = edgeMetrics[edge.id];
    totalDistance += edge.distanceMeters;
    safetySum += metrics.safetyScore * edge.distanceMeters;
    minSafety = Math.min(minSafety, metrics.safetyScore);

    if (edge.lightingScore < 0.4 || edge.isAlleyOrUnmapped) {
      unlitAlleys++;
    }

    // Add coordinates
    for (const coord of edge.coordinates) {
      coordinates.push(coord);
    }

    const isLit = edge.lightingScore >= 0.6;
    steps.push({
      edgeId: edge.id,
      streetName: edge.name,
      instruction: `Head along ${edge.name} (${edge.distanceMeters}m) · ${isLit ? 'Well lit corridor' : 'Caution: Low lighting'}`,
      distanceMeters: edge.distanceMeters,
      safetyScore: metrics.safetyScore,
      lightingScore: edge.lightingScore,
      isLit,
      coordinates: edge.coordinates,
    });
  }

  const avgSafetyScore = totalDistance > 0 ? Number((safetySum / totalDistance).toFixed(2)) : 1.0;
  // Pedestrian average walking speed: ~1.35 m/s (~80 meters/min)
  const walkingMinutes = Math.max(1, Math.round(totalDistance / 80));

  return {
    pathNodeIds: pathNodes,
    edges: pathEdges,
    steps,
    totalDistanceMeters: totalDistance,
    estimatedMinutes: walkingMinutes,
    averageSafetyScore: avgSafetyScore,
    minSafetyScore: Number(minSafety.toFixed(2)),
    unlitAlleysPassed: unlitAlleys,
    allLit: unlitAlleys === 0,
    totalCost: Number(dist[endNodeId].toFixed(2)),
    coordinates,
  };
}

/**
 * Generate synthetic H3 Resolution 9 hexagonal bounding coordinates for visualization.
 * In H3 Res 9, average edge length is ~107m, area is ~0.1 km², radius ~150m.
 */
export function generateHexagonVertices(centerLat: number, centerLng: number, radiusMeters: number = 150): [number, number][] {
  const vertices: [number, number][] = [];
  // 1 degree lat is ~111,000m. 1 degree lng is ~111,000m * cos(lat)
  const latDelta = radiusMeters / 111000;
  const lngDelta = radiusMeters / (111000 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i + Math.PI / 6; // pointy-topped hex
    const vLat = centerLat + latDelta * Math.sin(angle);
    const vLng = centerLng + lngDelta * Math.cos(angle);
    vertices.push([vLat, vLng]);
  }
  return vertices;
}

/**
 * Safe Haven locations (24/7 open verified shelters for immediate refuge)
 */
export interface SafeHaven {
  id: string;
  name: string;
  type: 'police_pink_booth' | 'pharmacy_247' | 'fuel_station' | 'metro_cisf';
  address: string;
  lat: number;
  lng: number;
  isOpen247: boolean;
  hasCctvAndStaff: boolean;
  contactPhone: string;
  distanceMeters?: number;
}

/**
 * Calculates Haversine distance in meters between two coordinates.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Finds and sorts nearest Safe Havens within walking distance.
 */
export function findNearestSafeHavens(
  userLat: number,
  userLng: number,
  havens: SafeHaven[],
  maxRadiusMeters: number = 2500
): SafeHaven[] {
  return havens
    .map((haven) => {
      const dist = calculateHaversineDistance(userLat, userLng, haven.lat, haven.lng);
      return { ...haven, distanceMeters: dist };
    })
    .filter((haven) => haven.distanceMeters !== undefined && haven.distanceMeters <= maxRadiusMeters)
    .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
}

/**
 * Generates an offline-resilient SMS emergency string with GPS coordinates and tracking URL.
 * Works even when 4G/5G mobile data drops.
 */
export function generateOfflineEmergencySms(
  userLat: number,
  userLng: number,
  batteryPct: number,
  tripCode: string,
  destinationName: string
): string {
  const mapLink = `https://maps.google.com/?q=${userLat.toFixed(5)},${userLng.toFixed(5)}`;
  const tripLink = `https://surakshapath.org/live/${tripCode}`;
  return `EMERGENCY ALERT from SurakshaPath: I need immediate assistance near coordinates ${userLat.toFixed(5)}, ${userLng.toFixed(5)} heading to ${destinationName}. Battery: ${batteryPct}%. Map: ${mapLink} · Live Trip: ${tripLink}. Call 112 if unreachable.`;
}

/**
 * Evaluates Safety Check-in Timer countdown.
 * Returns true if the timer expired without safety PIN verification.
 */
export function checkSafetyTimerExpired(
  startTimeMs: number,
  durationMinutes: number,
  currentTimeMs: number,
  isPinVerified: boolean
): boolean {
  if (isPinVerified) return false;
  const elapsedMinutes = (currentTimeMs - startTimeMs) / (1000 * 60);
  return elapsedMinutes >= durationMinutes;
}

/**
 * Finds the nearest graph node in the walkable network from any GPS coordinates.
 */
export function findNearestGraphNode(
  coords: [number, number],
  graphNodes: Record<string, { id: string; name: string; lat: number; lng: number }>
): { nodeId: string; name: string; distanceMeters: number } | null {
  const nodeEntries = Object.values(graphNodes);
  if (nodeEntries.length === 0) return null;

  let nearestNodeId = nodeEntries[0].id;
  let nearestName = nodeEntries[0].name;
  let minDistance = Infinity;

  for (const node of nodeEntries) {
    const dist = calculateHaversineDistance(coords[0], coords[1], node.lat, node.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestNodeId = node.id;
      nearestName = node.name;
    }
  }

  return {
    nodeId: nearestNodeId,
    name: nearestName,
    distanceMeters: minDistance,
  };
}

