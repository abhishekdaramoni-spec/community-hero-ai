export interface CentralWorker {
  id: string;
  name: string;
  email: string;
  dept: string;
  avatar: string;
  avatarBg: string;
  phone: string;
  employeeId: string;
  role: string;
  avail: string;
  status: string;
  experience: number;
  zone: "North Zone" | "South Zone" | "East Zone" | "West Zone" | "Center Zone";
  coords: [number, number];
  avgTime: string;
  clearance: string;
  workload: string;
  rating: number;
  reason: string;
  category: string[];
  eta: string;
  shift: string;
}

export const CENTRALIZED_WORKERS: CentralWorker[] = [
  {
    id: "w-1",
    name: "Dave Miller",
    email: "road.worker@greenvalley.com",
    dept: "Road Maintenance",
    avatar: "👷‍♂️",
    avatarBg: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
    phone: "+1 (555) 234-5678",
    employeeId: "RW-001",
    role: "Road Crew Supervisor",
    avail: "High",
    status: "Available",
    experience: 8,
    zone: "East Zone",
    coords: [37.7780, -122.4280],
    avgTime: "2.4 hours",
    clearance: "Licensed Asphalt Systems Operator (Level III)",
    workload: "1 active task",
    rating: 4.8,
    reason: "Asphalt Specialist, operates in local Ward 4, fully equipped",
    category: ["pothole", "road_damage"],
    eta: "10 mins away",
    shift: "Day Shift (07:00 - 15:30)"
  },
  {
    id: "w-2",
    name: "Marcus Vance",
    email: "water.worker@greenvalley.com",
    dept: "Water Supply",
    avatar: "🔧",
    avatarBg: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
    phone: "+1 (555) 345-6789",
    employeeId: "WS-001",
    role: "Water Systems Engineer",
    avail: "Immediate",
    status: "On Call",
    experience: 6,
    zone: "Center Zone",
    coords: [37.7730, -122.4260],
    avgTime: "3.1 hours",
    clearance: "Certified Backflow Prevention Specialist (Level II)",
    workload: "2 active tasks",
    rating: 4.9,
    reason: "Water Specialist, lowest queue load, nearest to site",
    category: ["water_leakage", "sewage"],
    eta: "15 mins away",
    shift: "Day Shift (08:00 - 16:30)"
  },
  {
    id: "w-3",
    name: "Sarah Jenkins",
    email: "electric.worker@greenvalley.com",
    dept: "Electrical Maintenance",
    avatar: "⚡",
    avatarBg: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
    phone: "+1 (555) 456-7890",
    employeeId: "EL-001",
    role: "Senior Electrical Crew Lead",
    avail: "Immediate",
    status: "Available",
    experience: 10,
    zone: "West Zone",
    coords: [37.7790, -122.4180],
    avgTime: "1.8 hours",
    clearance: "Certified High-Voltage Infrastructure Technician",
    workload: "0 active tasks",
    rating: 4.9,
    reason: "Grid Certified, lowest active queue load, on-call nearby",
    category: ["broken_streetlight"],
    eta: "10 mins away",
    shift: "Night Shift (18:00 - 02:30)"
  },
  {
    id: "w-4",
    name: "John Utility",
    email: "sanitation.worker@greenvalley.com",
    dept: "Sanitation",
    avatar: "🧹",
    avatarBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
    phone: "+1 (555) 567-8901",
    employeeId: "SN-001",
    role: "Sanitation Lead Foreman",
    avail: "Medium",
    status: "Busy",
    experience: 5,
    zone: "South Zone",
    coords: [37.7740, -122.4160],
    avgTime: "1.5 hours",
    clearance: "Certified Biohazard Handling & Disposal Lead",
    workload: "3 active tasks",
    rating: 4.7,
    reason: "Biohazard certified, nearest heavy loader vehicle on-site",
    category: ["garbage", "illegal_dumping", "others"],
    eta: "20 mins away",
    shift: "Early Morning Shift (05:00 - 13:30)"
  }
];

export const WORKERS_MAP = CENTRALIZED_WORKERS.reduce<Record<string, CentralWorker>>((acc, worker) => {
  acc[worker.email.toLowerCase()] = worker;
  return acc;
}, {});
