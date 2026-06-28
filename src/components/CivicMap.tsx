import React, { useState, useRef, useEffect } from "react";
import { CivicIssue } from "../types";
import { 
  MapPin, 
  Search, 
  Compass, 
  AlertCircle, 
  Info, 
  SlidersHorizontal, 
  CheckCircle2,
  Layers,
  Eye,
  Sparkles,
  Clock,
  User,
  Calendar,
  ChevronDown,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRALIZED_WORKERS } from "../data/workers";

interface CivicMapProps {
  issues: CivicIssue[];
  onSelectIssue?: (issue: CivicIssue) => void;
  selectedIssueId?: string | null;
  interactiveMode?: boolean; // If true, allows user to click and select coordinates
  onCoordinatesSelect?: (coords: { latitude: number; longitude: number; address: string }) => void;
  selectedCoordinates?: { latitude: number; longitude: number } | null;
  simulatedInside?: boolean;
  onSimulatedInsideChange?: (val: boolean) => void;
  height?: string;
  compactMode?: boolean;
}

// Community Polygon for Hayes Valley (enclosing our central issues)
const COMMUNITY_POLYGON: [number, number][] = [
  [37.7815, -122.4315], // Northwest
  [37.7815, -122.4145], // Northeast
  [37.7710, -122.4145], // Southeast
  [37.7710, -122.4315], // Southwest
];

// Human-readable labels for categories
const CATEGORY_LABELS: Record<string, string> = {
  pothole: "Potholes",
  garbage: "Garbage & Litter",
  water_leakage: "Water Leakage",
  broken_streetlight: "Broken Streetlights",
  road_damage: "Road Damage",
  sewage: "Sewage",
  illegal_dumping: "Illegal Dumping",
  others: "Others",
};

// CSS styles to support perfect Leaflet integration and Dark Mode
const LeafletStyles = () => (
  <style>{`
    .leaflet-container {
      background: #f8fafc;
      font-family: inherit;
    }
    .dark .leaflet-container {
      background: #0b0d12;
    }
    .leaflet-popup-content-wrapper {
      background: white !important;
      color: #1e293b !important;
      border-radius: 18px !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
      padding: 0px !important;
      border: 1px solid #f1f5f9;
      overflow: hidden;
    }
    .dark .leaflet-popup-content-wrapper {
      background: #0f131a !important;
      color: #f1f5f9 !important;
      border: 1px solid #1e293b;
    }
    .leaflet-popup-tip {
      background: white !important;
    }
    .dark .leaflet-popup-tip {
      background: #0f131a !important;
    }
    .leaflet-popup-content {
      margin: 0px !important;
      width: 290px !important;
    }
    .leaflet-bar {
      border: none !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
    }
    .leaflet-bar a {
      background-color: white !important;
      color: #334155 !important;
      border-bottom: 1px solid #f1f5f9 !important;
    }
    .dark .leaflet-bar a {
      background-color: #1e293b !important;
      color: #f1f5f9 !important;
      border-bottom: 1px solid #334155 !important;
    }
    @keyframes pulseSlow {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.85; }
    }
    .animate-pulse-slow {
      animation: pulseSlow 3s infinite ease-in-out;
    }
    @keyframes heatPulse {
      0%, 100% { fill-opacity: 0.12; transform: scale(1); }
      50% { fill-opacity: 0.28; transform: scale(1.05); }
    }
    .heatmap-glow-pulse {
      filter: blur(6px);
      animation: heatPulse 4s infinite ease-in-out;
    }
  `}</style>
);

// Helper to check if a coordinate is inside the polygon
function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng))
        && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Helper to clamp coordinates to the community boundary
export function clampCoordinatesToCommunity(lat: number, lng: number): [number, number] {
  const minLat = 37.7710 + 0.0003;
  const maxLat = 37.7815 - 0.0003;
  const minLng = -122.4315 + 0.0003;
  const maxLng = -122.4145 - 0.0003;
  
  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng));
  return [clampedLat, clampedLng];
}

// Helper to classify which zone of the community a coordinate falls in
export function getCommunityZone(lat: number, lng: number): "North Zone" | "South Zone" | "East Zone" | "West Zone" | "Center Zone" {
  const midLat = 37.77625;
  const midLng = -122.4230;
  
  const latDiff = lat - midLat;
  const lngDiff = lng - midLng;
  const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  
  if (dist < 0.0025) {
    return "Center Zone";
  }
  if (Math.abs(latDiff) > Math.abs(lngDiff)) {
    return latDiff > 0 ? "North Zone" : "South Zone";
  } else {
    return lngDiff > 0 ? "East Zone" : "West Zone";
  }
}

// Deterministic address generation for interactive pinpointing
function getSimulatedAddress(lat: number, lng: number) {
  const avenues = ["Park Avenue", "Oak Street", "Valencia Street", "Market Street", "5th Avenue", "12th Street", "Pine Street", "Broadway Ave"];
  const districts = ["Hayes Valley", "Central District", "Lower Haight", "Civic Center", "Mission District"];
  
  const roadIndex = Math.abs(Math.floor(lat * 1000 + lng * 1000)) % avenues.length;
  const streetNum = Math.abs(Math.floor(lat * 5000 - lng * 5000)) % 1200 + 10;
  const districtIndex = Math.abs(Math.floor(lat * 2000)) % districts.length;
  
  return `${streetNum} ${avenues[roadIndex]}, ${districts[districtIndex]}, San Francisco, CA`;
}

// Emojis for categories mapping
const getCategoryIcon = (category: string) => {
  switch (category) {
    case "pothole": return "🕳️";
    case "garbage": return "🗑️";
    case "water_leakage": return "💧";
    case "broken_streetlight": return "💡";
    case "road_damage": return "🚧";
    case "sewage": return "🌀";
    case "illegal_dumping": return "🚯";
    default: return "📍";
  }
};

// Category templates matching IssueDetail.tsx templates for consistency
const getCategoryAiAnalysis = (cat: string) => {
  switch (cat) {
    case "pothole":
    case "road_damage":
      return {
        risk: "Pavement fracturing expands rapidly under high-axle vehicle load, creating safety risks for cyclists and minor chassis impact hazards.",
        safety: "Deploy high-visibility safety markers 15m prior to structural hazard corridor."
      };
    case "water_leakage":
    case "sewage":
      return {
        risk: "Subterranean pressure leaks can cause local soil erosion, sub-grade hollows, and water logging of electrical vaults.",
        safety: "Do not wade through pooled water if underground wiring is active nearby."
      };
    case "broken_streetlight":
      return {
        risk: "Reduced security on transit corridors and elevated slip/trip hazard for neighborhood pedestrians post-twilight.",
        safety: "Utilize adjacent illuminated pathways and report bulb wire sparking."
      };
    case "garbage":
    case "illegal_dumping":
      return {
        risk: "Bio-organic decay attracts rodent vectors and releases trace greenhouse emissions if left piled up.",
        safety: "Avoid touching waste debris without chemical resistant sanitary gloves."
      };
    default:
      return {
        risk: "Incremental civic degradation and public space blocking causing routing inefficiencies.",
        safety: "Exercise standard caution when routing through or nearby the active asset site."
      };
  }
};

// Premium horizontal timeline generator for marker popups
const getTimelineHTML = (issue: CivicIssue) => {
  const isAssigned = !!issue.assignedWorker;
  const isInProgress = issue.status === "in_progress" || issue.status === "resolved_pending" || issue.status === "resolved";
  const isResolved = issue.status === "resolved";

  const s1 = "bg-indigo-600 text-white dark:bg-indigo-500";
  const s2 = isAssigned ? "bg-indigo-600 text-white dark:bg-indigo-500" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500";
  const s3 = isInProgress ? "bg-indigo-600 text-white dark:bg-indigo-500" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500";
  const s4 = isResolved ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500";

  return `
    <div class="mt-2.5 mb-1 px-1 relative">
      <!-- Connecting Line -->
      <div class="absolute top-[8px] left-3 right-3 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10"></div>
      <div class="absolute top-[8px] left-3 h-0.5 bg-indigo-500 -z-10 transition-all duration-300" style="width: ${isResolved ? "100" : isInProgress ? "66" : isAssigned ? "33" : "0"}%"></div>
      
      <div class="flex items-center justify-between">
        <div class="flex flex-col items-center gap-0.5">
          <div class="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${s1}">1</div>
          <span class="text-[6.5px] font-bold text-slate-450 uppercase tracking-tight">Reported</span>
        </div>
        <div class="flex flex-col items-center gap-0.5">
          <div class="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${s2}">2</div>
          <span class="text-[6.5px] font-bold text-slate-450 uppercase tracking-tight">Assigned</span>
        </div>
        <div class="flex flex-col items-center gap-0.5">
          <div class="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${s3}">3</div>
          <span class="text-[6.5px] font-bold text-slate-450 uppercase tracking-tight">Active</span>
        </div>
        <div class="flex flex-col items-center gap-0.5">
          <div class="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${s4}">4</div>
          <span class="text-[6.5px] font-bold text-slate-450 uppercase tracking-tight">Resolved</span>
        </div>
      </div>
    </div>
  `;
};

// Custom Marker divIcon generator with Category, Priority and Status effects
const createCustomIcon = (issue: CivicIssue, isSelected: boolean) => {
  let colorClass = "bg-slate-400 ring-slate-200 dark:ring-slate-800";
  
  if (issue.status === "resolved") {
    // Resolved approved is Emerald/Green
    colorClass = "bg-emerald-500 ring-emerald-150 dark:ring-emerald-950 text-white border border-white";
  } else {
    switch (issue.urgency) {
      case "critical":
        colorClass = "bg-rose-600 ring-rose-200 dark:ring-rose-950 text-white border border-white";
        break;
      case "high":
        colorClass = "bg-amber-500 ring-amber-150 dark:ring-amber-950 text-white border border-white";
        break;
      case "medium":
        colorClass = "bg-yellow-500 ring-yellow-150 dark:ring-yellow-900 text-slate-900 border border-white";
        break;
      case "low":
        colorClass = "bg-green-500 ring-green-150 dark:ring-green-950 text-white border border-white";
        break;
    }
  }

  const categoryIcon = getCategoryIcon(issue.category);
  const pulseClass = issue.status === "in_progress" ? "animate-pulse-slow" : "";
  const hasWorker = !!issue.assignedWorker;
  const isPendingVerification = issue.status === "resolved_pending";

  const workerBadgeHTML = hasWorker 
    ? `<div class="absolute -top-1.5 -right-1.5 bg-slate-950 text-white border border-slate-700/60 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[8px] shadow-md font-bold">👷</div>`
    : "";

  const verificationBadgeHTML = isPendingVerification
    ? `<div class="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white border border-indigo-400/40 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[8px] shadow-md font-bold">⏳</div>`
    : "";

  const selectedClass = isSelected 
    ? "scale-125 border-2 border-white ring-4 z-[9999]" 
    : "hover:scale-115";

  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div class="relative w-8 h-8 flex items-center justify-center cursor-pointer transition-all duration-300 ${pulseClass}">
        <!-- Pulsing radial backdrop -->
        <div class="absolute inset-0 rounded-full bg-inherit opacity-20 blur-xs animate-ping duration-1500"></div>
        
        <!-- Center Icon Pin -->
        <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all ${colorClass} ${selectedClass}">
          <span class="text-xs select-none">${categoryIcon}</span>
        </div>

        ${workerBadgeHTML}
        ${verificationBadgeHTML}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });
};

export default function CivicMap({
  issues,
  onSelectIssue,
  selectedIssueId,
  interactiveMode = false,
  onCoordinatesSelect,
  selectedCoordinates,
  simulatedInside,
  onSimulatedInsideChange,
  height,
  compactMode = false,
}: CivicMapProps) {
  // Advanced Filter state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  
  // New Filter state variables
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");

  // Toggle Overlays and Layers
  const [showMarkers, setShowMarkers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapStyle, setMapStyle] = useState<"community" | "satellite">("community");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Animated tick state for simulated GPS worker motion
  const [animationTime, setAnimationTime] = useState(0);

  const [localSimulatedInside, setLocalSimulatedInside] = useState(false);
  const [routeAlert, setRouteAlert] = useState<string | null>(null);
  const isSimulated = simulatedInside !== undefined ? simulatedInside : localSimulatedInside;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const polygonRef = useRef<L.Polygon | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const interactiveMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // References to keep track of dynamic layers to clear/redraw
  const workerLayersRef = useRef<L.Layer[]>([]);
  const heatmapLayersRef = useRef<L.Layer[]>([]);

  // Periodically increment GPS movement ticks for workers
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTime((prev) => prev + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const toggleLocationSimulation = () => {
    const nextVal = !isSimulated;
    if (onSimulatedInsideChange) {
      onSimulatedInsideChange(nextVal);
    } else {
      setLocalSimulatedInside(nextVal);
    }
  };

  const handleLocateMe = () => {
    if (!mapRef.current) return;
    const targetCoords: [number, number] = isSimulated
      ? [37.7765, -122.4230] // Centroid of Hayes Valley
      : [37.7650, -122.4500]; // Outside Hayes Valley
    
    mapRef.current.setView(targetCoords, 16);
  };

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [37.7765, -122.4230],
      zoom: 15.5,
      minZoom: 14.5,
      maxZoom: 18.5,
      maxBounds: L.latLngBounds([37.7660, -122.4365], [37.7865, -122.4095]),
      maxBoundsViscosity: 0.8,
      zoomControl: true,
      attributionControl: true,
    });

    mapRef.current = map;

    // Use CartoDB Light basemap tiles by default
    const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Draw Hayes Valley Community Boundary Polygon
    const boundary = L.polygon(COMMUNITY_POLYGON, {
      color: "#4f46e5", // indigo-600
      fillColor: "#4f46e5",
      fillOpacity: 0.05,
      dashArray: "6, 8",
      weight: 2
    }).addTo(map);

    polygonRef.current = boundary;

    // Click handler for pinpointing locations (interactive creation form)
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!interactiveMode || !onCoordinatesSelect) return;
      
      let { lat, lng } = e.latlng;
      // Check if coordinates are inside the community polygon. If not, generate new coordinates inside and validate.
      const isInside = isPointInPolygon(lat, lng, COMMUNITY_POLYGON);
      if (!isInside) {
        const [clampedLat, clampedLng] = clampCoordinatesToCommunity(lat, lng);
        lat = clampedLat;
        lng = clampedLng;
      }

      const address = getSimulatedAddress(lat, lng);
      
      onCoordinatesSelect({
        latitude: lat,
        longitude: lng,
        address,
      });
    };

    map.on("click", handleMapClick);

    // Event delegation for clicks on Leaflet popup HTML buttons
    const handlePopupOpen = (e: any) => {
      const popupNode = e.popup.getElement();
      if (!popupNode) return;

      const detailsBtn = popupNode.querySelector(".popup-view-details");
      if (detailsBtn) {
        detailsBtn.addEventListener("click", () => {
          const issueId = detailsBtn.getAttribute("data-issue-id");
          const issue = issues.find(i => i.id === issueId);
          if (issue && onSelectIssue) {
            onSelectIssue(issue);
          }
        });
      }

      const trackBtn = popupNode.querySelector(".popup-track-status");
      if (trackBtn) {
        trackBtn.addEventListener("click", () => {
          const issueId = trackBtn.getAttribute("data-issue-id");
          const issue = issues.find(i => i.id === issueId);
          if (issue && onSelectIssue) {
            onSelectIssue(issue);
          }
        });
      }

      const navigateBtn = popupNode.querySelector(".popup-navigate");
      if (navigateBtn) {
        navigateBtn.addEventListener("click", () => {
          const issueId = navigateBtn.getAttribute("data-issue-id");
          const issue = issues.find(i => i.id === issueId);
          if (issue) {
            const userCoords: [number, number] = isSimulated
              ? [37.7765, -122.4230]
              : [37.7650, -122.4500];
            
            // Draw a glowing simulated route
            const navRoute = L.polyline([userCoords, [issue.location.latitude, issue.location.longitude]], {
              color: "#10b981", // emerald-500
              weight: 3.5,
              opacity: 0.85
            }).addTo(mapRef.current!);
            
            // Pan to wrap route bounds beautifully
            const bounds = L.latLngBounds([userCoords, [issue.location.latitude, issue.location.longitude]]);
            mapRef.current?.fitBounds(bounds, { padding: [45, 45] });

            // Automatically wipe route after 7 seconds
            setTimeout(() => {
              navRoute.remove();
            }, 7000);
            
            setRouteAlert(`GPS Route mapped! Navigating from coordinates [${userCoords.join(", ")}] to ticket #${issue.id} in Hayes Valley.`);
            setTimeout(() => {
              setRouteAlert(null);
            }, 6000);
          }
        });
      }
    };

    map.on("popupopen", handlePopupOpen);

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      map.off("click", handleMapClick);
      map.off("popupopen", handlePopupOpen);
      map.remove();
      mapRef.current = null;
    };
  }, [interactiveMode]);

  // 2. Swapping Tile Layers (Community vs Satellite Views)
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.remove();

    if (mapStyle === "community") {
      tileLayerRef.current = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapRef.current);
    } else {
      tileLayerRef.current = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, [mapStyle]);

  // 3. Manage PIN Selection on Creation form
  useEffect(() => {
    if (!mapRef.current || !interactiveMode) return;

    if (selectedCoordinates) {
      const { latitude, longitude } = selectedCoordinates;
      if (interactiveMarkerRef.current) {
        interactiveMarkerRef.current.setLatLng([latitude, longitude]);
      } else {
        interactiveMarkerRef.current = L.marker([latitude, longitude], {
          icon: L.divIcon({
            className: "custom-interactive-marker",
            html: `
              <div class="relative w-8 h-8 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full animate-ping bg-indigo-500 opacity-55"></div>
                <div class="w-6.5 h-6.5 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-xl">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
                  </svg>
                </div>
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
        }).addTo(mapRef.current);
      }
      mapRef.current.panTo([latitude, longitude]);
    } else {
      if (interactiveMarkerRef.current) {
        interactiveMarkerRef.current.remove();
        interactiveMarkerRef.current = null;
      }
    }
  }, [selectedCoordinates, interactiveMode]);

  // 4. User Simulation Pin Center
  useEffect(() => {
    if (!mapRef.current) return;

    const userCoords: [number, number] = isSimulated
      ? [37.7765, -122.4230] // Centroid Hayes Valley
      : [37.7650, -122.4500]; // Outside

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userCoords);
    } else {
      userMarkerRef.current = L.marker(userCoords, {
        icon: L.divIcon({
          className: "custom-user-location",
          html: `
            <div class="relative w-6 h-6 flex items-center justify-center">
              <div class="absolute inset-0 rounded-full animate-ping bg-blue-500 opacity-50"></div>
              <div class="w-4.5 h-4.5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })
      }).addTo(mapRef.current);
    }
  }, [isSimulated]);

  // 5. Render Synchronized Markers, Heatmaps, and Simulated Worker GPS routes
  useEffect(() => {
    if (!mapRef.current) return;

    // A. Clean up worker layers and heatmap layers first
    workerLayersRef.current.forEach(layer => layer.remove());
    workerLayersRef.current = [];

    heatmapLayersRef.current.forEach(layer => layer.remove());
    heatmapLayersRef.current = [];

    // B. Setup Issue Markers Layer Group
    if (!markersGroupRef.current) {
      markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      markersGroupRef.current.clearLayers();
    }

    const group = markersGroupRef.current;

    // C. Perform multi-layer comprehensive filtering
    const filtered = issues.filter((issue) => {
      const matchesSearch =
        !searchQuery ||
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
      const matchesSeverity = severityFilter === "all" || issue.urgency === severityFilter;

      // New analytical filters
      const matchesDept = departmentFilter === "all" || (issue.department && issue.department.toLowerCase().includes(departmentFilter.toLowerCase()));
      const matchesWorker = workerFilter === "all" || (
        workerFilter === "unassigned" ? !issue.assignedWorker : (issue.assignedWorker && issue.assignedWorker.toLowerCase().includes(workerFilter.toLowerCase()))
      );

      // Date filtering
      let matchesDate = true;
      if (dateFilter !== "all") {
        const issueTime = new Date(issue.createdAt).getTime();
        const now = Date.now();
        if (dateFilter === "today") {
          matchesDate = now - issueTime < 24 * 60 * 60 * 1000;
        } else if (dateFilter === "7days") {
          matchesDate = now - issueTime < 7 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "30days") {
          matchesDate = now - issueTime < 30 * 24 * 60 * 60 * 1000;
        }
      }

      // Zone filtering
      let matchesZone = true;
      if (zoneFilter !== "all") {
        const isInside = isPointInPolygon(issue.location.latitude, issue.location.longitude, COMMUNITY_POLYGON);
        matchesZone = zoneFilter === "inside" ? isInside : !isInside;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesSeverity && matchesDept && matchesWorker && matchesDate && matchesZone;
    });

    // D. Plot Heatmap Overlay if requested
    if (showHeatmap) {
      filtered.forEach((issue) => {
        let heatColor = "#ef4444"; // red
        if (issue.urgency === "critical") heatColor = "#f43f5e";
        else if (issue.urgency === "high") heatColor = "#f97316";
        else if (issue.urgency === "medium") heatColor = "#eab308";
        else heatColor = "#10b981";

        const [issueLat, issueLng] = clampCoordinatesToCommunity(issue.location.latitude, issue.location.longitude);

        const heatCircle = L.circle([issueLat, issueLng], {
          radius: 95,
          color: heatColor,
          fillColor: heatColor,
          fillOpacity: 0.18,
          weight: 0,
          className: "heatmap-glow-pulse"
        }).addTo(mapRef.current!);

        heatmapLayersRef.current.push(heatCircle);
      });
    }

    // E0. Plot Department Offices inside the community
    const offices = [
      { name: "Public Works Office", coords: [37.7780, -122.4280] as [number, number], emoji: "🏢" },
      { name: "Water Authority Office", coords: [37.7730, -122.4260] as [number, number], emoji: "💧" },
      { name: "Street Lighting Depot", coords: [37.7790, -122.4180] as [number, number], emoji: "⚡" },
      { name: "Sanitation Depot", coords: [37.7740, -122.4160] as [number, number], emoji: "🧹" }
    ];

    offices.forEach((office) => {
      const officeMarker = L.marker(office.coords, {
        icon: L.divIcon({
          className: "custom-office-marker",
          html: `
            <div class="relative flex flex-col items-center">
              <div class="bg-indigo-950/90 border border-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded-md text-[6.5px] font-black uppercase tracking-wider whitespace-nowrap shadow-md mb-0.5 transform -translate-y-1">
                ${office.name}
              </div>
              <div class="w-5.5 h-5.5 bg-slate-900 border border-indigo-500/30 rounded-lg flex items-center justify-center shadow-lg">
                <span class="text-[10px]">${office.emoji}</span>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
      }).addTo(mapRef.current!);
      workerLayersRef.current.push(officeMarker);
    });

    // E. Plot Simulated Active Worker positions with animated pathways
    filtered.forEach((issue) => {
      const isCurrentlyActive = issue.assignedWorker && (issue.status === "scheduled" || issue.status === "in_progress");
      
      if (isCurrentlyActive) {
        const getDepartmentOffice = (deptName?: string): [number, number] => {
          const name = (deptName || "").toLowerCase();
          if (name.includes("public works") || name.includes("street services") || name.includes("road")) {
            return [37.7780, -122.4280]; // Northwest
          }
          if (name.includes("water") || name.includes("drainage") || name.includes("sewage")) {
            return [37.7730, -122.4260]; // Southwest
          }
          if (name.includes("light") || name.includes("electric") || name.includes("power")) {
            return [37.7790, -122.4180]; // Northeast
          }
          if (name.includes("sanitation") || name.includes("environmental") || name.includes("garbage") || name.includes("dumping")) {
            return [37.7740, -122.4160]; // Southeast
          }
          return [37.7765, -122.4230]; // Center
        };

        const [startLat, startLng] = getDepartmentOffice(issue.department);
        const [targetLat, targetLng] = clampCoordinatesToCommunity(issue.location.latitude, issue.location.longitude);

        let workerLat = targetLat;
        let workerLng = targetLng;
        let routePoints: [number, number][] = [[startLat, startLng], [targetLat, startLng], [targetLat, targetLng]];

        if (issue.status === "scheduled") {
          // Worker is travelling to the issue. Animate position.
          const cycleSteps = 22;
          const step = animationTime % (cycleSteps + 1);
          const progress = step / cycleSteps; // 0.0 to 1.0

          // Grid roads routing path (start -> turn -> target)
          // turn point is at targetLat, startLng
          routePoints = [[startLat, startLng], [targetLat, startLng], [targetLat, targetLng]];

          if (progress <= 0.5) {
            const segProgress = progress * 2;
            workerLat = startLat + (targetLat - startLat) * segProgress;
            workerLng = startLng;
          } else {
            const segProgress = (progress - 0.5) * 2;
            workerLat = targetLat;
            workerLng = startLng + (targetLng - startLng) * segProgress;
          }
        } else {
          // Status is in_progress: worker has arrived at the issue location
          routePoints = [[startLat, startLng], [targetLat, startLng], [targetLat, targetLng]];
          workerLat = targetLat;
          workerLng = targetLng;
        }

        // Render simulated worker on map
        const workerMarker = L.marker([workerLat, workerLng], {
          icon: L.divIcon({
            className: "custom-worker-marker",
            html: `
              <div class="relative flex flex-col items-center">
                <div class="bg-slate-900/90 border border-slate-700/60 text-white px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest whitespace-nowrap shadow-md mb-0.5 transform -translate-y-1">
                  👷 ${issue.assignedWorker.split(" ")[0]}
                </div>
                <div class="w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce duration-1000">
                  <span class="text-xs">👷</span>
                </div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 30],
          })
        }).addTo(mapRef.current!);

        workerMarker.bindPopup(`
          <div class="p-3 min-w-[210px] font-sans bg-white dark:bg-slate-950 rounded-xl">
            <div class="flex items-center gap-1.5 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span class="text-xs">👷</span>
              <span class="text-[9px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-250">Crew GPS Tracker</span>
            </div>
            <p class="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
              <strong>Crew Member:</strong> ${issue.assignedWorker}<br/>
              <strong>Remediation Target:</strong> ${issue.title}<br/>
              <strong>Status:</strong> ${issue.status === "in_progress" ? "Active Repair on Site" : "In Transit (GPS Verified)"}<br/>
              <span class="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1.5 py-0.5 rounded uppercase font-bold mt-1.5 inline-block">Simulated GPS Live feed</span>
            </p>
          </div>
        `, { className: "custom-leaflet-popup" });

        // Draw dotted route polyline
        const routePath = L.polyline(routePoints, {
          color: "#f59e0b", // amber-500
          weight: 2,
          dashArray: "4, 6",
          opacity: 0.75
        }).addTo(mapRef.current!);

        workerLayersRef.current.push(workerMarker, routePath);
      }
    });

    // F. Plot standard pins if requested
    if (showMarkers) {
      filtered.forEach((issue) => {
        const isSelected = selectedIssueId === issue.id;
        const [issueLat, issueLng] = clampCoordinatesToCommunity(issue.location.latitude, issue.location.longitude);
        const marker = L.marker([issueLat, issueLng], {
          icon: createCustomIcon(issue, isSelected),
        });

        const parsedLoc = getSimulatedAddress(issue.location.latitude, issue.location.longitude);
        const analysis = getCategoryAiAnalysis(issue.category);

        let urgencyBadgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
        if (issue.urgency === "critical") urgencyBadgeClass = "bg-rose-500/10 text-rose-500 border border-rose-500/20";
        else if (issue.urgency === "high") urgencyBadgeClass = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
        else if (issue.urgency === "medium") urgencyBadgeClass = "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
        else if (issue.urgency === "low") urgencyBadgeClass = "bg-green-500/10 text-green-500 border border-green-500/20";

        let statusBadgeClass = "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
        if (issue.status === "resolved") statusBadgeClass = "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
        else if (issue.status === "in_progress") statusBadgeClass = "bg-blue-500/10 text-blue-500 border border-blue-500/20";
        else if (issue.status === "resolved_pending") statusBadgeClass = "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";

        // Structured premium MD3 Info Card layout
        const popupContent = `
          <div class="p-4 min-w-[280px] font-sans bg-white dark:bg-slate-950">
            <!-- Header section -->
            <div class="relative overflow-hidden border-b border-slate-100 dark:border-slate-800/80 pb-2 mb-3">
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                  ${issue.id}
                </span>
                <span class="text-[8px] ${urgencyBadgeClass} font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                  ${issue.urgency.toUpperCase()}
                </span>
              </div>
              <h3 class="text-xs font-bold leading-snug text-slate-900 dark:text-white line-clamp-2">
                ${issue.title}
              </h3>
              <p class="text-[9px] text-slate-400 font-semibold mt-1 flex items-center gap-1">
                📍 <span>${issue.location.address ? issue.location.address.split(",")[0] : parsedLoc.split(",")[0]}</span>
              </p>
            </div>

            <!-- Media Section -->
            <div class="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 mb-3 flex items-center justify-center">
              ${issue.image 
                ? `<img src="${issue.image}" class="w-full h-full object-cover" referrerPolicy="no-referrer" />` 
                : `<div class="text-center p-3 flex flex-col items-center gap-1.5">
                     <span class="text-2xl">${getCategoryIcon(issue.category)}</span>
                     <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">${CATEGORY_LABELS[issue.category] || "Civic Incident"}</span>
                   </div>`
              }
            </div>

            <!-- Meta Grid -->
            <div class="grid grid-cols-2 gap-2 text-[9px] bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 p-2 rounded-lg mb-3 font-semibold text-slate-550">
              <div>
                <span class="block text-[7.5px] uppercase tracking-wider text-slate-400 font-black">DEPARTMENT</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold">${issue.department || "Public Works"}</span>
              </div>
              <div>
                <span class="block text-[7.5px] uppercase tracking-wider text-slate-400 font-black">ASSIGNED CREW</span>
                <span class="text-slate-700 dark:text-slate-300 font-bold">👷 ${issue.assignedWorker || "Unassigned"}</span>
              </div>
              <div>
                <span class="block text-[7.5px] uppercase tracking-wider text-slate-400 font-black">EST. RESOLUTION</span>
                <span class="text-slate-700 dark:text-slate-300 font-mono">${issue.estimatedResolutionTime || "48 Hours"}</span>
              </div>
              <div>
                <span class="block text-[7.5px] uppercase tracking-wider text-slate-400 font-black">INCIDENT AGE</span>
                <span class="text-slate-700 dark:text-slate-300 font-mono">${Math.max(1, Math.round((Date.now() - new Date(issue.createdAt).getTime()) / (24 * 60 * 60 * 1000)))} Days Ago</span>
              </div>
            </div>

            <!-- Gemini Cog Diagnostic section -->
            <div class="p-2.5 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg mb-3">
              <div class="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-1.5">
                <span class="text-xs">🧠</span>
                <span class="text-[8.5px] font-black uppercase tracking-wider">Gemini Cognitive Diagnosis</span>
              </div>
              <p class="text-[9px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                <strong class="text-slate-900 dark:text-slate-200 text-[7.5px] uppercase tracking-wide block mb-0.5">⚠️ HAZARD RISK</strong>
                ${analysis.risk}
              </p>
              <p class="text-[9px] text-slate-600 dark:text-slate-300 leading-relaxed font-semibold mt-2">
                <strong class="text-slate-900 dark:text-slate-200 text-[7.5px] uppercase tracking-wide block mb-0.5">🛡️ SAFETY DISPATCH</strong>
                ${analysis.safety}
              </p>
            </div>

            <!-- Horizontal Timeline preview -->
            ${getTimelineHTML(issue)}

            <!-- Interactive Buttons -->
            <div class="flex items-center gap-1.5 mt-3 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
              <button class="popup-view-details flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white text-[8px] font-bold rounded-md transition-all text-center uppercase tracking-wider cursor-pointer" data-issue-id="${issue.id}">
                Details
              </button>
              <button class="popup-navigate flex-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[8px] font-bold rounded-md transition-all text-center uppercase tracking-wider cursor-pointer" data-issue-id="${issue.id}">
                Navigate
              </button>
              <button class="popup-track-status flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[8px] font-bold rounded-md transition-all text-center uppercase tracking-wider cursor-pointer" data-issue-id="${issue.id}">
                Track
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: "custom-leaflet-popup",
          maxWidth: 320,
        });

        marker.addTo(group);

        if (isSelected) {
          marker.openPopup();
          mapRef.current?.setView([issue.location.latitude, issue.location.longitude], 16);
        }
      });
    }
  }, [
    issues, 
    searchQuery, 
    categoryFilter, 
    statusFilter, 
    severityFilter, 
    selectedIssueId, 
    departmentFilter, 
    workerFilter, 
    dateFilter, 
    zoneFilter,
    showMarkers,
    showHeatmap,
    animationTime
  ]);

  return (
    <div className="flex flex-col h-full w-full relative">
      <LeafletStyles />

      {/* RENDER DYNAMIC COMMUNITY BOUNDARY FILTERS & PANELS */}
      {!interactiveMode && !compactMode && (
        <div className="space-y-4 mb-4">
          {/* Active Workorders Map Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <span>🗺️</span> Hayes Valley Civic Command Center
              </h2>
              <p className="text-slate-400 text-xs font-semibold">
                Unified live spatial console monitoring reported hazards, active municipal crews, and AI risk diagnostics.
              </p>
            </div>
          </div>

          {/* Location Boundary Simulation Warning Alert Box */}
          <div className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs select-none transition-all duration-300 ${
            isSimulated 
              ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-450"
          }`}>
            <div className="flex items-start sm:items-center gap-2.5">
              <span className="text-xl shrink-0">{isSimulated ? "✅" : "⚠️"}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {isSimulated ? "Location Simulation Enabled" : "Outside Community Perimeter"}
                </p>
                <p className="text-[10px] font-semibold opacity-95 mt-0.5 leading-snug">
                  {isSimulated 
                    ? "Coordinates simulated inside the Hayes Valley boundary. You have submission privileges."
                    : "You are outside the municipal boundary. Submissions are restricted to registered polygon zone coordinates."}
                </p>
              </div>
            </div>
            <button
              onClick={toggleLocationSimulation}
              className={`py-2 px-4 font-extrabold text-[10px] rounded-lg tracking-wider uppercase transition-all shadow-xs cursor-pointer shrink-0 ${
                isSimulated
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}
            >
              {isSimulated ? "Reset Location" : "Simulate Inside Location"}
            </button>
          </div>

          {/* Filter Bar Panel */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1 flex bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/30">
                <div className="pl-3.5 flex items-center justify-center text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by keyword, address, or ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-xs focus:outline-none text-slate-800 dark:text-slate-100 font-semibold"
                />
                <button
                  onClick={() => {}}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Advanced Filter Collapse Toggle */}
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border shrink-0 cursor-pointer ${
                    isFilterExpanded 
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 border-indigo-200 dark:border-indigo-850" 
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Advanced filters</span>
                </button>

                {/* Locate Me */}
                <button
                  onClick={handleLocateMe}
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-850 dark:hover:bg-slate-755 text-slate-100 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer border border-transparent"
                >
                  <Compass className="w-4 h-4 animate-spin-slow" />
                  Locate Me
                </button>
              </div>
            </div>

            {/* Expandable Advanced Filter Panel */}
            <AnimatePresence>
              {isFilterExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden pt-2 border-t border-slate-200 dark:border-slate-800/60"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                    {/* Category */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Category</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                      >
                        <option value="all">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                      >
                        <option value="all">All Statuses</option>
                        <option value="reported">Reported</option>
                        <option value="investigating">Investigating</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved_pending">Resolved (Pending)</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    {/* Priority/Severity */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Priority</label>
                      <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                      >
                        <option value="all">All Severities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Department</label>
                      <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                      >
                        <option value="all">All Departments</option>
                        <option value="public works">Public Works</option>
                        <option value="water supply">Water Authority</option>
                        <option value="sanitation">Sanitation</option>
                        <option value="electricity">Electricity Board</option>
                      </select>
                    </div>

                    {/* Assigned Worker */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Assigned Worker</label>
                      <select
                        value={workerFilter}
                        onChange={(e) => setWorkerFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                      >
                        <option value="all">All Crews</option>
                        {CENTRALIZED_WORKERS.map(w => (
                          <option key={w.id} value={w.name.split(' ')[0].toLowerCase()}>{w.name}</option>
                        ))}
                        <option value="unassigned">Unassigned</option>
                      </select>
                    </div>

                    {/* Incident Date */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Date Lodged</label>
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                      </select>
                    </div>

                    {/* Community Boundary Zones */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Community Zone</label>
                      <select
                        value={zoneFilter}
                        onChange={(e) => setZoneFilter(e.target.value)}
                        className="w-full bg-white dark:bg-[#11141b] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer font-bold"
                      >
                        <option value="all">All Areas</option>
                        <option value="inside">Inside Hayes Valley</option>
                        <option value="outside">Outside Boundary</option>
                      </select>
                    </div>

                    {/* Layer Overlay Config */}
                    <div>
                      <label className="block text-[9px] font-black uppercase text-slate-400 mb-1">Overlay Modes</label>
                      <div className="flex gap-2 h-9 items-center">
                        <button
                          onClick={() => setShowMarkers(!showMarkers)}
                          className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                            showMarkers 
                              ? "bg-slate-900 border-transparent text-white dark:bg-white dark:text-slate-900" 
                              : "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          Markers
                        </button>
                        <button
                          onClick={() => setShowHeatmap(!showHeatmap)}
                          className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                            showHeatmap 
                              ? "bg-indigo-600 border-transparent text-white animate-pulse" 
                              : "bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700"
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          Heatmap
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tile Layer Selector */}
                  <div className="pt-2 flex items-center justify-between text-xs text-slate-450 border-t border-slate-200 dark:border-slate-800/40">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Map Layout Skin:</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setMapStyle("community")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                          mapStyle === "community" 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/50" 
                            : "bg-white border-slate-200 text-slate-550 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        Community View
                      </button>
                      <button
                        onClick={() => setMapStyle("satellite")}
                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                          mapStyle === "satellite" 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-950/30 dark:border-indigo-900/50" 
                            : "bg-white border-slate-200 text-slate-550 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        Satellite Imagery
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Map Element Canvas Container */}
      <div 
        className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative group bg-slate-100"
        style={{ height: height || (compactMode ? "100%" : "540px") }}
      >
        <div ref={mapContainerRef} className="h-full w-full z-10" />

        <AnimatePresence>
          {routeAlert && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 z-[9999] p-3.5 bg-slate-950/95 backdrop-blur-md border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold shadow-xl flex items-center gap-2.5"
            >
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
              <span>{routeAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Controls for Compact/Sidebar modes */}
        {compactMode && !interactiveMode && (
          <div className="absolute top-3 right-3 z-[999] flex flex-col gap-1.5">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              title="Toggle Heatmap"
              className={`p-2 rounded-xl border shadow-md transition-all cursor-pointer ${
                showHeatmap 
                  ? "bg-indigo-600 border-indigo-500 text-white animate-pulse" 
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:bg-slate-50"
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapStyle(prev => prev === "community" ? "satellite" : "community")}
              title="Switch Layout"
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-350 hover:bg-slate-50 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Floating pinpoint instructional bubble for creation form */}
        {interactiveMode && (
          <div className="absolute bottom-4 left-4 right-4 z-[999] bg-indigo-650/90 backdrop-blur-md text-white px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg animate-pulse border border-indigo-500/30">
            <Info className="w-4.5 h-4.5 shrink-0 text-indigo-300" />
            <span>
              {selectedCoordinates
                ? "Coordinates locked! Click another point to adjust location pin, or scroll down to finish."
                : "Incident Geolocator Mode: Tap/Click anywhere on the map grid to pinpoint coordinates."}
            </span>
          </div>
        )}
      </div>

      {/* Map Legend Footer Ribbon */}
      {!interactiveMode && !compactMode && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-[9px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white"></span>
              <span className="font-bold">🔴 Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white"></span>
              <span className="font-bold">🟠 High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-white"></span>
              <span className="font-bold">🟡 Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-white"></span>
              <span className="font-bold">🟢 Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
              <span className="font-bold">🔵 Resolved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-400">👷 Assigned Worker Active</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-bold">Geospatial telemetry in sync</span>
          </div>
        </div>
      )}
    </div>
  );
}
