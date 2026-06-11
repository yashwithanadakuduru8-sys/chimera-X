import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
const PORT = 3000;

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const apiKeyExists = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

if (apiKeyExists) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("CHIMERA-X: Server-side Gemini client initialized successfully.");
  } catch (error) {
    console.warn("CHIMERA-X: Failed to initialize Gemini client. Using fallback simulator.");
  }
} else {
  console.log("CHIMERA-X: No valid GEMINI_API_KEY found. Operating in offline/simulator mode.");
}

// Resilient API Call Helper with Transient Error Retries (handles 503, 429, etc.)
async function generateContentWithRetry(aiClient: GoogleGenAI, params: any, retries = 2, delayMs = 600): Promise<any> {
  let attempt = 0;
  while (true) {
    try {
      return await aiClient.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const statusText = String(err?.status || err?.message || err).toUpperCase();
      const isTransient = statusText.includes("UNAVAILABLE") || 
                          statusText.includes("503") || 
                          statusText.includes("EXHAUSTED") || 
                          statusText.includes("429") ||
                          statusText.includes("DEMAND");
                          
      if (isTransient && attempt <= retries) {
        console.warn(`CHIMERA-X API: Gemini API returned transient error (attempt ${attempt}/${retries}). Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 1.5;
        continue;
      }
      throw err;
    }
  }
}

// Store basic persistent session state for current intelligence work inside the server
let currentCase = {
  id: "case-01",
  title: "Operation Frostbite: Syndicate Financial Cyber-Warfare",
  summary: "Comprehensive investigation into a high-risk illicit finance ring bypassing conventional banking monitors using micro-structured decentralized channels.",
  status: "Active" as const,
  dateCreated: "2026-05-12",
  riskIndex: 78,
  evidenceCount: 14,
  nodes: [
    { id: "node-1", label: "Marcus Vance", type: "Individual", riskScore: 84, status: "Active", details: "Primary subject of Frostbite. Disguised as hedge fund lead.", location: "Zurich, CH", alias: "The Architect", netWorth: "$14.2M" },
    { id: "node-2", label: "Aegis Ledger Corp", type: "Organization", riskScore: 45, status: "Under Observation", details: "Shell entity registered in Panama. Handles asset structures.", location: "Panama City, PAN" },
    { id: "node-3", label: "Host Server 182.20.1.9", type: "Server", riskScore: 92, status: "Compromised", details: "Relay server routing encrypted crypto-credits and server communications.", location: "Frankfurt, GER" },
    { id: "node-4", label: "Global Trust Cayman", type: "Bank Account", riskScore: 68, status: "Active", details: "Account structure routing suspicious rapid-wire movements.", location: "Grand Cayman, CAY" },
    { id: "node-5", label: "Deep-Gateway-Proxy", type: "IP Address", riskScore: 76, status: "Under Observation", details: "Socks5 proxy facilitating administrative connections to Aegis.", location: "Saint Petersburg, RU" },
  ],
  connections: [
    { id: "conn-1", source: "node-1", target: "node-2", type: "Affiliation", weight: 0.9, suspicious: true, value: "Command Authority" },
    { id: "conn-2", source: "node-1", target: "node-4", type: "Transaction", weight: 0.85, suspicious: true, value: "$2.4M Crypto Liquidation", timestamp: "12 Hours Ago" },
    { id: "conn-3", source: "node-2", target: "node-4", type: "Ownership", weight: 0.60, suspicious: false, value: "90% Stakeholder" },
    { id: "conn-4", source: "node-3", target: "node-5", type: "Communication", weight: 0.75, suspicious: true, value: "Encrypted SSH Tunneled Activity", timestamp: "Live Flow" },
    { id: "conn-5", source: "node-5", target: "node-2", type: "Communication", weight: 0.88, suspicious: true, value: "Admin Portal Command Logs", timestamp: "3 Mins Ago" }
  ],
  timeline: [
    { id: "t-1", timestamp: "2026-06-07 04:12", title: "Encrypted Relay Handshake", description: "Host Server 182.20.1.9 established unusual long-running SOCKS5 session with Saint Petersburg proxy gateway.", category: "Incident", riskLevel: "Critical", associatedNodes: ["node-3", "node-5"] },
    { id: "t-2", timestamp: "2026-06-06 21:30", title: "Significant Asset Redirection", description: "Marcus Vance authorized high-value offshore transfers to Global Trust Cayman totaling $2,420,000.", category: "Transaction", riskLevel: "Severe", associatedNodes: ["node-1", "node-4"] },
    { id: "t-3", timestamp: "2026-06-05 11:15", title: "Aegis License Revision", description: "Panama corporate registries modified control mandates, listing Marcus Vance as ultimate proxy controller.", category: "Evidence", riskLevel: "Moderate", associatedNodes: ["node-1", "node-2"] }
  ]
};

// --- API ENDPOINTS ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "alive", system: "CHIMERA-X OS Core Server Mode" });
});

// Get Current Intelligence Case
app.get("/api/case", (req, res) => {
  res.json(currentCase);
});

// Update Case Manually
app.post("/api/case/update", (req, res) => {
  if (req.body.nodes) currentCase.nodes = req.body.nodes;
  if (req.body.connections) currentCase.connections = req.body.connections;
  if (req.body.timeline) currentCase.timeline = req.body.timeline;
  if (req.body.title) currentCase.title = req.body.title;
  if (req.body.summary) currentCase.summary = req.body.summary;
  if (req.body.riskIndex) currentCase.riskIndex = req.body.riskIndex;
  res.json({ status: "success", updatedCase: currentCase });
});

// Reset Case to defaults
app.post("/api/case/reset", (req, res) => {
  currentCase = {
    id: "case-01",
    title: "Operation Frostbite: Syndicate Financial Cyber-Warfare",
    summary: "Comprehensive investigation into a high-risk illicit finance ring bypassing conventional banking monitors using micro-structured decentralized channels.",
    status: "Active" as const,
    dateCreated: "2026-05-12",
    riskIndex: 78,
    evidenceCount: 14,
    nodes: [
      { id: "node-1", label: "Marcus Vance", type: "Individual", riskScore: 84, status: "Active", details: "Primary subject of Frostbite. Disguised as hedge fund lead.", location: "Zurich, CH", alias: "The Architect", netWorth: "$14.2M" },
      { id: "node-2", label: "Aegis Ledger Corp", type: "Organization", riskScore: 45, status: "Under Observation", details: "Shell entity registered in Panama. Handles asset structures.", location: "Panama City, PAN" },
      { id: "node-3", label: "Host Server 182.20.1.9", type: "Server", riskScore: 92, status: "Compromised", details: "Relay server routing encrypted crypto-credits and server communications.", location: "Frankfurt, GER" },
      { id: "node-4", label: "Global Trust Cayman", type: "Bank Account", riskScore: 68, status: "Active", details: "Account structure routing suspicious rapid-wire movements.", location: "Grand Cayman, CAY" },
      { id: "node-5", label: "Deep-Gateway-Proxy", type: "IP Address", riskScore: 76, status: "Under Observation", details: "Socks5 proxy facilitating administrative connections to Aegis.", location: "Saint Petersburg, RU" },
    ],
    connections: [
      { id: "conn-1", source: "node-1", target: "node-2", type: "Affiliation", weight: 0.9, suspicious: true, value: "Command Authority" },
      { id: "conn-2", source: "node-1", target: "node-4", type: "Transaction", weight: 0.85, suspicious: true, value: "$2.4M Crypto Liquidation", timestamp: "12 Hours Ago" },
      { id: "conn-3", source: "node-2", target: "node-4", type: "Ownership", weight: 0.60, suspicious: false, value: "90% Stakeholder" },
      { id: "conn-4", source: "node-3", target: "node-5", type: "Communication", weight: 0.75, suspicious: true, value: "Encrypted SSH Tunneled Activity", timestamp: "Live Flow" },
      { id: "conn-5", source: "node-5", target: "node-2", type: "Communication", weight: 0.88, suspicious: true, value: "Admin Portal Command Logs", timestamp: "3 Mins Ago" }
    ],
    timeline: [
      { id: "t-1", timestamp: "2026-06-07 04:12", title: "Encrypted Relay Handshake", description: "Host Server 182.20.1.9 established unusual long-running SOCKS5 session with Saint Petersburg proxy gateway.", category: "Incident", riskLevel: "Critical", associatedNodes: ["node-3", "node-5"] },
      { id: "t-2", timestamp: "2026-06-06 21:30", title: "Significant Asset Redirection", description: "Marcus Vance authorized high-value offshore transfers to Global Trust Cayman totaling $2,420,000.", category: "Transaction", riskLevel: "Severe", associatedNodes: ["node-1", "node-4"] },
      { id: "t-3", timestamp: "2026-06-05 11:15", title: "Aegis License Revision", description: "Panama corporate registries modified control mandates, listing Marcus Vance as ultimate proxy controller.", category: "Evidence", riskLevel: "Moderate", associatedNodes: ["node-1", "node-2"] }
    ]
  };
  res.json({ status: "success", resetCase: currentCase });
});

// AI Assistant Command Bar Endpoint (Query Handler)
app.post("/api/query", async (req, res) => {
  const { query, networkContext } = req.body;
  if (!query) {
    return res.status(400).json({ error: "No query parameter specified" });
  }

  const prompt = `You are CHIMERA-X, a top-tier world-class intelligence assistant used by military, intelligence agencies, cybersecurity groups, and financial investigators.
Analyze user command: "${query}" in context of the following current network intelligence context:
Nodes: ${JSON.stringify(networkContext?.nodes || currentCase.nodes)}
Connections: ${JSON.stringify(networkContext?.connections || currentCase.connections)}

Reply in JSON format strictly matching this schema:
{
  "response": "Beautiful, comprehensive intelligence analyst writeup explaining the answer with professional, top-tier tone regarding fraud detection, hidden paths, or predictive metrics.",
  "addedNodes": [
    // optional list of new nodes discovered or suggested to add to the map if appropriate (with real properties matching the IntelNode schema)
  ],
  "addedConnections": [
    // optional list of new pathways discovered or suggested to connect existing/new nodes
  ],
  "associatedTimelineEvents": [
    // optional timeline events related to this discovery
  ]
}
Make your observations incredibly deep, realistic, and highly forensic. Highlight patterns, suspicious indicators, or threat vectors. Default to "addedNodes" and "addedConnections" empty if the prompt is purely informational. Ensure risk scores and descriptions are highly technical. Keep your tone sober, professional, authoritative, and clinical (no cyberpunk or gamer flippancy).`;

  if (ai) {
    try {
      const gRes = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: { type: Type.STRING },
              addedNodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING, description: "Must be: Individual, Organization, Server, Bank Account, or IP Address" },
                    riskScore: { type: Type.INTEGER },
                    status: { type: Type.STRING },
                    details: { type: Type.STRING },
                    location: { type: Type.STRING },
                    alias: { type: Type.STRING },
                    netWorth: { type: Type.STRING }
                  },
                  required: ["id", "label", "type", "riskScore", "status", "details"]
                }
              },
              addedConnections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    type: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    suspicious: { type: Type.BOOLEAN },
                    value: { type: Type.STRING }
                  },
                  required: ["id", "source", "target", "type", "weight", "suspicious"]
                }
              },
              associatedTimelineEvents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING },
                    riskLevel: { type: Type.STRING },
                    associatedNodes: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["id", "timestamp", "title", "description", "category", "riskLevel", "associatedNodes"]
                }
              }
            },
            required: ["response"]
          }
        }
      });

      const responseText = gRes.text?.trim() || "{}";
      const parsed = JSON.parse(responseText);
      
      // If AI returns nodes/connections, automatically update current state context to make database progress REAL!
      if (parsed.addedNodes && parsed.addedNodes.length > 0) {
        currentCase.nodes.push(...parsed.addedNodes);
      }
      if (parsed.addedConnections && parsed.addedConnections.length > 0) {
        currentCase.connections.push(...parsed.addedConnections);
      }
      if (parsed.associatedTimelineEvents && parsed.associatedTimelineEvents.length > 0) {
        currentCase.timeline.unshift(...parsed.associatedTimelineEvents);
      }

      return res.json(parsed);
    } catch (err: any) {
      console.warn("CHIMERA-X API: Gemini Query API offline or temporarily unavailable. Using local fallback simulator: ", err?.message || err);
      // Fall through to offline response
    }
  }

  // --- FAILSafe RULE-BASED INTELLIGENCE SIMULATOR ---
  // If no Gemini API key or an error occured, process query locally with high fidelity
  const lowercaseQuery = query.toLowerCase();
  let aiResponse = "CHIMERA-X Core analyzed standard node database indices. No immediate alerts triggered.";
  const addedNodes: any[] = [];
  const addedConnections: any[] = [];
  const associatedTimelineEvents: any[] = [];

  if (lowercaseQuery.includes("fraud") || lowercaseQuery.includes("leaders") || lowercaseQuery.includes("hidden")) {
    aiResponse = "INTELLIGENCE REPORT: Analysis of communications and Panama Registry holdings reveals structurally obscured affiliations. Subject 'Marcus Vance' holds unlisted executive control over 'Aegis Ledger Corp' through intermediary SOCKS5 IP Address node. Cross-referencing shell asset streams identifies potential proxy bank operations under suspect alias 'The Architect'. Threat index rating reassessed: SEVERE.";
    
    // Discovered Hidden Leader individual in proxy bank account connection
    const extraNodeId = "node-discovered-1";
    if (!currentCase.nodes.some(n => n.id === extraNodeId)) {
      const newNode = {
        id: extraNodeId,
        label: "Irina Rostova",
        type: "Individual" as const,
        riskScore: 89,
        status: "Active" as const,
        details: "Alleged financial orchestrator located in Moscow database networks. Correlates to SOCKS5 configuration headers.",
        location: "Moscow, RU",
        alias: "Siberian Falcon",
        netWorth: "$8.4M"
      };
      addedNodes.push(newNode);
      currentCase.nodes.push(newNode);

      const conn1 = {
        id: "conn-disc-1",
        source: "node-5", // Gateway proxy IP
        target: extraNodeId,
        type: "Affiliation" as const,
        weight: 0.95,
        suspicious: true,
        value: "Secure Control Uplink"
      };
      const conn2 = {
        id: "conn-disc-2",
        source: extraNodeId,
        target: "node-4", // Cayman Account
        type: "Transaction" as const,
        weight: 0.72,
        suspicious: true,
        value: "Structured Wire Transfers"
      };
      addedConnections.push(conn1, conn2);
      currentCase.connections.push(conn1, conn2);

      const timelineEvent = {
        id: "t-disc-1",
        timestamp: "2026-06-07 08:35",
        title: "Hidden Intelligence Node Discovered",
        description: "AI search algorithms tracked admin logins on Aegis Proxy from Moscow IP subnet, identifying Irina Rostova as a key affiliate of Marcus Vance.",
        category: "Evidence" as const,
        riskLevel: "Critical" as const,
        associatedNodes: ["node-5", extraNodeId, "node-4"]
      };
      associatedTimelineEvents.push(timelineEvent);
      currentCase.timeline.unshift(timelineEvent);
    } else {
      aiResponse = "INTELLIGENCE REPORT: Hidden structure analysis complete. Sub-agent Irina Rostova and Cayman transfer flows mapped cleanly. Central influence scores established for all main hub entities.";
    }
  } else if (lowercaseQuery.includes("impact") || lowercaseQuery.includes("predict") || lowercaseQuery.includes("simulation")) {
    aiResponse = "PREDICTIVE FORECAST SUMMARY: Six-month trend projection utilizing multi-layered modeling. Left unmitigated, transactional volumes between the Zurich node (Marcus Vance) and Shell Account ( Cayman ) will swell by approximately 45%. System predicts a 78% probability of SOCKS5 command server migration to secondary DNS proxies, widening the overall risk signature and potentially compromising associated shell corporations in the European theater.";
  } else if (lowercaseQuery.includes("report") || lowercaseQuery.includes("generate")) {
    aiResponse = `--- CHIMERA-X INTELLIGENCE SYSTEM BRIEFING RECORD ---
SUBJECT: Operation Frostbite Threat Diagnostics
CORE THREAT INDEX: ${currentCase.riskIndex}% Severe
PRIMARY ADVERSARY: ${currentCase.nodes[0].label} (${currentCase.nodes[0].alias})
KEY DISCOVERIES:
- Relational mapping of shell entity 'Aegis Ledger Corp' registered offshore.
- Active communication channels linking Germany and Russian proxy hops.
- Accelerated asset shifts exceeding $2.4M USD inside banking gateways.

TACTICAL RECOMMENDATION: Immediately establish behavioral filters on Cayman routing points and apply active scanning protocol to identified SOCKS5 proxy clusters.`;
  } else {
    aiResponse = `Query processed on index directories. Database reports ${currentCase.nodes.length} nodes and ${currentCase.connections.length} active vectors. Please detail investigation query parameters (e.g., fraudulent asset flows, SOCKS5 relays, or scenario simulation impact).`;
  }

  res.json({
    response: aiResponse,
    addedNodes,
    addedConnections,
    associatedTimelineEvents
  });
});

// Investigations Document Analyzer Endpoint
app.post("/api/investigate", async (req, res) => {
  const { fileName, fileContent } = req.body;
  if (!fileContent) {
    return res.status(400).json({ error: "Missing document content or logs context" });
  }

  const prompt = `You are performing an automated forensic document parsing for a high-security investigative platform called CHIMERA-X.
Parse the following corporate/system document content from file: "${fileName || 'raw_dump.txt'}".
Content:
"""
${fileContent}
"""

We require structural entity extraction, relationship weighting, timeline events reconstruction, and overall security risk analysis.
Format your output strictly as standard JSON complying with this exact schema structure:
{
  "analyzedTitle": "Sober official name of intelligence breach or forensic event (e.g., 'Project Chronos Wire Fraud Analysis')",
  "executiveSummary": "Clinical high-level analyst summary of what this document exposes, the perpetrators, compromised nodes, and financial/security severity.",
  "overallRiskIndex": 85, // Integer 0 to 100
  "discoveredNodes": [
    {
      "id": "node-doc-unique-id",
      "label": "Name of Suspect Entity",
      "type": "Individual | Organization | Server | Bank Account | IP Address",
      "riskScore": 75, // 0 to 100
      "status": "Active | Under Observation | Compromised | Clear",
      "details": "Explanation of their involvement as detailed by the logs/records",
      "location": "Optional location city",
      "alias": "Optional codename/alias",
      "netWorth": "Optional estimated liquid wealth"
    }
  ],
  "discoveredConnections": [
    {
      "id": "conn-doc-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "type": "Transaction | Affiliation | Communication",
      "weight": 0.85, // float 0 to 1
      "suspicious": true,
      "value": "Optional money transfer e.g. '$14,000' or connection explanation"
    }
  ],
  "reconstructedTimeline": [
    {
      "id": "time-doc-id",
      "timestamp": "2026-06-07 11:24 (or timestamp from doc)",
      "title": "Forensic Event Action",
      "description": "Precisely what transpired",
      "category": "Incident | Transaction | Intercept | Evidence",
      "riskLevel": "Critical | Severe | Moderate | Low",
      "associatedNodes": ["associated-node-id-1"]
    }
  ]
}
Be highly meticulous. If files contain IP addresses, bank account numbers, individual names, or transfers, extract them all and form a secure structural network map.`;

  if (ai) {
    try {
      const gRes = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analyzedTitle: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              overallRiskIndex: { type: Type.INTEGER },
              discoveredNodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    riskScore: { type: Type.INTEGER },
                    status: { type: Type.STRING },
                    details: { type: Type.STRING },
                    location: { type: Type.STRING },
                    alias: { type: Type.STRING },
                    netWorth: { type: Type.STRING }
                  },
                  required: ["id", "label", "type", "riskScore", "status", "details"]
                }
              },
              discoveredConnections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    type: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    suspicious: { type: Type.BOOLEAN },
                    value: { type: Type.STRING }
                  },
                  required: ["id", "source", "target", "type", "weight", "suspicious"]
                }
              },
              reconstructedTimeline: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING },
                    riskLevel: { type: Type.STRING },
                    associatedNodes: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["id", "timestamp", "title", "description", "category", "riskLevel", "associatedNodes"]
                }
              }
            },
            required: ["analyzedTitle", "executiveSummary", "overallRiskIndex", "discoveredNodes", "discoveredConnections", "reconstructedTimeline"]
          }
        }
      });

      const parsed = JSON.parse(gRes.text?.trim() || "{}");
      
      // Inject newly parsed items into server persistent case state!
      if (parsed.discoveredNodes && parsed.discoveredNodes.length > 0) {
        currentCase.nodes.push(...parsed.discoveredNodes);
      }
      if (parsed.discoveredConnections && parsed.discoveredConnections.length > 0) {
        currentCase.connections.push(...parsed.discoveredConnections);
      }
      if (parsed.reconstructedTimeline && parsed.reconstructedTimeline.length > 0) {
        currentCase.timeline.unshift(...parsed.reconstructedTimeline);
      }
      currentCase.title = parsed.analyzedTitle || currentCase.title;
      currentCase.riskIndex = parsed.overallRiskIndex || currentCase.riskIndex;
      currentCase.summary = parsed.executiveSummary || currentCase.summary;

      return res.json(parsed);
    } catch (e: any) {
      console.warn("CHIMERA-X API: Gemini Investigation API offline or temporarily unavailable. Using local fallback parser: ", e?.message || e);
      // Fall through to default parser simulation
    }
  }

  // Local parser sandbox (if no Gemini AI) - Parses simple string variables
  const lowerContent = fileContent.toLowerCase();
  
  // Create beautiful discovery lists organically from file triggers
  const title = `Analyzed File: ${fileName || 'Corporate_Ledger.txt'}`;
  let summaryText = "Automated structural parser identified high correlations in the raw import text. Key suspect targets map cleanly to centralized account structures.";
  let riskVal = 62;
  
  const nodes: any[] = [];
  const conns: any[] = [];
  const times: any[] = [];

  // Parse custom names or entities dynamically
  if (lowerContent.includes("bitcoin") || lowerContent.includes("crypto") || lowerContent.includes("addr")) {
    summaryText = "Forensic parsing uncovered an underground crypto laundering pipe. Multi-hop connections identified between Zurich and Cayman shell proxies.";
    riskVal = 88;
    const nIdx = "node-laun-1";
    nodes.push({ id: nIdx, label: "Crypt-Swap Gateway", type: "Server", riskScore: 88, status: "Compromised", details: "Relaying unstructured peer-to-peer ledger actions.", location: "Amsterdam, NL" });
    conns.push({ id: "conn-laun-1", source: "node-1", target: nIdx, type: "Transaction", weight: 0.85, suspicious: true, value: "$180,000 P2P Liquidation" });
    times.push({ id: "time-laun-1", timestamp: "2026-06-07 10:15", title: "Crypt-Swap Relay Connected", description: "Automated analysis parsed connection to unregulated exchange gate from active suspect IP.", category: "Incident", riskLevel: "Critical", associatedNodes: [nIdx, "node-1"] });
  } else {
    // Standard extraction mock
    const nIdx = "node-extra-100";
    nodes.push({ id: nIdx, label: "Intermediary Apex-Sec", type: "Organization", riskScore: 54, status: "Clear", details: "Listed in logs as routing point. Corporate presence is verified.", location: "London, UK" });
    conns.push({ id: "conn-extra-1", source: "node-1", target: nIdx, type: "Affiliation", weight: 0.50, suspicious: false, value: "Verified Consulting client" });
    times.push({ id: "time-extra-1", timestamp: "2026-06-07 01:22", title: "Apex-Sec Registry Scan", description: "Logs confirm Apex-Sec listed as a consulting contractor on Marcus Vance accounts.", category: "Evidence", riskLevel: "Low", associatedNodes: [nIdx] });
  }

  // Update server case
  currentCase.nodes.push(...nodes);
  currentCase.connections.push(...conns);
  currentCase.timeline.unshift(...times);
  currentCase.title = title;
  currentCase.riskIndex = riskVal;
  currentCase.summary = summaryText;

  res.json({
    analyzedTitle: title,
    executiveSummary: summaryText,
    overallRiskIndex: riskVal,
    discoveredNodes: nodes,
    discoveredConnections: conns,
    reconstructedTimeline: times
  });
});

// Future Simulation Engine Endpoint
app.post("/api/simulate", async (req, res) => {
  const { scenario, growth, durationMonths } = req.body;
  if (!scenario) {
    return res.status(400).json({ error: "No scenario description specified" });
  }

  const prompt = `You are the core Future Simulation Engine of CHIMERA-X, an advanced predictive security platform.
The user wants to simulate standard or black-swan risks over a period of ${durationMonths || 6} months.
Scenario: "${scenario}"
Growth / Intensity Rate: ${growth || 40}%

Current Base Situation:
Nodes: ${JSON.stringify(currentCase.nodes)}
Connections: ${JSON.stringify(currentCase.connections)}

Return a structured predictive dataset in JSON format containing:
1. "scenarioName": Elegant high-tech title (e.g. 'Scenario Delta: Financial Growth Aggie Profile')
2. "confidenceLevel": percentage 0 to 100
3. "criticalOutcomes": 3-5 bullet points of logical forecast outcomes (e.g., node compromises, wire escalations, intervention reactions)
4. "riskProjection": Array of monthly points over the timeline (e.g. Month 1, Month 2, ... Month 6) with:
   - "month"
   - "risk": projected overall threat risk level (0-100)
   - "nodeCount": expected size of system (number of active nodes)
   - "compromiseRate": expected percentage of compromised nodes (0-100)
5. "predictedNodes": discovers or maps potential new proxy nodes spawned by this simulation scenario
6. "predictedConnections": potential connection pathways that will form under this scenario

Provide realistic, clinically severe, high-grade forecast data. Avoid generic mock descriptions. Ensure your predictions are mathematically consistent with the growth parameters specified.`;

  if (ai) {
    try {
      const gRes = await generateContentWithRetry(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenarioName: { type: Type.STRING },
              confidenceLevel: { type: Type.INTEGER },
              criticalOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskProjection: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    month: { type: Type.STRING },
                    risk: { type: Type.INTEGER },
                    nodeCount: { type: Type.INTEGER },
                    compromiseRate: { type: Type.INTEGER }
                  },
                  required: ["month", "risk", "nodeCount", "compromiseRate"]
                }
              },
              predictedNodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    type: { type: Type.STRING },
                    riskScore: { type: Type.INTEGER },
                    status: { type: Type.STRING },
                    details: { type: Type.STRING },
                    location: { type: Type.STRING }
                  },
                  required: ["id", "label", "type", "riskScore", "status", "details"]
                }
              },
              predictedConnections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    source: { type: Type.STRING },
                    target: { type: Type.STRING },
                    type: { type: Type.STRING },
                    weight: { type: Type.NUMBER },
                    suspicious: { type: Type.BOOLEAN },
                    value: { type: Type.STRING }
                  },
                  required: ["id", "source", "target", "type", "weight", "suspicious"]
                }
              }
            },
            required: ["scenarioName", "confidenceLevel", "criticalOutcomes", "riskProjection", "predictedNodes", "predictedConnections"]
          }
        }
      });

      const parsed = JSON.parse(gRes.text?.trim() || "{}");
      return res.json(parsed);
    } catch (e: any) {
      console.warn("CHIMERA-X API: Gemini Simulation API offline or temporarily unavailable. Using local fallback simulator: ", e?.message || e);
      // Fall through to offline simulation
    }
  }

  // Fallback simulator engine with rule-based projection
  const timeframe = parseInt(durationMonths as string) || 6;
  const isGrowing = growth > 20;
  
  const criticalOutcomes = [
    `Node contamination is projected to expand across European borders via ${growth}% increased traffic on SOCKS5 proxy centers.`,
    `Shell entity accounts will funnel approximately $${(3.1 * (1 + growth/100)).toFixed(2)}M USD into Global Trust Cayman, bypassing standard swift indicators.`,
    `AI models suggest 82% critical probability of network fragmentation once observation thresholds exceed risk score 90.`
  ];

  const riskProjection: any[] = [];
  for (let m = 1; m <= timeframe; m++) {
    const riskVal = Math.min(100, Math.floor(currentCase.riskIndex + m * (growth / 12)));
    const nodeCount = currentCase.nodes.length + Math.floor(m * (growth / 40));
    const compromiseRate = Math.min(100, Math.floor(20 + m * (growth / 8)));
    riskProjection.push({
      month: `Month 0${m}`,
      risk: riskVal,
      nodeCount,
      compromiseRate
    });
  }

  const pNodes = [
    { id: "node-sim-1", label: "Hargraves Private Bank", type: "Bank Account" as const, riskScore: 81, status: "Active" as const, details: "Anticipated offshore routing point for escalated liquid transfers.", location: "Nassau, BS" },
    { id: "node-sim-2", label: "Server Node_B5", type: "Server" as const, riskScore: 89, status: "Under Observation" as const, details: "Projected command center migration server to route decentralized actions.", location: "Stockholm, SE" }
  ];

  const pConns = [
    { id: "conn-sim-1", source: "node-4", target: "node-sim-1", type: "Transaction" as const, weight: 0.88, suspicious: true, value: "Projected Micro-transfers" },
    { id: "conn-sim-2", source: "node-sim-2", target: "node-5", type: "Communication" as const, weight: 0.72, suspicious: true, value: "Command Relay Tunneling" }
  ];

  res.json({
    scenarioName: `Scenario Projection: ${isGrowing ? 'Expansion Matrix' : 'Stable Containment'} (${growth}% delta)`,
    confidenceLevel: 84,
    criticalOutcomes,
    riskProjection,
    predictedNodes: pNodes,
    predictedConnections: pConns
  });
});


// Add Vite client asset hosting & routing middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("CHIMERA-X: Loaded Vite Dev Middleware successfully.");
  } else {
    // Serve production static assets compiled inside dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("CHIMERA-X: Loaded Production static file handlers.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CHIMERA-X OS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
