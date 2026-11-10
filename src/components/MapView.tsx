import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RouteResult, generateHexagonVertices, IncidentReport, SafeHaven } from '../utils/safetyMath';
import { H3HexCell, CivicWorkOrder } from '../data/mockData';
import { AppTheme } from '../utils/themeConfig';
import { Crosshair, Loader2, Compass } from 'lucide-react';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  theme: AppTheme;
  hexCells: H3HexCell[];
  activeHeatmapLayer: 'safety' | 'lighting' | 'crowd' | 'incidents';
  showHexGrid: boolean;
  incidents: IncidentReport[];
  showIncidents: boolean;
  civicOrders: CivicWorkOrder[];
  showCivicOrders: boolean;
  safeHavens: SafeHaven[];
  showSafeHavens: boolean;
  onSelectSafeHaven?: (haven: SafeHaven) => void;
  surakshaRoute: RouteResult | null;
  shortestRoute: RouteResult | null;
  selectedRouteType: 'suraksha' | 'shortest' | 'both';
  userCurrentLocation: [number, number] | null;
  deviceAccuracy?: number | null;
  isLocating?: boolean;
  permissionStatus?: 'prompt' | 'granted' | 'denied' | 'unsupported';
  onRequestDeviceLocation?: () => void;
  originNodeId: string;
  destinationNodeId: string;
  graphNodes: Record<string, { id: string; name: string; lat: number; lng: number }>;
  onSelectHexCell: (cell: H3HexCell) => void;
  onMapClickLocation?: (lat: number, lng: number) => void;
  isSimulatingWalk: boolean;
  walkStepIndex: number;
}

export const MapView: React.FC<MapViewProps> = ({
  center,
  zoom,
  theme,
  hexCells,
  activeHeatmapLayer,
  showHexGrid,
  incidents,
  showIncidents,
  civicOrders,
  showCivicOrders,
  safeHavens,
  showSafeHavens,
  onSelectSafeHaven,
  surakshaRoute,
  shortestRoute,
  selectedRouteType,
  userCurrentLocation,
  deviceAccuracy,
  isLocating,
  permissionStatus,
  onRequestDeviceLocation,
  originNodeId,
  destinationNodeId,
  graphNodes,
  onSelectHexCell,
  onMapClickLocation,
  isSimulatingWalk,
  walkStepIndex,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.FeatureGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const featureGroup = L.featureGroup().addTo(map);
    layersGroupRef.current = featureGroup;
    mapInstanceRef.current = map;

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClickLocation) {
        onMapClickLocation(e.latlng.lat, e.latlng.lng);
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center & zoom if needed
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(center, zoom);
  }, [center, zoom]);

  // Center on user location when requested
  const handlePanToUserLocation = () => {
    if (onRequestDeviceLocation) {
      onRequestDeviceLocation();
    }
    if (userCurrentLocation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(userCurrentLocation, 16, { duration: 1.2 });
    }
  };

  // Redraw overlays on state changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // 1. Draw H3 Hexagonal Grid if enabled
    if (showHexGrid) {
      hexCells.forEach((cell) => {
        const vertices = generateHexagonVertices(cell.centerLat, cell.centerLng, 160);
        
        let fillColor = theme.accentColor;
        let fillOpacity = 0.35;

        if (activeHeatmapLayer === 'safety') {
          if (cell.safetyScore >= 0.7) {
            fillColor = theme.id === 'rose-quartz' ? '#f43f5e' : theme.id === 'twilight-lavender' ? '#c084fc' : '#10b981';
            fillOpacity = 0.32;
          } else if (cell.safetyScore >= 0.45) {
            fillColor = '#f59e0b'; // Amber
            fillOpacity = 0.40;
          } else {
            fillColor = '#ef4444'; // Red (High Risk)
            fillOpacity = 0.48;
          }
        } else if (activeHeatmapLayer === 'lighting') {
          if (cell.lightingIndex < 0.3) {
            fillColor = '#581c87'; // Darkness
            fillOpacity = 0.55;
          } else if (cell.lightingIndex < 0.7) {
            fillColor = '#fbbf24';
            fillOpacity = 0.35;
          } else {
            fillColor = '#38bdf8'; // High illumination
            fillOpacity = 0.35;
          }
        } else if (activeHeatmapLayer === 'crowd') {
          if (cell.crowdIndex < 0.25) {
            fillColor = '#dc2626'; // Deserted
            fillOpacity = 0.45;
          } else {
            fillColor = '#ec4899';
            fillOpacity = cell.crowdIndex * 0.45;
          }
        } else if (activeHeatmapLayer === 'incidents') {
          if (cell.incidentCount > 5) {
            fillColor = '#b91c1c';
            fillOpacity = 0.55;
          } else if (cell.incidentCount > 0) {
            fillColor = '#f97316';
            fillOpacity = 0.40;
          } else {
            fillColor = theme.accentColor;
            fillOpacity = 0.20;
          }
        }

        const polygon = L.polygon(vertices, {
          color: fillColor,
          weight: 1.5,
          opacity: 0.8,
          fillColor,
          fillOpacity,
          dashArray: cell.safetyScore < 0.4 ? '4, 4' : undefined,
        });

        polygon.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectHexCell(cell);
        });

        // Add subtle H3 badge marker in center
        const hexIcon = L.divIcon({
          className: 'h3-hex-label',
          html: `
            <div style="
              background: rgba(24, 10, 28, 0.90);
              border: 1px solid ${fillColor};
              color: white;
              padding: 2px 5px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 700;
              text-align: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.5);
              white-space: nowrap;
              transform: translate(-50%, -50%);
            ">
              ${(cell.safetyScore * 10).toFixed(1)} <span style="opacity:0.75; font-size:8px;">H3</span>
            </div>
          `,
          iconSize: [0, 0],
        });
        const centerMarker = L.marker([cell.centerLat, cell.centerLng], { icon: hexIcon });
        centerMarker.on('click', () => onSelectHexCell(cell));

        group.addLayer(polygon);
        group.addLayer(centerMarker);
      });
    }

    // 2. Draw Routes
    // Draw Shortest Route (Red / Warning if unsafe)
    if (shortestRoute && (selectedRouteType === 'shortest' || selectedRouteType === 'both')) {
      const shortestPolyline = L.polyline(shortestRoute.coordinates, {
        color: theme.shortestRouteColor,
        weight: 5,
        opacity: selectedRouteType === 'both' ? 0.7 : 0.9,
        dashArray: '6, 8',
        lineCap: 'round',
      });
      shortestPolyline.bindTooltip(
        `<b>Standard Shortest GPS</b><br>${shortestRoute.totalDistanceMeters}m (${shortestRoute.estimatedMinutes}m)<br>⚠️ High Risk (Score: ${shortestRoute.averageSafetyScore})`,
        { sticky: true }
      );
      group.addLayer(shortestPolyline);
    }

    // Draw SurakshaPath Safe Route (Glow & Lit Corridor)
    if (surakshaRoute && (selectedRouteType === 'suraksha' || selectedRouteType === 'both')) {
      // Glow underlay
      const glowPolyline = L.polyline(surakshaRoute.coordinates, {
        color: theme.safeRouteColor,
        weight: 12,
        opacity: 0.35,
        lineCap: 'round',
      });
      group.addLayer(glowPolyline);

      const safePolyline = L.polyline(surakshaRoute.coordinates, {
        color: theme.safeRouteColor,
        weight: 6,
        opacity: 0.95,
        lineCap: 'round',
      });
      safePolyline.bindTooltip(
        `<b>🛡️ SurakshaPath Safe Route</b><br>${surakshaRoute.totalDistanceMeters}m (${surakshaRoute.estimatedMinutes}m)<br>✨ Safe Lit Corridor (Score: ${surakshaRoute.averageSafetyScore})`,
        { sticky: true }
      );
      group.addLayer(safePolyline);
    }

    // 3. Draw Start & End Markers
    if (graphNodes[originNodeId]) {
      const startNode = graphNodes[originNodeId];
      const startIcon = L.divIcon({
        className: 'origin-marker',
        html: `
          <div style="
            background: ${theme.accentColor};
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 800;
            box-shadow: 0 0 14px ${theme.accentColor}cc;
            border: 2px solid white;
            transform: translate(-50%, -50%);
          ">A</div>
        `,
        iconSize: [0, 0],
      });
      const m1 = L.marker([startNode.lat, startNode.lng], { icon: startIcon });
      m1.bindPopup(`<b>Origin:</b> ${startNode.name}`);
      group.addLayer(m1);
    }

    if (graphNodes[destinationNodeId]) {
      const destNode = graphNodes[destinationNodeId];
      const destIcon = L.divIcon({
        className: 'destination-marker',
        html: `
          <div style="
            background: #6366f1;
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 800;
            box-shadow: 0 0 14px rgba(99, 102, 241, 0.8);
            border: 2px solid white;
            transform: translate(-50%, -50%);
          ">B</div>
        `,
        iconSize: [0, 0],
      });
      const m2 = L.marker([destNode.lat, destNode.lng], { icon: destIcon });
      m2.bindPopup(`<b>Destination:</b> ${destNode.name}`);
      group.addLayer(m2);
    }

    // 4. Draw Incident Reports (Hazard Pins)
    if (showIncidents) {
      incidents.forEach((inc) => {
        const isBehavioral = inc.category === 'behavioral';
        const color = isBehavioral ? '#dc2626' : '#d97706';
        const iconEmoji = inc.type === 'broken_light' ? '💡' : inc.type === 'catcalling' ? '🗣️' : inc.type === 'stalking' ? '👁️' : '⚠️';

        const hazardIcon = L.divIcon({
          className: 'incident-marker',
          html: `
            <div style="
              background: ${color};
              color: white;
              padding: 4px;
              border-radius: 50%;
              width: 26px;
              height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 13px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.5);
              border: 1.5px solid #ffffff;
              transform: translate(-50%, -50%);
            ">
              ${iconEmoji}
            </div>
          `,
          iconSize: [0, 0],
        });

        const incMarker = L.marker([inc.lat, inc.lng], { icon: hazardIcon });
        incMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a;">
            <div style="font-weight: 700; color: ${color}; text-transform: uppercase; font-size: 10px;">
              ${inc.category} Hazard · Zero-PII Attested
            </div>
            <div style="font-weight: 600; font-size: 13px; margin: 2px 0;">
              ${inc.type.replace('_', ' ').toUpperCase()}
            </div>
            <div>Severity: ${'★'.repeat(inc.severity)}${'☆'.repeat(5 - inc.severity)}</div>
            <div style="color: #64748b; font-size: 11px; margin-top: 4px;">
              Verified by ${inc.verifiedCount} commuters in 500m geofence
            </div>
          </div>
        `);
        group.addLayer(incMarker);
      });
    }

    // 5. Draw Municipal Civic Work Orders
    if (showCivicOrders) {
      civicOrders.forEach((wo) => {
        const isFixedPending = wo.status === 'REPAIRED_AWAITING_VERIFICATION';
        const badgeColor = isFixedPending ? '#3b82f6' : '#ea580c';
        const iconHtml = isFixedPending ? '🔧' : '📋';

        const civicIcon = L.divIcon({
          className: 'civic-marker',
          html: `
            <div style="
              background: ${badgeColor};
              color: white;
              border-radius: 6px;
              padding: 2px 6px;
              font-size: 11px;
              font-weight: 700;
              border: 1.5px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              white-space: nowrap;
              transform: translate(-50%, -50%);
              display: flex;
              align-items: center;
              gap: 3px;
            ">
              <span>${iconHtml}</span> ${wo.department.split('_')[0]}
            </div>
          `,
          iconSize: [0, 0],
        });

        const woMarker = L.marker([wo.lat, wo.lng], { icon: civicIcon });
        woMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px;">
            <div style="font-weight: 700; color: #2563eb;">${wo.id} · ${wo.department}</div>
            <div style="font-weight: 600; margin: 2px 0;">${wo.title}</div>
            <div style="color: #64748b; font-size: 11px;">${wo.location} (Lux: ${wo.averageLuxLevel})</div>
            <div style="margin-top: 4px; font-weight: 600; color: ${isFixedPending ? '#2563eb' : '#dc2626'};">
              Status: ${wo.status.replace(/_/g, ' ')}
            </div>
          </div>
        `);
        group.addLayer(woMarker);
      });
    }

    // 6. Draw 24/7 Verified Safe Havens (With Pink Booth highlighted)
    if (showSafeHavens && safeHavens) {
      safeHavens.forEach((haven) => {
        const isPinkBooth = haven.type === 'police_pink_booth';
        const havenColor = isPinkBooth ? '#ec4899' : haven.type === 'pharmacy_247' ? '#10b981' : '#0ea5e9';
        const iconChar = isPinkBooth ? '🌸' : haven.type === 'pharmacy_247' ? '💊' : haven.type === 'fuel_station' ? '⛽' : '👮';

        const havenIcon = L.divIcon({
          className: 'safe-haven-marker',
          html: `
            <div style="
              background: ${havenColor};
              color: white;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              box-shadow: 0 0 16px ${havenColor}cc;
              border: 2px solid #ffffff;
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              ${iconChar}
            </div>
          `,
          iconSize: [0, 0],
        });

        const havenMarker = L.marker([haven.lat, haven.lng], { icon: havenIcon, zIndexOffset: 850 });
        havenMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; color: #0f172a;">
            <div style="font-weight: 800; color: ${havenColor}; font-size: 10px; text-transform: uppercase;">
              ${isPinkBooth ? '🌸 All-Women Staff Sanctuary' : '24/7 Safe Haven Sanctuary'}
            </div>
            <div style="font-weight: 700; font-size: 13px; margin: 2px 0;">
              ${haven.name}
            </div>
            <div style="color: #64748b; font-size: 11px;">
              ${haven.address}
            </div>
            <div style="margin-top: 4px; font-size: 11px; font-weight: 600; color: #10b981;">
              ✓ CCTV Monitored · Staff on Duty
            </div>
          </div>
        `);
        havenMarker.on('click', () => {
          if (onSelectSafeHaven) onSelectSafeHaven(haven);
        });
        group.addLayer(havenMarker);
      });
    }

    // 7. Device Location Accuracy Ring (if real device GPS available)
    if (userCurrentLocation && deviceAccuracy && deviceAccuracy > 0) {
      const accuracyCircle = L.circle(userCurrentLocation, {
        radius: Math.min(deviceAccuracy, 120),
        color: theme.accentColor,
        fillColor: theme.accentColor,
        fillOpacity: 0.12,
        weight: 1,
        dashArray: '3, 4',
      });
      group.addLayer(accuracyCircle);
    }

    // 8. User Current Location or Simulated Walk Location Marker
    const activeLoc = isSimulatingWalk && surakshaRoute && surakshaRoute.coordinates[walkStepIndex]
      ? surakshaRoute.coordinates[walkStepIndex]
      : userCurrentLocation;

    if (activeLoc) {
      const userLocIcon = L.divIcon({
        className: 'user-pulse-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; transform: translate(-50%, -50%);">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: ${theme.userPulseColor};
              opacity: 0.45;
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              top: 4px;
              left: 4px;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${theme.accentColor};
              border: 3px solid #ffffff;
              box-shadow: 0 0 12px ${theme.accentColor};
            "></div>
          </div>
        `,
        iconSize: [0, 0],
      });

      const userMarker = L.marker(activeLoc, { icon: userLocIcon, zIndexOffset: 1000 });
      userMarker.bindTooltip(
        deviceAccuracy
          ? `📍 Live GPS (${activeLoc[0].toFixed(4)}°, ${activeLoc[1].toFixed(4)}°) · ±${Math.round(deviceAccuracy)}m`
          : `📍 Live Location: (${activeLoc[0].toFixed(4)}°, ${activeLoc[1].toFixed(4)}°)`,
        { direction: 'top', offset: [0, -14] }
      );
      group.addLayer(userMarker);
    }
  }, [
    hexCells,
    activeHeatmapLayer,
    showHexGrid,
    incidents,
    showIncidents,
    civicOrders,
    showCivicOrders,
    safeHavens,
    showSafeHavens,
    surakshaRoute,
    shortestRoute,
    selectedRouteType,
    userCurrentLocation,
    deviceAccuracy,
    originNodeId,
    destinationNodeId,
    graphNodes,
    isSimulatingWalk,
    walkStepIndex,
    theme,
  ]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${theme.bgApp} select-none`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* Floating GPS Device Location Action Button */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
        <button
          onClick={handlePanToUserLocation}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold shadow-xl backdrop-blur-md border transition cursor-pointer active:scale-95 ${
            isLocating
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
              : deviceAccuracy
              ? 'bg-slate-900/90 text-rose-300 border-rose-500/50 hover:bg-slate-800'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:bg-slate-800'
          }`}
          title="Use Real Device GPS Location"
          aria-label="Use Real Device GPS Location"
        >
          {isLocating ? (
            <Loader2 size={13} className="animate-spin text-white" />
          ) : (
            <Crosshair size={13} className={deviceAccuracy ? 'text-rose-400' : 'text-slate-300'} />
          )}
          <span className="text-[11px]">
            {isLocating
              ? 'Acquiring GPS...'
              : deviceAccuracy
              ? `Live GPS ±${Math.round(deviceAccuracy)}m`
              : 'Use My GPS'}
          </span>
        </button>

        {/* Live coordinate readout if GPS active */}
        {userCurrentLocation && (
          <div className="bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300 border border-slate-800 shadow">
            {userCurrentLocation[0].toFixed(4)}°N, {userCurrentLocation[1].toFixed(4)}°E
          </div>
        )}
      </div>

      {/* Subtle Map Ambient Shadow */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(15,23,42,0.3)] z-10" />
    </div>
  );
};
