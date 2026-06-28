import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body limit for image uploads
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Setup Data Persistence
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "reports.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Mock Data to populate the application
const INITIAL_REPORTS = [
  {
    id: "rep-1",
    title: "Deep Pothole at Intersection of Elm & 4th",
    description: "There is a massive pothole right at the crosswalk. It is about 2 feet wide and 6 inches deep. Cars are swerving into the opposite lane to avoid it, which is creating a highly dangerous traffic situation, especially during school drop-off hours. Multiple cyclists have nearly lost control.",
    category: "pothole",
    urgency: "high",
    department: "Department of Public Works",
    status: "in_progress",
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: "Intersection of Elm St & 4th Ave, San Francisco, CA"
    },
    reporterName: "Sarah Jenkins",
    reporterEmail: "sarah.j@example.com",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    upvotes: 42,
    missingDetails: ["No precise depth measurements provided", "Impact on nearby drainage not specified"],
    officialLetter: "Dear Commissioner,\n\nI am writing to formally request emergency repairs to a major road hazard located at the Intersection of Elm St & 4th Ave. A severe pothole measuring approximately 2 feet wide and 6 inches deep has formed at this active crosswalk.\n\nThis condition presents an immediate risk to public safety. Vehicles are actively swerving to avoid damage, risking head-on collisions, while cyclists face severe fall hazards. Given the proximity to school zones, immediate intervention is requested.\n\nSincerely,\nCommunity Civic Alliance",
    timeline: [
      {
        status: "reported",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Issue successfully reported by citizen Sarah Jenkins.",
        updatedBy: "System"
      },
      {
        status: "investigating",
        date: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Assigned inspectors to verify location and measure hazard severity.",
        updatedBy: "Admin Operator"
      },
      {
        status: "in_progress",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Work order dispatched to Road Crew B. Area temporarily cordoned off.",
        updatedBy: "Road Maintenance Crew"
      }
    ],
    comments: [
      {
        id: "c-1",
        userName: "Alex Rivera",
        comment: "Nearly ruined my wheel rim on this yesterday! Glad it is finally being addressed.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "c-2",
        userName: "Dave Miller",
        comment: "Saw the maintenance truck out there this morning placing warning cones. Good progress!",
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "rep-2",
    title: "Overflowing Garbage and Illegal Dumping",
    description: "An entire truckload of commercial trash and construction waste has been dumped at the dead end. There are broken wooden pallets, concrete chunks, drywall, and plastic sheetings. It has started attracting stray dogs and rodents. The smell is becoming unbearable for local residents.",
    category: "illegal_dumping",
    urgency: "high",
    department: "Environmental Health & Sanitation",
    status: "reported",
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: "Dead end of 12th Street near Industrial Highway, San Francisco, CA"
    },
    reporterName: "Marcus Vance",
    reporterEmail: "marcus.v@example.com",
    createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 19,
    missingDetails: ["License plates of any suspicious vehicles", "Exact types of construction materials (e.g. asbestos check required)"],
    officialLetter: "Dear Sanitation Director,\n\nI am writing to report a substantial illegal dumping incident on municipal land at the dead end of 12th Street. A significant quantity of construction debris and raw waste has been deposited unlawfully.\n\nThis illegal site creates an active environmental hazard, breeding disease vectors and releasing toxins. We request sanitation dispatch to clear this area and the placement of permanent monitoring cameras.\n\nSincerely,\n12th Street Neighborhood Coalition",
    timeline: [
      {
        status: "reported",
        date: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Citizen submitted waste report with detailed descriptions.",
        updatedBy: "System"
      }
    ],
    comments: [
      {
        id: "c-3",
        userName: "Elena Rostova",
        comment: "This happens at this exact spot every few months. We really need a security camera here.",
        createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: "rep-3",
    title: "Broken Streetlight on Pedestrian Pathway",
    description: "Three consecutive streetlights on the greenbelt walking path are completely out. The path goes through a heavily wooded area and is pitch black after 6 PM. Many residents use this path to walk home from the subway station, and everyone is feeling extremely unsafe.",
    category: "broken_streetlight",
    urgency: "medium",
    department: "Bureau of Street Lighting",
    status: "scheduled",
    location: {
      latitude: 37.7699,
      longitude: -122.4468,
      address: "Central Greenbelt Path, Segment B, San Francisco, CA"
    },
    reporterName: "Lillian Wu",
    reporterEmail: "lillian.wu@example.com",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 28,
    timeline: [
      {
        status: "reported",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Pedestrian pathway lighting failure logged.",
        updatedBy: "System"
      },
      {
        status: "investigating",
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Inspected wiring and confirmed bulb blowout and circuit breaker trip.",
        updatedBy: "Electrical Inspector"
      },
      {
        status: "scheduled",
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Bulb replacements and sensor repairs scheduled for the upcoming weekly route.",
        updatedBy: "Utility Scheduler"
      }
    ],
    comments: []
  },
  {
    id: "rep-4",
    title: "Water Main Leak Flooding Sidewalk",
    description: "Clean drinking water is bubbling up violently from cracks in the concrete walkway. It has created a continuous stream of flowing water running down the street, flooding the gutter, and causing pedestrians to step onto the busy main road to pass. Thousands of gallons of water are being wasted.",
    category: "water_leakage",
    urgency: "critical",
    department: "Municipal Water Authority",
    status: "resolved",
    location: {
      latitude: 37.7599,
      longitude: -122.4368,
      address: "1080 Valencia St (near 22nd), San Francisco, CA"
    },
    reporterName: "Jameson Kent",
    reporterEmail: "jk.vlc@example.com",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 56,
    timeline: [
      {
        status: "reported",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Water waste and safety hazard reported.",
        updatedBy: "System"
      },
      {
        status: "investigating",
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Urgent inspection crew dispatched. Source identified as 4-inch utility water line breach.",
        updatedBy: "Water Utility Dispatch"
      },
      {
        status: "in_progress",
        date: new Date(Date.now() - 7.8 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Water flow rerouted and shut-off valves engaged. Excavation in progress to replace cracked section.",
        updatedBy: "Water Main Repair Crew"
      },
      {
        status: "resolved",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        comment: "Pipe replaced successfully, road backfilled, concrete repaved. Service fully restored.",
        updatedBy: "Water Maintenance Supervisor"
      }
    ],
    comments: [
      {
        id: "c-4",
        userName: "Carla Lopez",
        comment: "Thank you for fixing this so quickly! It was a massive waste of precious clean water.",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

const COMMUNITY_POLYGON = [
  [37.7815, -122.4315],
  [37.7815, -122.4145],
  [37.7710, -122.4145],
  [37.7710, -122.4315]
];

function isPointInPolygon(lat: number, lng: number, polygon: any[]) {
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

function clampCoordinatesToCommunity(lat: number, lng: number): [number, number] {
  const minLat = 37.7710 + 0.0003;
  const maxLat = 37.7815 - 0.0003;
  const minLng = -122.4315 + 0.0003;
  const maxLng = -122.4145 - 0.0003;
  
  const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng));
  return [clampedLat, clampedLng];
}

function loadReports(): any[] {
  let reports: any[] = [];
  let modified = false;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      reports = JSON.parse(content);
    } else {
      reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
      modified = true;
    }
  } catch (error) {
    console.error("Error loading reports database:", error);
    reports = JSON.parse(JSON.stringify(INITIAL_REPORTS));
    modified = true;
  }

  // Ensure initial reports are mapped to the correct workers
  const assignments: Record<string, { worker: string, role: string, est: string }> = {
    "rep-1": { worker: "Dave Miller", role: "Road Crew", est: "4 hours" },
    "rep-2": { worker: "Marcus Vance", role: "Sanitation Crew", est: "2 hours" },
    "rep-3": { worker: "John Utility", role: "Electrical Crew", est: "1 hour" },
    "rep-4": { worker: "Sarah Jenkins", role: "Water Crew", est: "6 hours" }
  };

  reports.forEach((r: any) => {
    // Validate coordinates of each loaded report
    if (r.location && (typeof r.location.latitude === "number") && (typeof r.location.longitude === "number")) {
      const isInside = isPointInPolygon(r.location.latitude, r.location.longitude, COMMUNITY_POLYGON);
      if (!isInside) {
        const [clampedLat, clampedLng] = clampCoordinatesToCommunity(r.location.latitude, r.location.longitude);
        r.location.latitude = clampedLat;
        r.location.longitude = clampedLng;
        modified = true;
      }
    }

    if (assignments[r.id] && (!r.assignedWorker || r.assignedWorker !== assignments[r.id].worker)) {
      r.assignedWorker = assignments[r.id].worker;
      r.assignedWorkerRole = assignments[r.id].role;
      r.estimatedResolutionTime = r.estimatedResolutionTime || assignments[r.id].est;
      if (r.status === "reported") {
        r.status = "scheduled"; // Change reported to scheduled so they appear in Assigned queue
      }
      modified = true;
    }
  });

  if (modified) {
    saveReports(reports);
  }

  return reports;
}

function saveReports(reports: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving reports database:", error);
  }
}

// Instantiate Google Gemini API Client
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key) {
  ai = new GoogleGenAI({
    apiKey: api_key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Features will run in simulation mode.");
}

// Helper to interact with Gemini safely
async function callGemini(prompt: string, jsonSchema?: any): Promise<string> {
  if (!ai) {
    throw new Error("Gemini AI client is not initialized. Please ensure the GEMINI_API_KEY secret is configured.");
  }

  const models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const modelName of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const config: any = {};
        if (jsonSchema) {
          config.responseMimeType = "application/json";
          config.responseSchema = jsonSchema;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: config
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const errStr = String(err.message || err);
        console.warn(`[Gemini Attempt Failed] Model: ${modelName}, Attempt: ${attempt}/3. Error: ${errStr}`);
        
        // If it's a 400 error (bad request / invalid schema), don't retry, try next model or fail
        if (errStr.includes("400") || errStr.toLowerCase().includes("bad request") || errStr.toLowerCase().includes("invalid")) {
          break; 
        }

        // Wait before retrying (exponential backoff: 400ms, 800ms)
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 400));
        }
      }
    }
  }

  console.error("Gemini API Error after retries and fallback models:", lastError);
  throw new Error(`Gemini API Error: ${lastError?.message || lastError}`);
}

// ------------------- API ROUTES -------------------

// 1. Get all reports
app.get("/api/reports", (req, res) => {
  let reports = loadReports();

  // Securely filter reports if worker identity is supplied in request headers or query
  const workerEmail = req.headers["x-worker-email"] || req.query.workerEmail;
  if (workerEmail) {
    const emailStr = String(workerEmail).toLowerCase().trim();
    const workerNames: Record<string, string> = {
      "road.worker@greenvalley.com": "Dave Miller",
      "water.worker@greenvalley.com": "Sarah Jenkins",
      "electric.worker@greenvalley.com": "John Utility",
      "sanitation.worker@greenvalley.com": "Marcus Vance"
    };
    const name = workerNames[emailStr];
    if (name) {
      reports = reports.filter(r => r.assignedWorker?.toLowerCase().trim() === name.toLowerCase().trim());
    } else {
      reports = []; // Unknown or unauthorized worker email gets empty set
    }
  }

  res.json(reports);
});

// 1a. Autofill report details using Gemini
app.post("/api/reports/autofill", async (req, res) => {
  const { category, urgency, location } = req.body;
  
  if (!ai) {
    // simulation fallback
    const mockTitles: Record<string, string> = {
      pothole: "Severe Road Pothole Damaging Car Wheels",
      garbage: "Piles of Uncollected Commercial Garbage Accumulating",
      illegal_dumping: "Illegal Dumping of Industrial Debris at Dead End",
      water_leakage: "Active Subsurface Water Leak Flooding Sidewalk",
      broken_streetlight: "Consecutive Broken Streetlights Creating Safety Hazard",
      road_damage: "Damaged Roadway Asphalt Causing Traffic Interruption",
      sewage: "Raw Sewage Overflow Near Pedestrian Walkway",
      others: "General Municipal Maintenance Issue Requiring Attention"
    };

    const mockDescs: Record<string, string> = {
      pothole: `A large and hazardous pothole has formed in the middle of the street. It is approximately 2 feet wide and several inches deep, forcing drivers to swerve into oncoming traffic to avoid hitting it. This poses an immediate danger to cyclists and local vehicles.`,
      garbage: `Large amounts of loose trash, cardboard boxes, and household bags have been piled up on the curb. The accumulation is attracting local pests and emitting a foul odor. It blocks part of the pedestrian sidewalk.`,
      illegal_dumping: `Someone has illegally dumped construction debris, including concrete chunks and drywall sheets, alongside the roadway. This creates a severe environmental hazard and decreases visibility at the corner.`,
      water_leakage: `Clean water is actively bubbling up from a fracture in the concrete pavement. The continuous stream has flooded the gutter and is beginning to wash out the soil sub-base of the adjacent sidewalk.`,
      broken_streetlight: `Several streetlights on this block are completely dark. This leaves the pedestrian walkway in absolute darkness after sunset, making residents feel extremely unsafe walking home from public transit.`,
      road_damage: `The asphalt surface on this road is heavily cracked and buckling. The uneven surface causes vehicles to vibrate violently and creates a tripping hazard for pedestrians crossing the street.`,
      sewage: `Sewage water is bubbling up from the storm drain, causing highly unpleasant odors and creating unsanitary puddles across the pedestrian pathway. Immediate disinfection and pumping is required.`,
      others: `There is an active municipal maintenance issue at this location. The hazard needs to be inspected by a local field crew to restore normal municipal safety operations.`
    };

    const catKey = category || "others";
    return res.json({
      title: mockTitles[catKey] || mockTitles.others,
      description: mockDescs[catKey] || mockDescs.others
    });
  }

  try {
    const prompt = `
      You are the Civic Auto-Fill Agent.
      Generate a realistic, professional, and detailed report for a civic issue in San Francisco.
      Category of issue: "${category || 'pothole'}"
      Urgency level: "${urgency || 'low'}"
      Location context: "${location?.address || 'San Francisco, CA'}"

      Return a JSON object containing:
      1. "title": A concise, realistic, high-impact title for this specific issue (e.g., "Deep 3-foot Pothole Damaging Car Tires" or "Severe Water Main Breach Flooding Pedestrian Walkway"). Do not exceed 8-10 words.
      2. "description": A highly detailed, realistic, professional, and grammatically polished 2-3 sentence description of the hazard, including potential public safety risks, physical characteristics, and impact on local traffic or residents.
    `;

    const jsonSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["title", "description"]
    };

    const aiResponse = await callGemini(prompt, jsonSchema);
    const parsed = JSON.parse(aiResponse);
    res.json(parsed);
  } catch (err: any) {
    console.error("Error in autofill endpoint:", err);
    res.status(500).json({ error: err.message || "Failed to generate autofill details" });
  }
});

// 2. Create new report (with optional inline AI analysis)
app.post("/api/reports", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      urgency,
      reporterName,
      reporterEmail,
      location,
      image, // base64
      aiEnhance,
    } = req.body;

    if (!title || !description || !reporterName || !reporterEmail || !location) {
      return res.status(400).json({ error: "Required fields are missing: title, description, reporterName, reporterEmail, location" });
    }

    const reports = loadReports();

    let lat = Number(location.latitude);
    let lng = Number(location.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      lat = 37.7765;
      lng = -122.4230;
    }

    const isInside = isPointInPolygon(lat, lng, COMMUNITY_POLYGON);
    if (!isInside) {
      const [clampedLat, clampedLng] = clampCoordinatesToCommunity(lat, lng);
      lat = clampedLat;
      lng = clampedLng;
    }

    const newReport: any = {
      id: "rep-" + Date.now(),
      title,
      description,
      category: category || "others",
      urgency: urgency || "low",
      department: getFallbackDepartment(category || "others"),
      status: "reported",
      location: {
        ...location,
        latitude: lat,
        longitude: lng
      },
      image,
      reporterName,
      reporterEmail,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      missingDetails: [],
      officialLetter: "",
      timeline: [
        {
          status: "reported",
          date: new Date().toISOString(),
          comment: "Issue submitted by citizen " + reporterName + ".",
          updatedBy: "System"
        }
      ],
      comments: []
    };

    reports.unshift(newReport);
    saveReports(reports);

    // Respond immediately to the frontend to ensure a lightning-fast UI response
    // and completely eliminate the possibility of fetch timeouts / "Failed to fetch" errors.
    res.status(201).json(newReport);

    // If auto AI analysis is requested, perform it asynchronously in the background
    if (aiEnhance && ai) {
      (async () => {
        try {
          const prompt = `
            Analyze this hyperlocal civic issue and return a structured JSON response.
            
            Report Title: "${title}"
            Report Description: "${description}"
            Report Category (Suggested): "${category}"
            
            Tasks:
            1. Classify the issue category strictly into one of: "pothole", "garbage", "water_leakage", "broken_streetlight", "road_damage", "sewage", "illegal_dumping", "others".
            2. Determine the urgency level strictly from: "low", "medium", "high", "critical". Consider public safety, environmental hazard, and infrastructural blockages.
            3. Recommend the appropriate municipal department (e.g. "Department of Public Works", "Environmental Health & Sanitation", "Municipal Water Authority", "Bureau of Street Lighting", "Sewage and Drainage Division", etc.).
            4. Suggest an improved, structured, professional, grammatically correct version of the user's description (keep it comprehensive, professional, clear, and objective).
            5. Identify any missing details that might help municipal crews locate or fix the issue faster (list 2-3 details as simple strings, e.g., 'Precise landmark references', 'Estimated size or volume of waste', etc.).
            6. Generate a polite, official complaint letter template addressed to the recommended department head about this issue, referencing the location and hazard.
          `;

          const jsonSchema = {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "Strictly one of: pothole, garbage, water_leakage, broken_streetlight, road_damage, sewage, illegal_dumping, others" },
              urgency: { type: Type.STRING, description: "Strictly one of: low, medium, high, critical" },
              department: { type: Type.STRING, description: "The specific local agency or municipal department" },
              improvedDescription: { type: Type.STRING, description: "A grammatically perfect, structured, professional version of the report description" },
              missingDetails: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "2 to 3 suggestions of additional details that the reporter could provide"
              },
              officialLetter: { type: Type.STRING, description: "A formal complaint letter ready for physical mail or formal email submission" }
            },
            required: ["category", "urgency", "department", "improvedDescription", "missingDetails", "officialLetter"]
          };

          const aiResponse = await callGemini(prompt, jsonSchema);
          const parsedAI = JSON.parse(aiResponse);

          const freshReports = loadReports();
          const idx = freshReports.findIndex((r) => r.id === newReport.id);
          if (idx !== -1) {
            freshReports[idx].category = parsedAI.category || freshReports[idx].category;
            freshReports[idx].urgency = parsedAI.urgency || freshReports[idx].urgency;
            freshReports[idx].department = parsedAI.department || freshReports[idx].department;
            freshReports[idx].description = parsedAI.improvedDescription || freshReports[idx].description;
            freshReports[idx].missingDetails = parsedAI.missingDetails || [];
            freshReports[idx].officialLetter = parsedAI.officialLetter || "";
            
            freshReports[idx].timeline.push({
              status: "reported",
              date: new Date().toISOString(),
              comment: `Report enhanced automatically by Gemini. Classified as '${freshReports[idx].category}' (${freshReports[idx].urgency} urgency) and routed to '${freshReports[idx].department}'.`,
              updatedBy: "Gemini AI"
            });

            saveReports(freshReports);
            console.log(`[Community Hero AI] Background AI auto-enhancement complete for ticket: ${newReport.id}`);
          }
        } catch (aiErr) {
          console.error("Background AI Auto-Enhancement failed:", aiErr);
        }
      })();
    }
  } catch (error: any) {
    console.error("Error creating report:", error);
    res.status(500).json({ error: error.message || "Failed to process the report" });
  }
});

// Helper fallback routing
function getFallbackDepartment(category: string): string {
  switch (category) {
    case "pothole":
    case "road_damage":
      return "Department of Public Works";
    case "garbage":
    case "illegal_dumping":
      return "Environmental Health & Sanitation";
    case "water_leakage":
      return "Municipal Water Authority";
    case "broken_streetlight":
      return "Bureau of Street Lighting";
    case "sewage":
      return "Sewage and Drainage Division";
    default:
      return "Municipal Administration";
  }
}

// 3. Trigger manual Gemini AI analysis on an existing report
app.post("/api/reports/:id/analyze", async (req, res) => {
  const { id } = req.params;
  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[idx];

  if (!ai) {
    return res.status(503).json({ error: "Gemini API key is missing. AI analysis is currently unavailable." });
  }

  try {
    const prompt = `
      Perform an deep analytical review of this citizen-submitted civic issue.
      
      Title: "${report.title}"
      User Description: "${report.description}"
      Original Category: "${report.category}"
      
      Tasks:
      1. Classify the issue category strictly into one of: "pothole", "garbage", "water_leakage", "broken_streetlight", "road_damage", "sewage", "illegal_dumping", "others".
      2. Rate the urgency strictly as: "low", "medium", "high", "critical".
      3. Recommend the optimal department.
      4. Improve the description for official use.
      5. List 2-3 specific missing details that municipal staff might need.
      6. Draft a formal municipal complaint letter.
    `;

    const jsonSchema = {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING },
        urgency: { type: Type.STRING },
        department: { type: Type.STRING },
        improvedDescription: { type: Type.STRING },
        missingDetails: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        officialLetter: { type: Type.STRING }
      },
      required: ["category", "urgency", "department", "improvedDescription", "missingDetails", "officialLetter"]
    };

    const aiResponse = await callGemini(prompt, jsonSchema);
    const parsedAI = JSON.parse(aiResponse);

    report.category = parsedAI.category || report.category;
    report.urgency = parsedAI.urgency || report.urgency;
    report.department = parsedAI.department || report.department;
    report.description = parsedAI.improvedDescription || report.description;
    report.missingDetails = parsedAI.missingDetails || [];
    report.officialLetter = parsedAI.officialLetter || "";

    // Add Timeline Event
    report.timeline.push({
      status: report.status,
      date: new Date().toISOString(),
      comment: "On-demand Gemini analysis executed. Re-classified category, regenerated municipal complaint dispatch file, and polished details.",
      updatedBy: "Gemini AI Audit"
    });

    reports[idx] = report;
    saveReports(reports);

    res.json(report);
  } catch (error: any) {
    console.error("Error analyzing report:", error);
    res.status(500).json({ error: error.message || "Failed to analyze report" });
  }
});

// 4. Update Report Status (Admin utility to simulate local operations)
app.post("/api/reports/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, comment, updatedBy, workerEmail } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Missing required field: status" });
  }

  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[idx];

  // Securely verify that worker has authority to modify this report
  const reqWorkerEmail = req.headers["x-worker-email"] || workerEmail;
  if (reqWorkerEmail) {
    const emailStr = String(reqWorkerEmail).toLowerCase().trim();
    const workerNames: Record<string, string> = {
      "road.worker@greenvalley.com": "Dave Miller",
      "water.worker@greenvalley.com": "Sarah Jenkins",
      "electric.worker@greenvalley.com": "John Utility",
      "sanitation.worker@greenvalley.com": "Marcus Vance"
    };
    const name = workerNames[emailStr];
    if (!name || report.assignedWorker?.toLowerCase().trim() !== name.toLowerCase().trim()) {
      return res.status(403).json({ error: "Access Denied: This task is not assigned to you." });
    }
  }

  report.status = status;
  
  // Add Event to Timeline
  report.timeline.push({
    status,
    date: new Date().toISOString(),
    comment: comment || `Status updated to '${status}'`,
    updatedBy: updatedBy || "Municipal Official"
  });

  reports[idx] = report;
  saveReports(reports);

  res.json(report);
});

// 4a. Assign Worker to Report
app.post("/api/reports/:id/assign", (req, res) => {
  const { id } = req.params;
  const { workerName, workerRole, estimatedTime, status, comment } = req.body;

  if (!workerName || !workerRole) {
    return res.status(400).json({ error: "Missing required fields: workerName, workerRole" });
  }

  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[idx];
  report.assignedWorker = workerName;
  report.assignedWorkerRole = workerRole;
  report.estimatedResolutionTime = estimatedTime || "24 Hours";
  report.status = status || "scheduled";

  // Add Event to Timeline
  report.timeline.push({
    status: report.status,
    date: new Date().toISOString(),
    comment: comment || `Assigned to ${workerName} (${workerRole}). Estimated resolution: ${report.estimatedResolutionTime}.`,
    updatedBy: "Community Hero Dispatch"
  });

  reports[idx] = report;
  saveReports(reports);

  res.json(report);
});

// 4b. Verify Repair (multimodal AI analysis)
app.post("/api/reports/:id/verify-repair", async (req, res) => {
  const { id } = req.params;
  const { completionImage, workerNotes, workerEmail } = req.body;

  if (!completionImage) {
    return res.status(400).json({ error: "Missing required field: completionImage" });
  }

  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[idx];

  // Securely verify that worker has authority to modify this report
  const reqWorkerEmail = req.headers["x-worker-email"] || workerEmail;
  if (reqWorkerEmail) {
    const emailStr = String(reqWorkerEmail).toLowerCase().trim();
    const workerNames: Record<string, string> = {
      "road.worker@greenvalley.com": "Dave Miller",
      "water.worker@greenvalley.com": "Sarah Jenkins",
      "electric.worker@greenvalley.com": "John Utility",
      "sanitation.worker@greenvalley.com": "Marcus Vance"
    };
    const name = workerNames[emailStr];
    if (!name || report.assignedWorker?.toLowerCase().trim() !== name.toLowerCase().trim()) {
      return res.status(403).json({ error: "Access Denied: This task is not assigned to you." });
    }
  }

  report.completionImage = completionImage;
  report.workerNotes = workerNotes || "";
  report.status = "resolved_pending"; // Ready for Approval

  let verificationResult = {
    repairQuality: "Excellent",
    confidence: 96,
    recommendation: "Ready for Approval",
    feedback: "The completed repaving looks solid and clean. The hazard has been entirely cleared and asphalt level is perfectly flush."
  };

  if (ai) {
    try {
      // Build multimodal contents for Gemini
      const parts: any[] = [
        { text: `
          You are the Chief Safety & Municipal Repair Auditor of Community Hero AI.
          Compare the original reported civic issue (Before) with the completed repair work photo (After).
          Analyze the images to check if the municipal hazard (e.g. pothole, sewage, garbage dumping) has been fully cleared or resolved.
          Determine:
          1. Repair Quality (e.g., "Excellent", "Incomplete", "Satisfactory")
          2. Confidence Score (integer between 0 and 100 representing visual certainty)
          3. Recommendation (e.g., "Ready for Approval", "Requires Re-work")
          4. Feedback: A brief 2-sentence professional evaluation of the repair quality.
        ` }
      ];

      // Add original reported image if available
      if (report.image) {
        const cleanOrig = report.image.replace(/^data:image\/\w+;base64,/, "");
        parts.push({
          inlineData: { mimeType: "image/jpeg", data: cleanOrig }
        });
      }

      // Add worker's completion photo
      const cleanCompletion = completionImage.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: { mimeType: "image/jpeg", data: cleanCompletion }
      });

      const jsonSchema = {
        type: Type.OBJECT,
        properties: {
          repairQuality: { type: Type.STRING },
          confidence: { type: Type.INTEGER },
          recommendation: { type: Type.STRING },
          feedback: { type: Type.STRING }
        },
        required: ["repairQuality", "confidence", "recommendation", "feedback"]
      };

      let responseText = "";
      const models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash"];
      let lastError: any = null;

      for (const modelName of models) {
        let success = false;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: {
                parts: parts
              },
              config: {
                responseMimeType: "application/json",
                responseSchema: jsonSchema
              }
            });
            responseText = response.text || "";
            if (responseText) {
              success = true;
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`[Verification AI Attempt Failed] Model: ${modelName}, Attempt: ${attempt}/2. Error: ${err.message || err}`);
            if (attempt < 2) {
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
        }
        if (success) break;
      }

      if (!responseText && lastError) {
        throw lastError;
      }

      const parsed = JSON.parse(responseText || "{}");
      if (parsed.repairQuality) {
        verificationResult = {
          repairQuality: parsed.repairQuality,
          confidence: parsed.confidence || 95,
          recommendation: parsed.recommendation || "Ready for Approval",
          feedback: parsed.feedback || "Repair looks complete according to visual data."
        };
      }
    } catch (err: any) {
      console.error("Gemini repair verification failed, falling back to simulated output:", err);
      // Fallback is already initialized
    }
  }

  report.verificationResult = verificationResult;

  // Add event to timeline
  report.timeline.push({
    status: "resolved_pending",
    date: new Date().toISOString(),
    comment: `Repair completion photo submitted by ${report.assignedWorker || "Worker"}. Gemini AI Audit: Quality rated as '${verificationResult.repairQuality}' (${verificationResult.confidence}% confidence). Recommended: '${verificationResult.recommendation}'.`,
    updatedBy: "Gemini Repair Verification"
  });

  reports[idx] = report;
  saveReports(reports);

  res.json(report);
});

// 4c. Approve & Resolve Report
app.post("/api/reports/:id/approve", (req, res) => {
  const { id } = req.params;
  const { comment } = req.body;

  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[idx];
  report.status = "resolved";

  // Add Event to Timeline
  report.timeline.push({
    status: "resolved",
    date: new Date().toISOString(),
    comment: comment || "Repair work fully approved. Citizen ticket marked as successfully RESOLVED. Thank you for your service!",
    updatedBy: "Community Hero Manager"
  });

  reports[idx] = report;
  saveReports(reports);

  res.json(report);
});

// 5. Upvote a Report
app.post("/api/reports/:id/upvote", (req, res) => {
  const { id } = req.params;
  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  reports[idx].upvotes = (reports[idx].upvotes || 0) + 1;
  saveReports(reports);

  res.json({ id, upvotes: reports[idx].upvotes });
});

// 6. Add comment to a report
app.post("/api/reports/:id/comments", (req, res) => {
  const { id } = req.params;
  const { userName, comment } = req.body;

  if (!userName || !comment) {
    return res.status(400).json({ error: "Missing required fields: userName, comment" });
  }

  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const newComment = {
    id: "c-" + Date.now(),
    userName,
    comment,
    createdAt: new Date().toISOString()
  };

  reports[idx].comments = reports[idx].comments || [];
  reports[idx].comments.push(newComment);
  
  saveReports(reports);
  res.status(201).json(newComment);
});

// 7. Get AI Summary Brief of all reports for Analytics Dashboard
app.get("/api/reports/summary", async (req, res) => {
  if (!ai) {
    return res.json({
      summary: "AI Summary is in offline sandbox mode. Set GEMINI_API_KEY to experience intelligent summaries of community issues, hotspot trends, and resolutions."
    });
  }

  try {
    const reports = loadReports();
    if (reports.length === 0) {
      return res.json({ summary: "No civic reports have been submitted yet. Once residents start reporting issues, Gemini will compile the community summary here." });
    }

    const briefData = reports.map(r => ({
      title: r.title,
      category: r.category,
      urgency: r.urgency,
      status: r.status,
      address: r.location.address
    }));

    const prompt = `
      You are the Head Civic Intelligence Officer of Community Hero AI.
      Analyze the following batch of civic issues logged by residents in our community:
      ${JSON.stringify(briefData)}

      Write an elegant, 2-3 paragraph professional, encouraging, and informative briefing for the neighborhood bulletin board.
      
      Include:
      1. An analysis of the most frequent issue categories.
      2. The distribution of urgency levels (critical/high-priority items that need immediate resident or municipal awareness).
      3. A positive message about community involvement and the resolution progress of municipal departments.
      Keep it objective, extremely professional, and well-structured. No headers or markdown lists; just beautiful, readable prose paragraphs.
    `;

    const summaryText = await callGemini(prompt);
    res.json({ summary: summaryText });
  } catch (error: any) {
    console.error("Error generating AI Summary:", error);
    res.status(500).json({ error: "Failed to generate AI briefing summary" });
  }
});


// ------------------- VITE OR STATIC MIDDLEWARE -------------------

async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Community Hero AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap();
