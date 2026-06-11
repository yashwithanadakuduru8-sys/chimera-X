import { IntelNode, IntelConnection, TimelineEvent, InvestigationCase } from "./types";

// Sound Synthesizer using Web Audio API for deep immersive sensory feedback
class ForensicAcousticEngine {
  private ctx: AudioContext | null = null;
  private currentHum: OscillatorNode | null = null;
  private currentHumGain: GainNode | null = null;
  private isMuted: boolean = true;

  constructor() {
    // Lazy initialize to avoid browser block on load
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleAmbientMute(mute: boolean) {
    this.isMuted = mute;
    if (this.isMuted) {
      this.stopHum();
    } else {
      this.startHum();
    }
  }

  private startHum() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      if (this.currentHum) return;

      const humOsc = this.ctx.createOscillator();
      const formatGain = this.ctx.createGain();

      humOsc.type = 'sawtooth';
      humOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A hum
      
      // Filter for ambient low-pass hum
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(110, this.ctx.currentTime);
      lowpass.Q.setValueAtTime(4, this.ctx.currentTime);

      formatGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // Extremely subtle

      humOsc.connect(lowpass);
      lowpass.connect(formatGain);
      formatGain.connect(this.ctx.destination);

      humOsc.start();
      
      this.currentHum = humOsc;
      this.currentHumGain = formatGain;
    } catch (e) {
      console.warn("AcousticEngine start hum blocked: ", e);
    }
  }

  private stopHum() {
    if (this.currentHum) {
      try {
        this.currentHum.stop();
        this.currentHum.disconnect();
      } catch (e) {}
      this.currentHum = null;
    }
    if (this.currentHumGain) {
      try {
        this.currentHumGain.disconnect();
      } catch (e) {}
      this.currentHumGain = null;
    }
  }

  public playClickTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.082);
    } catch (e) {}
  }

  public playScanTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.31);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch (e) {}
  }

  public playAlertTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      
      // Oscillate frequency for alert chirp
      osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch (e) {}
  }
}

export const soundEngine = new ForensicAcousticEngine();

export const CASE_PRESETS: InvestigationCase[] = [
  {
    id: "case-01",
    title: "Aegis Ledger Corp & Associated Entities Audit",
    summary: "Comprehensive structure evaluation of offshore ledger registries and outflow clusters connected to Panama transaction pathways.",
    status: "Active",
    dateCreated: "2026-05-12",
    riskIndex: 78,
    evidenceCount: 14,
    nodes: [
      { id: "node-1", label: "Marcus Vance", type: "Individual", riskScore: 84, status: "Active", details: "Primary subject of Aegis Ledger review. Registered hedge fund advisor.", location: "Zurich, CH", alias: "Fund proxy Director", netWorth: "$14.2M" },
      { id: "node-2", label: "Aegis Ledger Corp", type: "Organization", riskScore: 45, status: "Under Observation", details: "Administrative entity handles asset routing structures.", location: "Panama City, PAN" },
      { id: "node-3", label: "Relay Address 182.20.1.9", type: "Server", riskScore: 92, status: "Compromised", details: "Routing address transmitting encrypted data logs and config changes.", location: "Frankfurt, GER" },
      { id: "node-4", label: "Global Trust Cayman", type: "Bank Account", riskScore: 68, status: "Active", details: "Registered brokerage target account routing rapid-wire movements.", location: "Grand Cayman, CAY" },
      { id: "node-5", label: "Proxy Gateway Санкт-Петербург", type: "IP Address", riskScore: 76, status: "Under Observation", details: "Network route handling administrative portal overrides.", location: "Saint Petersburg, RU" },
    ],
    connections: [
      { id: "conn-1", source: "node-1", target: "node-2", type: "Affiliation", weight: 0.9, suspicious: true, value: "Command Authority" },
      { id: "conn-2", source: "node-1", target: "node-4", type: "Transaction", weight: 0.85, suspicious: true, value: "$2.4M Crypto Liquidation", timestamp: "12 Hours Ago" },
      { id: "conn-3", source: "node-2", target: "node-4", type: "Ownership", weight: 0.60, suspicious: false, value: "90% Stakeholder" },
      { id: "conn-4", source: "node-3", target: "node-5", type: "Communication", weight: 0.75, suspicious: true, value: "SSH Encrypted Relay Activity", timestamp: "Live Flow" },
      { id: "conn-5", source: "node-5", target: "node-2", type: "Communication", weight: 0.88, suspicious: true, value: "Admin Portal Access Logs", timestamp: "3 Mins Ago" }
    ],
    timeline: [
      { id: "t-1", timestamp: "2026-06-07 04:12", title: "Administrative SOCKS5 Overrides", description: "Interface logged unusual long-running session originating from remote Санкт-Петербург route.", category: "Incident", riskLevel: "Critical", associatedNodes: ["node-3", "node-5"] },
      { id: "t-2", timestamp: "2026-06-06 21:30", title: "Offshore Wire Cluster Transmitted", description: "Vance authorized high-value transfers to Cayman brokerage account totaling $2,420,000.", category: "Transaction", riskLevel: "Severe", associatedNodes: ["node-1", "node-4"] },
      { id: "t-3", timestamp: "2026-06-05 11:15", title: "Panama Corporate Revision", description: "Panama corporate registries modified control mandates, designating Vance as proxy advisor.", category: "Evidence", riskLevel: "Moderate", associatedNodes: ["node-1", "node-2"] }
    ]
  },
  {
    id: "case-02",
    title: "SCADA Systems Control & credentials leaks",
    summary: "Investigation into critical telemetry exfiltrations and localized administrative contractor network compromises.",
    status: "Classified",
    dateCreated: "2026-04-03",
    riskIndex: 92,
    evidenceCount: 32,
    nodes: [
      { id: "g-node-1", label: "Apex-Industrial SCADA", type: "Server", riskScore: 96, status: "Compromised", details: "Industrial supervisory portal controlling regional substation relays.", location: "Dallas, TX, USA" },
      { id: "g-node-2", label: "Valeri Sidorov", type: "Individual", riskScore: 78, status: "Active", details: "Former software contractor suspected of credential files transfer.", location: "Vienna, AT" },
      { id: "g-node-3", label: "N-Crypt Security Hold", type: "Organization", riskScore: 61, status: "Under Observation", details: "Third-party security service holding infrastructure logs.", location: "Tallinn, EST" },
      { id: "g-node-4", label: "Terminal proxy 15.22.9.22", type: "IP Address", riskScore: 88, status: "Compromised", details: "Active proxy routing remote administrative requests.", location: "Havana, CU" }
    ],
    connections: [
      { id: "g-conn-1", source: "g-node-2", target: "g-node-1", type: "Affiliation", weight: 0.85, suspicious: true, value: "Contractor Routing Root" },
      { id: "g-conn-2", source: "g-node-4", target: "g-node-1", type: "Communication", weight: 0.98, suspicious: true, value: "SCADA Command Access", timestamp: "1 Min Ago" },
      { id: "g-conn-3", source: "g-node-2", target: "g-node-3", type: "Ownership", weight: 0.70, suspicious: true, value: "Sub-account Broker" }
    ],
    timeline: [
      { id: "g-t-1", timestamp: "2026-06-07 09:12", title: "SCADA Mainframe Intrusion Logged", description: "Apex Industrial reported 10 unauthorized credentials logins routing from proxy node.", category: "Incident", riskLevel: "Critical", associatedNodes: ["g-node-1", "g-node-4"] },
      { id: "g-t-2", timestamp: "2026-06-03 14:00", title: "Telemetry Feed Diversion", description: "SCADA telemetry logs verified routing to external archives in Tallinn database.", category: "Intercept", riskLevel: "Severe", associatedNodes: ["g-node-1", "g-node-3"] }
    ]
  },
  {
    id: "case-03",
    title: "Crest Ocean Shippers Maritime Manifest Audit",
    summary: "Audit of container cargo manifests, vessel routes, and registry holdings to detect transport discrepancies.",
    status: "Archived",
    dateCreated: "2026-01-18",
    riskIndex: 44,
    evidenceCount: 9,
    nodes: [
      { id: "o-node-1", label: "Crest Ocean Shippers", type: "Organization", riskScore: 38, status: "Clear", details: "Registered cargo shipping broker corporate office.", location: "Singapore" },
      { id: "o-node-2", label: "Rotterdam Mainframe", type: "Server", riskScore: 50, status: "Under Observation", details: "Physical container tracking mainframe server.", location: "Rotterdam, NL" },
      { id: "o-node-3", label: "Capt. Eric Lind", type: "Individual", riskScore: 64, status: "Under Observation", details: "Merchant marine director of active route cargo vessel.", location: "Aboard Cargo Vessel" }
    ],
    connections: [
      { id: "o-conn-1", source: "o-node-3", target: "o-node-1", type: "Affiliation", weight: 0.90, suspicious: false, value: "Vessel Captain" },
      { id: "o-conn-2", source: "o-node-1", target: "o-node-2", type: "Communication", weight: 0.55, suspicious: false, value: "Manifest Updates" }
    ],
    timeline: [
      { id: "o-t-1", timestamp: "2026-05-19 18:40", title: "Cargo Mass Scale Discrepancy", description: "Rotterdam inspectors mapped 15% cargo mass margin variance over manifest lists.", category: "Evidence", riskLevel: "Moderate", associatedNodes: ["o-node-2", "o-node-1"] }
    ]
  }
];

// Helper to generate coordinates on a pseudo-3D globe
export function projectSphere(lat: number, lng: number, radius: number): { x: number; y: number; z: number } {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}
