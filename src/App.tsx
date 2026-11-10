/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { MapView } from './components/MapView';
import { SafeRoutePanel } from './components/SafeRoutePanel';
import { H3HeatmapPanel } from './components/H3HeatmapPanel';
import { SafeHavensPanel } from './components/SafeHavensPanel';
import { ZeroPiiReportModal } from './components/ZeroPiiReportModal';
import { LiveTripShareModal } from './components/LiveTripShareModal';
import { CivicActionPanel } from './components/CivicActionPanel';
import { FormulaSimulationModal } from './components/FormulaSimulationModal';
import { ProjectDossierModal } from './components/ProjectDossierModal';
import { StealthCalculatorModal } from './components/StealthCalculatorModal';
import { FakeCallModal } from './components/FakeCallModal';
import { SafetyWalkTimerModal } from './components/SafetyWalkTimerModal';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { StrobeDeterrentModal } from './components/StrobeDeterrentModal';
import { AudioMemoModal } from './components/AudioMemoModal';
import { SurakshaAiCompanionModal } from './components/SurakshaAiCompanionModal';

import {
  findOptimalRoute,
  NetworkGraph,
  IncidentReport,
  RouteResult,
  SafeHaven,
  findNearestGraphNode
} from './utils/safetyMath';
import {
  DEFAULT_MAP_CENTER,
  INITIAL_GRAPH,
  INITIAL_INCIDENTS,
  INITIAL_HEX_CELLS,
  INITIAL_CIVIC_WORK_ORDERS,
  INITIAL_SAFE_HAVENS,
  H3HexCell,
  CivicWorkOrder
} from './data/mockData';
import { useDeviceLocation } from './hooks/useDeviceLocation';
import { AppThemeId, APP_THEMES } from './utils/themeConfig';

export default function App() {
  // Navigation & Core State
  const [activeTab, setActiveTab] = useState<'route' | 'havens' | 'h3' | 'report' | 'share' | 'civic'>('route');
  const [graph, setGraph] = useState<NetworkGraph>(INITIAL_GRAPH);
  const [incidents, setIncidents] = useState<IncidentReport[]>(INITIAL_INCIDENTS);
  const [hexCells, setHexCells] = useState<H3HexCell[]>(INITIAL_HEX_CELLS);
  const [civicOrders, setCivicOrders] = useState<CivicWorkOrder[]>(INITIAL_CIVIC_WORK_ORDERS);
  const [safeHavens, setSafeHavens] = useState<SafeHaven[]>(INITIAL_SAFE_HAVENS);

  // Aesthetic Theme State (Default: Blush Rose Quartz)
  const [currentThemeId, setCurrentThemeId] = useState<AppThemeId>('rose-quartz');
  const currentTheme = APP_THEMES[currentThemeId];

  // Real Device Geolocation Hook
  const deviceLoc = useDeviceLocation();

  // Map user location (defaults to pilot origin or device GPS)
  const [userLocation, setUserLocation] = useState<[number, number]>([28.6945, 77.2060]); // Starts at Metro station

  // Routing Selection
  const [originNodeId, setOriginNodeId] = useState<string>('node_metro');
  const [destinationNodeId, setDestinationNodeId] = useState<string>('node_hostel_campus');
  const [selectedRouteType, setSelectedRouteType] = useState<'suraksha' | 'shortest' | 'both'>('suraksha');
  const [alpha, setAlpha] = useState<number>(3.0); // SurakshaPath recommended coefficient
  const [currentHour, setCurrentHour] = useState<number>(21); // Default: 9:00 PM (Slide 9 simulation benchmark)

  // Heatmap State
  const [activeHeatmapLayer, setActiveHeatmapLayer] = useState<'safety' | 'lighting' | 'crowd' | 'incidents'>('safety');
  const [selectedHexCell, setSelectedHexCell] = useState<H3HexCell | null>(null);

  // Modals & Panels
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);

  // Women Developer Core Production Modals
  const [isStealthModalOpen, setIsStealthModalOpen] = useState(false);
  const [isFakeCallModalOpen, setIsFakeCallModalOpen] = useState(false);
  const [isWalkTimerModalOpen, setIsWalkTimerModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isStrobeModalOpen, setIsStrobeModalOpen] = useState(false);
  const [isAudioMemoModalOpen, setIsAudioMemoModalOpen] = useState(false);
  const [isAiCompanionOpen, setIsAiCompanionOpen] = useState(false);
  const [havenAlertNotice, setHavenAlertNotice] = useState<string | null>(null);

  // Live Pedestrian Walk Simulator
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);
  const [walkStepIndex, setWalkStepIndex] = useState(0);

  // Ephemeral Trip Code
  const tripCode = useMemo(() => `TRIP-${Math.floor(10000 + Math.random() * 90000)}-E2EE`, []);

  // Handler for requesting device location
  const handleRequestDeviceLocation = useCallback(async () => {
    const coords = await deviceLoc.requestLocation();
    if (coords) {
      setUserLocation(coords);

      // Snap origin to closest node in our graph
      const nearest = findNearestGraphNode(coords, graph.nodes);
      if (nearest) {
        setOriginNodeId(nearest.nodeId);
        setHavenAlertNotice(
          `GPS Acquired (±${Math.round(deviceLoc.accuracy || 12)}m). Snapped to ${nearest.name} (${nearest.distanceMeters}m away)`
        );
        setTimeout(() => setHavenAlertNotice(null), 5000);
      }
    }
  }, [deviceLoc, graph.nodes]);

  // Sync user location when device location hook updates
  useEffect(() => {
    if (deviceLoc.coordinates) {
      setUserLocation(deviceLoc.coordinates);
    }
  }, [deviceLoc.coordinates]);

  // Map edges to incidents
  const edgeIncidentsMap = useMemo(() => {
    const map: Record<string, IncidentReport[]> = {};
    for (const inc of incidents) {
      if (inc.type === 'broken_light') {
        map['edge_liquor_alley'] = [...(map['edge_liquor_alley'] || []), inc];
      } else if (inc.type === 'catcalling') {
        map['edge_bazaar_shortcut'] = [...(map['edge_bazaar_shortcut'] || []), inc];
      } else {
        map['edge_park_shortcut'] = [...(map['edge_park_shortcut'] || []), inc];
      }
    }
    return map;
  }, [incidents]);

  // Compute Routes Dynamically using Slide 9 Formulas
  const surakshaRoute: RouteResult | null = useMemo(() => {
    return findOptimalRoute(
      graph,
      originNodeId,
      destinationNodeId,
      alpha,
      currentHour,
      edgeIncidentsMap,
      Date.now()
    );
  }, [graph, originNodeId, destinationNodeId, alpha, currentHour, edgeIncidentsMap]);

  const shortestRoute: RouteResult | null = useMemo(() => {
    return findOptimalRoute(
      graph,
      originNodeId,
      destinationNodeId,
      0, // alpha = 0 is pure shortest distance (Standard GPS)
      currentHour,
      edgeIncidentsMap,
      Date.now()
    );
  }, [graph, originNodeId, destinationNodeId, currentHour, edgeIncidentsMap]);

  // Turn-by-Turn Walk Simulator Interval
  useEffect(() => {
    if (!isSimulatingWalk || !surakshaRoute || surakshaRoute.coordinates.length === 0) {
      setWalkStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setWalkStepIndex((prev) => {
        const next = prev + 1;
        if (next >= surakshaRoute.coordinates.length) {
          setIsSimulatingWalk(false);
          if ('vibrate' in navigator) {
            try { navigator.vibrate([100, 50, 100]); } catch (_) {}
          }
          return 0;
        }
        return next;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isSimulatingWalk, surakshaRoute]);

  // Handle new anonymous report
  const handleAddNewReport = (newReport: IncidentReport) => {
    setIncidents((prev) => [newReport, ...prev]);

    setHexCells((prev) =>
      prev.map((cell) => {
        const dist = Math.hypot(cell.centerLat - newReport.lat, cell.centerLng - newReport.lng);
        if (dist < 0.003) {
          const newIncCount = cell.incidentCount + 1;
          const newSafety = Math.max(0.2, Number((cell.safetyScore - 0.08).toFixed(2)));
          return {
            ...cell,
            incidentCount: newIncCount,
            safetyScore: newSafety,
            riskLevel: newSafety < 0.45 ? 'high_risk' : cell.riskLevel,
            kAnonymityCount: cell.kAnonymityCount + 1,
            lastAuditedText: 'Just audited · 1 fresh hardware-attested report',
          };
        }
        return cell;
      })
    );
  };

  // Handle Closed-Loop Civic Verification (Slide 8 & 21)
  const handleVerifyCivicFix = (orderId: string, isFixed: boolean) => {
    setCivicOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: isFixed ? 'RESOLVED' : 'IN_PROGRESS',
            actionRequired: isFixed
              ? 'Closed by community consensus. Verified well-lit by commuter.'
              : 'Re-inspection needed: Commuter reported lamp still dark.',
          };
        }
        return order;
      })
    );

    if (isFixed) {
      setGraph((prev) => ({
        ...prev,
        edges: prev.edges.map((edge) => {
          if (edge.id === 'edge_liquor_alley' || edge.id === 'edge_bazaar_shortcut') {
            return {
              ...edge,
              lightingScore: 0.90,
              opennessScore: Math.min(1.0, edge.opennessScore + 0.2),
            };
          }
          return edge;
        }),
      }));

      setHexCells((prev) =>
        prev.map((cell) => {
          if (cell.id === '8928308281fffff' || cell.id === '8928308282fffff') {
            return {
              ...cell,
              safetyScore: 0.85,
              lightingIndex: 0.92,
              riskLevel: 'safe',
              lastAuditedText: 'Audited just now: Commuter confirmed PWD LED fixture active',
            };
          }
          return cell;
        })
      );
    }
  };

  // Immediate Reroute to a 24/7 Safe Haven
  const handleRerouteToHaven = (haven: SafeHaven) => {
    let closestNode = 'node_central_crossing';
    if (haven.type === 'police_pink_booth') closestNode = 'node_central_crossing';
    if (haven.type === 'pharmacy_247') closestNode = 'node_market_avenue';
    if (haven.type === 'fuel_station') closestNode = 'node_market_avenue';
    if (haven.type === 'metro_cisf') closestNode = 'node_metro';

    setDestinationNodeId(closestNode);
    setActiveTab('route');
    setSelectedRouteType('suraksha');
    setHavenAlertNotice(`🌸 Emergency Escort to ${haven.name} via illuminated corridors`);
    setTimeout(() => setHavenAlertNotice(null), 6000);
  };

  // Silent SOS trigger from Stealth Calculator
  const handleSilentSos = () => {
    setIsSosActive(true);
    if ('vibrate' in navigator) {
      try { navigator.vibrate([80, 40, 80]); } catch (_) {}
    }
  };

  // Export GeoJSON Work Orders (Slide 6 & 7)
  const handleExportGeoJson = () => {
    const geoJsonData = {
      type: 'FeatureCollection',
      metadata: {
        platform: 'SurakshaPath Civic Gateway',
        generatedAt: new Date().toISOString(),
        totalWorkOrders: civicOrders.length,
        authority: 'Municipal Corporation of Delhi (MCD) & Delhi Police PCR',
      },
      features: civicOrders.map((wo) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [wo.lng, wo.lat],
        },
        properties: {
          id: wo.id,
          department: wo.department,
          title: wo.title,
          location: wo.location,
          h3Index: wo.h3Index,
          priority: wo.priority,
          status: wo.status,
          averageLuxLevel: wo.averageLuxLevel,
          reportedIncidentsCount: wo.reportedIncidentsCount,
          actionRequired: wo.actionRequired,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geoJsonData, null, 2)], {
      type: 'application/geo+json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `surakshapath-civic-workorders-${new Date().toISOString().split('T')[0]}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const pendingCivicCount = useMemo(() => {
    return civicOrders.filter((wo) => wo.status === 'REPAIRED_AWAITING_VERIFICATION').length;
  }, [civicOrders]);

  return (
    <AndroidFrame
      activeTab={activeTab}
      setActiveTab={(tab) => {
        if (tab === 'report') {
          setIsReportModalOpen(true);
        } else {
          setActiveTab(tab);
        }
      }}
      theme={currentTheme}
      onChangeTheme={setCurrentThemeId}
      onOpenSimulator={() => setIsSimulatorModalOpen(true)}
      onOpenDossier={() => setIsDossierModalOpen(true)}
      onOpenAiCompanion={() => setIsAiCompanionOpen(true)}
      onTriggerSOS={() => {
        setIsSosActive(true);
        setIsShareModalOpen(true);
      }}
      onOpenStealthCalculator={() => setIsStealthModalOpen(true)}
      onTriggerFakeCall={() => setIsFakeCallModalOpen(true)}
      onOpenWalkTimer={() => setIsWalkTimerModalOpen(true)}
      onOpenEmergencyContacts={() => setIsContactsModalOpen(true)}
      onOpenStrobeDeterrent={() => setIsStrobeModalOpen(true)}
      onOpenAudioMemo={() => setIsAudioMemoModalOpen(true)}
      pendingCivicPromptCount={pendingCivicCount}
      safetyScore={surakshaRoute?.averageSafetyScore ?? 0.86}
    >
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        {/* Safe Haven Emergency Alert Toast */}
        {havenAlertNotice && (
          <div className="absolute top-2 left-3 right-3 z-30 bg-rose-950/95 border border-rose-500 text-rose-100 text-xs px-3 py-2 rounded-xl shadow-xl flex items-center justify-between animate-bounce">
            <span className="font-semibold">{havenAlertNotice}</span>
            <button onClick={() => setHavenAlertNotice(null)} className="text-rose-300 font-bold ml-2">✕</button>
          </div>
        )}

        {/* Top Split: Interactive Leaflet Map */}
        <div className="relative w-full h-[46%] shrink-0">
          <MapView
            center={DEFAULT_MAP_CENTER}
            zoom={15}
            theme={currentTheme}
            hexCells={hexCells}
            activeHeatmapLayer={activeHeatmapLayer}
            showHexGrid={activeTab === 'h3' || activeTab === 'route'}
            incidents={incidents}
            showIncidents={activeTab !== 'route' || selectedRouteType === 'both'}
            civicOrders={civicOrders}
            showCivicOrders={activeTab === 'civic'}
            safeHavens={safeHavens}
            showSafeHavens={true}
            onSelectSafeHaven={handleRerouteToHaven}
            surakshaRoute={surakshaRoute}
            shortestRoute={shortestRoute}
            selectedRouteType={selectedRouteType}
            userCurrentLocation={userLocation}
            deviceAccuracy={deviceLoc.accuracy}
            isLocating={deviceLoc.isLocating}
            permissionStatus={deviceLoc.permissionStatus}
            onRequestDeviceLocation={handleRequestDeviceLocation}
            originNodeId={originNodeId}
            destinationNodeId={destinationNodeId}
            graphNodes={graph.nodes}
            onSelectHexCell={(cell) => {
              setSelectedHexCell(cell);
              if (activeTab !== 'h3') setActiveTab('h3');
            }}
            onMapClickLocation={(lat, lng) => {
              setUserLocation([lat, lng]);
            }}
            isSimulatingWalk={isSimulatingWalk}
            walkStepIndex={walkStepIndex}
          />
        </div>

        {/* Bottom Split: Tabbed Panel Content */}
        <div className={`relative flex-1 w-full overflow-hidden ${currentTheme.bgApp} border-t ${currentTheme.borderBase} shadow-2xl`}>
          {activeTab === 'route' && (
            <SafeRoutePanel
              surakshaRoute={surakshaRoute}
              shortestRoute={shortestRoute}
              selectedRouteType={selectedRouteType}
              setSelectedRouteType={setSelectedRouteType}
              originNodeId={originNodeId}
              destinationNodeId={destinationNodeId}
              setOriginNodeId={setOriginNodeId}
              setDestinationNodeId={setDestinationNodeId}
              graphNodes={graph.nodes}
              isSimulatingWalk={isSimulatingWalk}
              onToggleSimulateWalk={() => setIsSimulatingWalk(!isSimulatingWalk)}
              walkStepIndex={walkStepIndex}
              onOpenTripShare={() => setIsShareModalOpen(true)}
              onOpenSimulator={() => setIsSimulatorModalOpen(true)}
              onOpenEmergencyContacts={() => setIsContactsModalOpen(true)}
              currentHour={currentHour}
              theme={currentTheme}
              deviceLocation={deviceLoc.coordinates}
              deviceAccuracy={deviceLoc.accuracy}
              isLocating={deviceLoc.isLocating}
              onRequestDeviceLocation={handleRequestDeviceLocation}
              alpha={alpha}
              setAlpha={setAlpha}
            />
          )}

          {activeTab === 'havens' && (
            <SafeHavensPanel
              havens={safeHavens}
              userLat={userLocation[0]}
              userLng={userLocation[1]}
              onRerouteToHaven={handleRerouteToHaven}
              theme={currentTheme}
            />
          )}

          {activeTab === 'h3' && (
            <H3HeatmapPanel
              hexCells={hexCells}
              selectedHexCell={selectedHexCell}
              onSelectHexCell={setSelectedHexCell}
              activeHeatmapLayer={activeHeatmapLayer}
              setActiveHeatmapLayer={setActiveHeatmapLayer}
              currentHour={currentHour}
              setCurrentHour={setCurrentHour}
            />
          )}

          {activeTab === 'share' && (
            <div className={`p-4 h-full overflow-y-auto ${currentTheme.bgApp}`}>
              <div className="text-center py-4 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
                  <span className="text-xl">🛡️</span>
                </div>
                <h3 className="font-bold text-rose-100 text-sm">
                  End-to-End Encrypted Live Guardian Watch
                </h3>
                <p className={`text-xs ${currentTheme.textMuted} max-w-xs mx-auto`}>
                  Share your live walk with family, trusted friends, and emergency guardians. Links expire automatically upon arrival.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className={`py-2.5 px-4 rounded-xl ${currentTheme.accentBg} text-white font-bold text-xs shadow-md ${currentTheme.accentGlow} cursor-pointer`}
                  >
                    Open Guardian Live Hub & SOS
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'civic' && (
            <CivicActionPanel
              civicOrders={civicOrders}
              onVerifyCivicFix={handleVerifyCivicFix}
              onExportGeoJson={handleExportGeoJson}
            />
          )}
        </div>
      </div>

      {/* Production Modals */}
      <StealthCalculatorModal
        isOpen={isStealthModalOpen}
        onClose={() => setIsStealthModalOpen(false)}
        onSilentSosTrigger={handleSilentSos}
      />

      <FakeCallModal
        isOpen={isFakeCallModalOpen}
        onClose={() => setIsFakeCallModalOpen(false)}
      />

      <SafetyWalkTimerModal
        isOpen={isWalkTimerModalOpen}
        onClose={() => setIsWalkTimerModalOpen(false)}
        onEscalateEmergency={() => {
          setIsSosActive(true);
          setIsShareModalOpen(true);
        }}
      />

      <ZeroPiiReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitReport={handleAddNewReport}
        userCoords={userLocation}
      />

      <LiveTripShareModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setIsSosActive(false);
        }}
        isSosActive={isSosActive}
        onTriggerSos={() => setIsSosActive(true)}
        onDismissSos={() => setIsSosActive(false)}
        tripCode={tripCode}
        destinationName={graph.nodes[destinationNodeId]?.name || 'Destination'}
        etaMins={surakshaRoute?.estimatedMinutes || 17}
        userCoords={userLocation}
        deviceAccuracy={deviceLoc.accuracy}
      />

      <FormulaSimulationModal
        isOpen={isSimulatorModalOpen}
        onClose={() => setIsSimulatorModalOpen(false)}
        alpha={alpha}
        setAlpha={setAlpha}
        currentHour={currentHour}
        setCurrentHour={setCurrentHour}
      />

      <ProjectDossierModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
      />

      <EmergencyContactsModal
        isOpen={isContactsModalOpen}
        onClose={() => setIsContactsModalOpen(false)}
        theme={currentTheme}
        tripCode={tripCode}
        userCoords={userLocation}
      />

      <StrobeDeterrentModal
        isOpen={isStrobeModalOpen}
        onClose={() => setIsStrobeModalOpen(false)}
      />

      <AudioMemoModal
        isOpen={isAudioMemoModalOpen}
        onClose={() => setIsAudioMemoModalOpen(false)}
        theme={currentTheme}
        userCoords={userLocation}
      />

      <SurakshaAiCompanionModal
        isOpen={isAiCompanionOpen}
        onClose={() => setIsAiCompanionOpen(false)}
        theme={currentTheme}
        userCoords={userLocation}
        currentHour={currentHour}
        safetyScore={surakshaRoute?.averageSafetyScore ?? 0.86}
        nearestHaven={safeHavens[0]}
        onTriggerSos={() => {
          setIsSosActive(true);
          setIsShareModalOpen(true);
        }}
        onTriggerFakeCall={() => setIsFakeCallModalOpen(true)}
        onTriggerSiren={() => setIsStrobeModalOpen(true)}
        onRerouteToHaven={handleRerouteToHaven}
        onOpenTripShare={() => setIsShareModalOpen(true)}
      />
    </AndroidFrame>
  );
}
