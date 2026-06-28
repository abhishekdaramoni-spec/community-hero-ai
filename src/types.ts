export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'water_leakage'
  | 'broken_streetlight'
  | 'road_damage'
  | 'sewage'
  | 'illegal_dumping'
  | 'others';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export type IssueStatus =
  | 'reported'
  | 'investigating'
  | 'scheduled'
  | 'in_progress'
  | 'resolved_pending'
  | 'resolved';

export interface LocationInfo {
  latitude: number;
  longitude: number;
  address: string;
}

export interface TimelineEvent {
  status: IssueStatus;
  date: string;
  comment: string;
  updatedBy: string;
}

export interface CommentInfo {
  id: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface VerificationResult {
  repairQuality: string;
  confidence: number;
  recommendation: string;
  feedback: string;
}

export interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  urgency: UrgencyLevel;
  department: string;
  status: IssueStatus;
  location: LocationInfo;
  image?: string; // Base64 data URI
  reporterName: string;
  reporterEmail: string;
  createdAt: string;
  upvotes: number;
  officialLetter?: string;
  missingDetails?: string[];
  timeline: TimelineEvent[];
  comments: CommentInfo[];
  assignedWorker?: string;
  assignedWorkerRole?: string;
  estimatedResolutionTime?: string;
  workerNotes?: string;
  completionImage?: string; // Base64 data URI
  verificationResult?: VerificationResult;
}

export interface CivicStats {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  criticalIssues: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  byUrgency: Record<string, number>;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  read: boolean;
  issueId?: string;
}
