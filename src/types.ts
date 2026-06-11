export interface IntelNode {
  id: string;
  label: string;
  type: 'Individual' | 'Organization' | 'Server' | 'Bank Account' | 'IP Address';
  riskScore: number; // 0 - 100
  status: 'Active' | 'Under Observation' | 'Compromised' | 'Clear';
  details: string;
  location?: string;
  alias?: string;
  netWorth?: string;
  coordinates?: { lat: number; lng: number };
  // Physic simulation helpers
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  size?: number;
}

export interface IntelConnection {
  id: string;
  source: string;
  target: string;
  type: 'Transaction' | 'Affiliation' | 'Communication' | 'Ownership';
  weight: number; // 0.1 to 1.0
  suspicious: boolean;
  value?: string; // e.g. "$450,000 Transfer"
  timestamp?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  category: 'Incident' | 'Transaction' | 'Intercept' | 'System' | 'Evidence';
  riskLevel: 'Critical' | 'Severe' | 'Moderate' | 'Low';
  associatedNodes: string[];
}

export interface SimulationResult {
  scenarioName: string;
  growthFactor: number;
  confidenceLevel: number; // 0 - 100
  timeframeMonths: number;
  criticalOutcomes: string[];
  riskProjection: { month: string; risk: number; nodeCount: number; compromiseRate: number }[];
  predictedNodes: IntelNode[];
  predictedConnections: IntelConnection[];
  rebuiltSimulationStructure?: Record<string, any>;
}

export interface InvestigationCase {
  id: string;
  title: string;
  summary: string;
  status: 'Active' | 'Classified' | 'Archived' | 'Ongoing';
  dateCreated: string;
  riskIndex: number; // 0-100
  evidenceCount: number;
  nodes: IntelNode[];
  connections: IntelConnection[];
  timeline: TimelineEvent[];
  summaryAI?: string;
}

export interface SystemStatus {
  cpuLoad: number;
  memoryUsage: number;
  activeDecrypts: number;
  activeThreatLevel: number; // 0-100
  liveNodeCount: number;
  threatStatus: 'STABLE' | 'WARNING' | 'CRITICAL_THREAT';
}
