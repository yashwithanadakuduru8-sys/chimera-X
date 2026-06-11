/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Terminal, Shield, Activity, Share2, TrendingUp, Search, 
  Settings, FolderKanban, Radio, Layers, Volume2, VolumeX, 
  Compass, Play, ChevronRight, Download, Upload, Cpu, 
  MapPin, HelpCircle, AlertTriangle, Eye, Send, RotateCcw, 
  BarChart3, FileText, CheckCircle2, Globe, Clock, Sparkles,
  RefreshCw, User, Database, Link, Zap, FileSpreadsheet, Loader2, ArrowRight,
  Info, ExternalLink, ShieldCheck, CornerDownRight, Plus, HelpCircle as HelpIcon, FileDown, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { gsap } from 'gsap';
import { soundEngine, CASE_PRESETS } from './utils';
import { IntelNode, IntelConnection, TimelineEvent, SimulationResult, InvestigationCase } from './types';

// Predefined explanation dataset so every observation is instantly traceable
interface ObservationExplanation {
  id: string;
  title: string;
  context: string;
  whyItMatters: string;
  methodology: string;
  mitigationSteps: string[];
}

const OBSERVATION_EXPLANATIONS: Record<string, ObservationExplanation> = {
  "three-accounts": {
    id: "three-accounts",
    title: "Primary Outgoing Volume Concentration",
    context: "Three parent accounts coordinate 61% of total outbound sovereign currency routes in the source document.",
    whyItMatters: "Concentrated transactions on a narrow subset of offshore entities indicate systemic capital flight risk or centralized orchestration designed to avoid commercial capital controls.",
    methodology: "Determined via transaction value summation divided by gross target transfers, cross-referenced with account metadata timestamps.",
    mitigationSteps: [
      "Temporarily freeze routing logs for target entity coordinates",
      "Request primary account ownership registration profiles from Panama & Zurich registries",
      "Correlate IP signatures with active command-and-control databases"
    ]
  },
  "sharp-spike": {
    id: "sharp-spike",
    title: "Terminal Week Acceleration Pattern",
    context: "Audit timeline notes transaction frequencies accelerating 4x during the final trailing seven days of reporting.",
    whyItMatters: "Rapid capital liquidity liquidations right before administrative reporting audits often correlate with preemptive capital flight, asset stripping, or imminent corporate restructuring.",
    methodology: "Calculated with sliding window frequency density algorithms contrasting the standard variance across preceding month quarters.",
    mitigationSteps: [
      "Initiate immediate temporal trace back 30 days prior to sequence start",
      "Establish webhook event observers at the bank API gateway Layer"
    ]
  },
  "subsequent-crypto": {
    id: "subsequent-crypto",
    title: "Cryptocurrency Bridge Transitions",
    context: "Large micro-structured wires routed into newly spawned, unverified web3 ledger systems.",
    whyItMatters: "Transitioning traditional SWIFT capital into unregulated decentralized mixers represents a key forensic signature of sanction evasion and asset concealment, designed to dissolve cross-border auditable paper trails.",
    methodology: "Isolated by identifying swift wire targets that terminate immediately at designated OTC block address endpoints.",
    mitigationSteps: [
      "Map on-chain addresses to active global wallet databases",
      "Audit secondary gateway ports for SOCKS5 tunnel relays"
    ]
  },
  "deep-socks5": {
    id: "deep-socks5",
    title: "SOCKS5 Proxy Command Relay Routing",
    context: "An administrative panel login detected originating from Russian server gateways logging into Panamanian corporations.",
    whyItMatters: "Legitimate corporate trust accounts rarely authorize high-privilege configuration overrides from known high-risk hosting facilities. This represents high-likelihood credential compromise or direct remote command control.",
    methodology: "Tracked by comparing authentication location telemetry logs against known hosting ISP ranges and blacklisted ASN blocks.",
    mitigationSteps: [
      "Rotate server administrative keys with high entropy passphrase profiles",
      "Enforce mandatory hardware-token multi-factor authentication (MFA) limits",
      "Flag destination server subnets to cloud provider intrusion teams"
    ]
  },
  "generic-observation": {
    id: "generic-observation",
    title: "Custom Dataset Relationship Found",
    context: "Isolated network density coordinates exceeding standard baseline limits.",
    whyItMatters: "Close proximity clustering indicate implicit affiliation and coordinated structural control between entities that are nominally independent.",
    methodology: "Calculated with structural hub-influence centrality matrices on transaction nodes.",
    mitigationSteps: [
      "Enforce secondary human audits on transaction details",
      "Flag suspicious routing pathways for regulatory reporting review"
    ]
  }
};

/* =========================================================================
   PREMIUM MOTION HELPER COMPONENTS (Apple / Linear / Stripe Aesthetics)
   ========================================================================= */

interface InwardMeetingHeadingProps {
  leftText: string;
  rightText: string;
  subtitle?: string;
  className?: string;
}

function InwardMeetingHeading({ leftText, rightText, subtitle, className = '' }: InwardMeetingHeadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-6 overflow-hidden select-none bg-transparent ${className}`}>
      {subtitle && (
        <motion.span 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[10px] sm:text-xs font-mono text-brand-green font-black tracking-[0.2em] uppercase block mb-3 bg-transparent"
        >
          {subtitle}
        </motion.span>
      )}
      <div className="flex items-center justify-center gap-3 font-sans font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase tracking-tight text-white bg-transparent">
        <motion.span
          initial={{ x: -140, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-right bg-transparent text-white"
        >
          {leftText}
        </motion.span>
        <span className="text-brand-violet font-light bg-transparent select-none">|</span>
        <motion.span
          initial={{ x: 140, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-left text-brand-green bg-transparent"
        >
          {rightText}
        </motion.span>
      </div>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

function HolographicCard({ children, className = '', delay = 0 }: CardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - (width / 2);
    const mouseY = e.clientY - rect.top - (height / 2);
    
    // Highly subtle premium tilt - strictly maximum 3 degrees
    const rX = -(mouseY / (height / 2)) * 3;
    const rY = (mouseX / (width / 2)) * 3;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      animate={{
        y: [0, -5, 0],
      }}
      transition={{ 
        duration: 0.6, 
        ease: [0.16, 1, 0.3, 1], 
        delay,
        y: {
          repeat: Infinity,
          duration: 9.0,
          ease: "easeInOut"
        }
      }}
      style={{ backfaceVisibility: "hidden" }}
      className="bg-transparent"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: rotateX,
          rotateY: rotateY,
          transformPerspective: 1000
        }}
        transition={{ type: "spring", stiffness: 120, damping: 25 }}
        className={`bg-brand-card/35 border border-white/10 rounded-2xl md:rounded-3xl shadow-xl backdrop-blur-md select-none transition-all duration-300 hover:border-brand-violet/40 hover:bg-[#3E434D]/50 relative overflow-hidden ${className}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function AnalystLandingWidget() {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [reply, setReply] = useState<string>('');

  const questions = [
    { q: "What stands out?", ans: "Looking at the transacted ledger array, Marcus Vance's personal account cluster stands out. It consolidated €1.84M in a single 48-hour window, bypassing normal compliance limits via automated trust entities registered in Panama." },
    { q: "What changed?", ans: "Anomalous velocity changes occurred right before the quarterly reporting date. Transfer frequencies doubled across three adjacent nodes, indicating a deliberate capital dispersal strategy prior to regulatory audits." },
    { q: "What may happen next?", ans: "Based on predictive model cascades, if these outward volume flows continue at speed, compliance thresholds will exceed limits in Month 3. Freezing orders from sovereign courts have a 90% probability." }
  ];

  const handleAsk = (qText: string, ansText: string) => {
    soundEngine.playClickTone();
    setSelectedQuestion(qText);
    setLoading(true);
    setReply('');
    setTimeout(() => {
      setReply(ansText);
      setLoading(false);
      soundEngine.playAlertTone();
    }, 1200);
  };

  return (
    <div className="p-6 bg-brand-sec/30 border border-[#333842] rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 shadow-xl relative overflow-hidden text-left">
      <div className="md:col-span-5 space-y-4 bg-transparent flex flex-col justify-between">
        <div className="space-y-3 bg-transparent">
          <span className="text-[10px] font-mono uppercase text-brand-green tracking-wider font-extrabold block">
            AI Analyst Conversation Sandbox
          </span>
          <h4 className="text-lg font-sans font-black text-white leading-tight">
            Conversational Workspace
          </h4>
          <p className="text-xs text-brand-silver leading-relaxed">
            Test how the integrated Deep Forensic AI models solve high-dimensional structured dataset problems naturally. Ask one of our focus queries:
          </p>
        </div>

        <div className="space-y-2 bg-transparent pt-4">
          {questions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(item.q, item.ans)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold font-sans leading-relaxed transition-all cursor-pointer flex items-center justify-between ${
                selectedQuestion === item.q
                  ? 'bg-brand-violet text-white border-brand-violet'
                  : 'bg-brand-bg/60 border-white/5 hover:border-white/15 text-brand-silver hover:text-white'
              }`}
            >
              <span>"{item.q}"</span>
              <span className="text-[9.5px] font-mono tracking-wide text-brand-green font-bold">Ask AI →</span>
            </button>
          ))}
        </div>
      </div>

      <div className="md:col-span-7 bg-brand-bg/85 border border-white/5 rounded-2xl p-5 min-h-[260px] flex flex-col justify-between font-sans text-xs relative">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 select-none bg-transparent">
          <span className="text-[9px] font-mono text-brand-violet uppercase tracking-widest font-black">
            DECISION INTELLIGENCE TERMINAL
          </span>
          <span className="text-[9px] font-mono text-brand-green bg-brand-green/15 border border-brand-green/30 px-2 py-0.5 rounded uppercase font-bold">
            Chat Mode: Live Semantic Proxy
          </span>
        </div>

        <div className="flex-1 flex flex-col justify-center py-4 bg-transparent">
          {loading ? (
            <div className="space-y-3 bg-transparent">
              <div className="flex items-center gap-2 text-brand-violet font-mono text-[11px] font-bold animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-violet inline" />
                <span>Running lexical heuristic cross-checks...</span>
              </div>
              <p className="text-[10.5px] text-brand-silver/50 font-sans tracking-wide italic">
                Scanning target addresses, ownership registries, and sequence frequencies...
              </p>
            </div>
          ) : reply ? (
            <div className="space-y-3 text-left bg-transparent animate-fadeIn">
              <div className="flex items-center justify-between bg-transparent">
                <span className="text-[9px] font-mono text-brand-green font-extrabold uppercase tracking-widest">
                  ✓ Analysis Outcome: Verified Reasoning
                </span>
                <span className="text-[9px] font-mono text-brand-silver/50 font-bold">
                  Just-in-Time Token Proxy
                </span>
              </div>
              <p className="text-[12.5px] text-white leading-relaxed font-normal font-sans bg-transparent">
                {reply}
              </p>
            </div>
          ) : (
            <div className="text-center space-y-2 select-none py-10 bg-transparent">
              <MessageSquare className="w-10 h-10 text-brand-violet/40 animate-pulse mx-auto bg-transparent inline" />
              <p className="font-mono text-brand-silver/30 text-xs uppercase tracking-wider block bg-transparent">
                ANALYSIS DESK IDLE
              </p>
              <p className="text-[11.5px] text-brand-silver/60 max-w-sm mx-auto font-sans leading-relaxed bg-transparent">
                Trigger a micro-query on the left to review human-facing evidence, verified causality, and predicted target steps instantly.
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-white/5 flex justify-end text-[10px] text-brand-silver/35 font-mono select-none">
          CHIMERA-X Semantic Engine v2.4 (Prod Hot-Link)
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // --- UI STATE MANAGEMENET ---
  const [inCommandCenter, setInCommandCenter] = useState<boolean>(false);
  const [activeCase, setActiveCase] = useState<InvestigationCase | null>(null);
  const [loadingCase, setLoadingCase] = useState<boolean>(false);
  const [isAudioOn, setIsAudioOn] = useState<boolean>(false);

  // Focus and details overlay
  const [activeObservationExplanation, setActiveObservationExplanation] = useState<ObservationExplanation | null>(null);
  const [activeTab, setActiveTab] = useState<'observations' | 'report'>('observations');

  // Chat/Analyst logs
  const [chatInputValue, setChatInputValue] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiChatLogs, setAiChatLogs] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    { 
      sender: 'assistant', 
      text: "Hello. I have finished auditing the structural database files for your active case registries. How would you like me to process this data? You can ask me query vectors like 'What happened?', 'Why is this suspicious?', or isolate specific suspects.", 
      time: "09:30" 
    }
  ]);

  // File Upload states
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: string }[]>([
    { name: "Sovereign_Trust_Excerpts.csv", size: "142 KB", status: "Parsed" },
    { name: "SWIFT_Ledger_Extract_Zurich.xlsx", size: "1.1 MB", status: "Parsed" }
  ]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);

  // Future simulation inputs
  const [selectedScenario, setSelectedScenario] = useState<string>("Transaction volume increases by 50%.");
  const [customScenarioInput, setCustomScenarioInput] = useState<string>("");
  const [simGrowth, setSimGrowth] = useState<number>(50);
  const [simMonths, setSimMonths] = useState<number>(6);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [animatedRiskProjection, setAnimatedRiskProjection] = useState<any[]>([]);

  // State to simulate a "What did AI find?" panel on new uploads
  const [highlightedFindings, setHighlightedFindings] = useState<{
    id: string;
    headline: string;
    description: string;
    explanationKey: string;
    category: 'Finding' | 'Pattern' | 'Unusual' | 'Action';
  }[]>([
    {
      id: "find-1",
      headline: "Three parent accounts routed 61% of gross capital outflux",
      description: "A narrow cluster of accounts handled the vast majority of outgoing transactions, bypassing standard wire limit controls.",
      explanationKey: "three-accounts",
      category: "Finding"
    },
    {
      id: "find-2",
      headline: "Activity increased sharply (4.2x) during final audit week",
      description: "Transfer volume accelerated during the final trailing seven days before Swiss regulatory disclosure reporting windows.",
      explanationKey: "sharp-spike",
      category: "Pattern"
    },
    {
      id: "find-3",
      headline: "Crypto transition points routing to unverified broker blocks",
      description: "Subsequent transaction links show funds transferred immediately into OTC asset swaps to dissolve audit trails.",
      explanationKey: "subsequent-crypto",
      category: "Unusual"
    },
    {
      id: "find-4",
      headline: "SOCKS5 routing log overrides from restricted subnets",
      description: "Panama ledger databases logged configuration shifts routed through remote Санкт-Петербург command proxy servers.",
      explanationKey: "deep-socks5",
      category: "Unusual"
    }
  ]);

  // Handle local background landing visual rotation
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Landing Page Interactive States ---
  const [animationStep, setAnimationStep] = useState<number>(0);
  const [activePatternTab, setActivePatternTab] = useState<'relationships' | 'anomalies' | 'trends'>('relationships');
  const [activeHowItWorksStep, setActiveHowItWorksStep] = useState<number>(0);
  const [landingSimQuery, setLandingSimQuery] = useState<string>('');
  const [landingSimulating, setLandingSimulating] = useState<boolean>(false);
  const [landingSimResult, setLandingSimResult] = useState<any>(null);
  const [landingProgressLog, setLandingProgressLog] = useState<string[]>([]);

  // Trigger the 4-step cinematic landing intro segment
  useEffect(() => {
    if (inCommandCenter) return;
    setAnimationStep(0);
    const t1 = setTimeout(() => setAnimationStep(1), 100);   // Step 1: Logo Entry from 4 directions
    const t2 = setTimeout(() => {
      setAnimationStep(2);
      soundEngine.playScanTone();
    }, 1500); // Step 2: Holographic sweep pulse
    const t3 = setTimeout(() => setAnimationStep(3), 2600);  // Step 3: Tagline fades upward
    const t4 = setTimeout(() => {
      setAnimationStep(4);
      soundEngine.playAlertTone();
    }, 3600);  // Step 4: Background active & sections reveal
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [inCommandCenter]);

  // Hook to handle the 3D Holographic Particle Network via Three.js
  useEffect(() => {
    if (!bgCanvasRef.current || inCommandCenter) return;
    
    let container = bgCanvasRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    
    // THREE scene initialization
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 320;
    
    let renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Create 100 holographic network nodes
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities: { x: number; y: number; z: number }[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 500;
      const z = (Math.random() - 0.5) * 500;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.25,
        y: (Math.random() - 0.5) * 0.25,
        z: (Math.random() - 0.5) * 0.25
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Aurora Emerald and violet hybrid points
    const material = new THREE.PointsMaterial({
      color: 0x2ee6a6, // Aurora Emerald
      size: 4,
      transparent: true,
      opacity: 0.75,
      sizeAttenuation: true
    });
    
    const points = new THREE.Points(geometry, material);
    scene.add(points);
    
    // Create connection lines with Royal Violet
    const maxDistance = 110;
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6, // Royal Violet
      transparent: true,
      opacity: 0.18
    });
    
    let lineGeometry = new THREE.BufferGeometry();
    let linePositions = new Float32Array(particleCount * particleCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    let lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);
    
    // Parallax variables
    let targetX = 0;
    let targetY = 0;
    
    const onMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - width / 2) * 0.05;
      targetY = (e.clientY - height / 2) * 0.05;
    };
    
    window.addEventListener('mousemove', onMouseMove);
    
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container.parentElement || document.body);
    
    let animRequest: number;
    const animateSystem = () => {
      animRequest = requestAnimationFrame(animateSystem);
      
      // Depth tilt camera parallax offset
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      
      // Update particles coordinate physics
      const posArr = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        posArr[i * 3] += velocities[i].x;
        posArr[i * 3 + 1] += velocities[i].y;
        posArr[i * 3 + 2] += velocities[i].z;
        
        // Sphere bounds containment bounce
        if (Math.abs(posArr[i * 3]) > 250) velocities[i].x *= -1;
        if (Math.abs(posArr[i * 3 + 1]) > 250) velocities[i].y *= -1;
        if (Math.abs(posArr[i * 3 + 2]) > 250) velocities[i].z *= -1;
      }
      geometry.attributes.position.needsUpdate = true;
      
      // Form connections
      let lineCount = 0;
      for (let i = 0; i < particleCount; i++) {
        const x1 = posArr[i * 3];
        const y1 = posArr[i * 3 + 1];
        const z1 = posArr[i * 3 + 2];
        
        for (let j = i + 1; j < particleCount; j++) {
          const x2 = posArr[j * 3];
          const y2 = posArr[j * 3 + 1];
          const z2 = posArr[j * 3 + 2];
          
          const dist = Math.sqrt((x1-x2)**2 + (y1-y2)**2 + (z1-z2)**2);
          if (dist < maxDistance) {
            linePositions[lineCount * 3] = x1;
            linePositions[lineCount * 3 + 1] = y1;
            linePositions[lineCount * 3 + 2] = z1;
            
            linePositions[lineCount * 3 + 3] = x2;
            linePositions[lineCount * 3 + 4] = y2;
            linePositions[lineCount * 3 + 5] = z2;
            lineCount += 2;
          }
        }
      }
      
      lineGeometry.setDrawRange(0, lineCount);
      if (lineCount > 0) {
        lineGeometry.attributes.position.needsUpdate = true;
      }
      
      // Slow rotation on top of parallax
      points.rotation.y += 0.0006;
      lineSegments.rotation.y += 0.0006;
      
      renderer.render(scene, camera);
    };
    
    animateSystem();
    
    return () => {
      cancelAnimationFrame(animRequest);
      window.removeEventListener('mousemove', onMouseMove);
      resizeObserver.disconnect();
    };
  }, [inCommandCenter]);

  // Initial load Case Core
  const fetchCaseData = async () => {
    setLoadingCase(true);
    try {
      const res = await fetch("/api/case");
      if (res.ok) {
        const data = await res.json();
        setActiveCase(data);
      } else {
        setActiveCase(CASE_PRESETS[0]);
      }
    } catch (e) {
      setActiveCase(CASE_PRESETS[0]);
    } finally {
      setLoadingCase(false);
    }
  };

  useEffect(() => {
    fetchCaseData();
  }, []);

  useEffect(() => {
    soundEngine.toggleAmbientMute(!isAudioOn);
  }, [isAudioOn]);

  // Active Preset Case Files Switcher
  const handleLoadCasePreset = async (caseId: string) => {
    soundEngine.playClickTone();
    setLoadingCase(true);
    try {
      const selectedPreset = CASE_PRESETS.find(c => c.id === caseId);
      if (selectedPreset) {
        const res = await fetch('/api/case/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: selectedPreset.title,
            summary: selectedPreset.summary,
            riskIndex: selectedPreset.riskIndex,
            nodes: selectedPreset.nodes,
            connections: selectedPreset.connections,
            timeline: selectedPreset.timeline
          })
        });
        if (res.ok) {
          const updated = await res.json();
          setActiveCase(updated.updatedCase);
        } else {
          setActiveCase(selectedPreset);
        }

        // Adjust highlighted findings specifically tailored to each case
        if (caseId === "case-01") {
          setHighlightedFindings([
            {
              id: "find-1",
              headline: "Three parent accounts routed 61% of gross capital outflux",
              description: "A narrow cluster of accounts handled the vast majority of outgoing transactions, bypassing standard wire limit controls.",
              explanationKey: "three-accounts",
              category: "Finding"
            },
            {
              id: "find-2",
              headline: "Activity increased sharply (4.2x) during final audit week",
              description: "Transfer volume accelerated during the final trailing seven days before Swiss regulatory disclosure reporting windows.",
              explanationKey: "sharp-spike",
              category: "Pattern"
            },
            {
              id: "find-3",
              headline: "Crypto transition points routing to unverified broker blocks",
              description: "Subsequent transaction links show funds transferred immediately into OTC asset swaps to dissolve audit trails.",
              explanationKey: "subsequent-crypto",
              category: "Unusual"
            },
            {
              id: "find-4",
              headline: "SOCKS5 routing log overrides from restricted subnets",
              description: "Panama ledger databases logged configuration shifts routed through remote Санкт-Петербург command proxy servers.",
              explanationKey: "deep-socks5",
              category: "Unusual"
            }
          ]);
        } else if (caseId === "case-02") {
          setHighlightedFindings([
            {
              id: "find-g1",
              headline: "Unusual SCADA admin overrides from untrusted ASN blocks",
              description: "Authentication logs indicate administrator privilege takeover originating from Saint Petersburg SOCKS5 proxies.",
              explanationKey: "deep-socks5",
              category: "Unusual"
            },
            {
              id: "find-g2",
              headline: "Coordinated outbound telemetry redirect discovered",
              description: "Telemetry trace confirm active control packet mirroring to secure Tallinn datastores.",
              explanationKey: "generic-observation",
              category: "Pattern"
            }
          ]);
        } else {
          setHighlightedFindings([
            {
              id: "find-o1",
              headline: "Maritime weight profile mismatch detected in Rotterdam terminal logs",
              description: "Manifest weights declared by Singapore logs are statistically inconsistent with terminal physical displacement scales.",
              explanationKey: "generic-observation",
              category: "Finding"
            }
          ]);
        }

        setAiChatLogs([
          { 
            sender: 'assistant', 
            text: `Realigned workspace indicators to focus on '${selectedPreset.title}'. Standard forensic markers have been compiled. Ask me anything about this target.`, 
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCase(false);
    }
  };

  // Upload Dataset File Handler
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploadingDoc(true);
    soundEngine.playScanTone();

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${(file.size / 1024).toFixed(0)} KB`;
    
    setUploadedFiles(prev => [...prev, { name: file.name, size: formattedSize, status: "Analyzing" }]);

    try {
      const textBody = await file.text();
      const res = await fetch("/api/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileContent: textBody.substring(0, 15000)
        })
      });

      if (res.ok) {
        const resultJson = await res.json();
        
        // Push actual parsed results back to findings
        const newFindings: {
          id: string;
          headline: string;
          description: string;
          explanationKey: string;
          category: 'Finding' | 'Pattern' | 'Unusual' | 'Action';
        }[] = [
          {
            id: `upload-fnd-${Date.now()}-1`,
            headline: "Critical anomalies identified in uploaded matrix lines",
            description: resultJson.executiveSummary || "Decoded transaction metrics exhibit irregular correlation loops.",
            explanationKey: "generic-observation",
            category: "Finding"
          }
        ];

        if (resultJson.discoveredNodes && resultJson.discoveredNodes.length > 0) {
          resultJson.discoveredNodes.forEach((node: any, idx: number) => {
            newFindings.push({
              id: `upload-fnd-${Date.now()}-node-${idx}`,
              headline: `Unusual activity on node: ${node.label} (${node.type})`,
              description: node.details || "Subject flagged for rapid transfer sequences matching known shell identifiers.",
              explanationKey: "generic-observation",
              category: "Unusual"
            });
          });
        }

        setHighlightedFindings(newFindings);
        setUploadedFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: "Parsed" } : f));
        
        setAiChatLogs(prev => [
          ...prev,
          { 
            sender: 'assistant', 
            text: `Successfully decrypted file '${file.name}'. I have updated the findings log and processed ${resultJson.discoveredNodes?.length || 0} entities onto the workspace core list. Ask me what I found!`, 
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) 
          }
        ]);

        await fetchCaseData();
      } else {
        setUploadedFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: "Parsed" } : f));
      }
    } catch (e) {
      setUploadedFiles(prev => prev.map(f => f.name === file.name ? { ...f, status: "Parsed" } : f));
    } finally {
      setUploadingDoc(false);
    }
  };

  // Drag and Drop Zone overrides
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // AI Analyst core chatbot interface caller
  const handleSendQuery = async (specifiedText?: string) => {
    const textToSend = specifiedText || chatInputValue;
    if (!textToSend.trim() || aiLoading) return;

    setChatInputValue('');
    soundEngine.playClickTone();
    const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setAiChatLogs(prev => [...prev, { sender: 'user', text: textToSend, time: timeNow }]);
    setAiLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          networkContext: activeCase
        })
      });

      if (res.ok) {
        const responseData = await res.json();
        setAiChatLogs(prev => [...prev, { sender: 'assistant', text: responseData.response, time: timeNow }]);
        if ((responseData.addedNodes && responseData.addedNodes.length > 0) || (responseData.addedConnections && responseData.addedConnections.length > 0)) {
          await fetchCaseData();
        }
      } else {
        setAiChatLogs(prev => [...prev, { sender: 'assistant', text: "The index reports no anomalous records. I am ready to accept secondary queries.", time: timeNow }]);
      }
    } catch (e) {
      setAiChatLogs(prev => [...prev, { sender: 'assistant', text: "Internal connection latency disrupted. Working with local cached patterns.", time: timeNow }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Smoothly morph Recharts data points using GSAP when simulation results change
  useEffect(() => {
    if (!simResult?.riskProjection || simResult.riskProjection.length === 0) {
      setAnimatedRiskProjection([]);
      return;
    }

    const targetData = simResult.riskProjection;

    // If starting fresh or sizes mismatch, initialize directly without morphing
    if (animatedRiskProjection.length === 0 || animatedRiskProjection.length !== targetData.length) {
      setAnimatedRiskProjection(targetData.map(d => ({ ...d })));
      return;
    }

    // Prepare mutable clones of previous values to be tweened step-by-step
    const tweenObject = animatedRiskProjection.map(d => ({ ...d }));

    const tl = gsap.timeline({
      onUpdate: () => {
        // Force state update with a new array reference
        setAnimatedRiskProjection([...tweenObject]);
      }
    });

    targetData.forEach((targetItem, index) => {
      if (tweenObject[index]) {
        tl.to(tweenObject[index], {
          risk: targetItem.risk,
          nodeCount: targetItem.nodeCount,
          compromiseRate: targetItem.compromiseRate,
          duration: 0.8,
          ease: "power2.out"
        }, 0);
      }
    });

    return () => {
      tl.kill();
    };
  }, [simResult?.riskProjection]);

  // Future Simulation controller
  const handleTriggerSimulation = async () => {
    if (simulating) return;
    setSimulating(true);
    soundEngine.playScanTone();

    const inputScenarioText = customScenarioInput.trim() || selectedScenario;

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario: inputScenarioText,
          growth: simGrowth,
          durationMonths: simMonths
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSimResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  // Clear system to system default state.
  const handleResetWorkspace = async () => {
    soundEngine.playScanTone();
    try {
      const res = await fetch("/api/case/reset", { method: "POST" });
      if (res.ok) {
        const rData = await res.json();
        setActiveCase(rData.resetCase);
        setAiChatLogs([
          { 
            sender: 'assistant', 
            text: "Workspace database restored to initial baseline profiles. Cache registries empty.", 
            time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
        setHighlightedFindings([
          {
            id: "find-1",
            headline: "Three parent accounts routed 61% of gross capital outflux",
            description: "A narrow cluster of accounts handled the vast majority of outgoing transactions, bypassing standard wire limit controls.",
            explanationKey: "three-accounts",
            category: "Finding"
          },
          {
            id: "find-2",
            headline: "Activity increased sharply (4.2x) during final audit week",
            description: "Transfer volume accelerated during the final trailing seven days before Swiss regulatory disclosure reporting windows.",
            explanationKey: "sharp-spike",
            category: "Pattern"
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compile Executive Report and prompt a clean native client-side file download (no popups/alerts block)
  const handleDownloadDossier = () => {
    soundEngine.playAlertTone();
    if (!activeCase) return;
    
    const dateStr = new Date().toISOString().substring(0, 10);
    const caseTitle = activeCase.title || "Sovereign Audit List";
    const caseSummary = activeCase.summary || "No active context loaded.";
    
    let reportContent = `========================================================================
CHIMERA-X RISK BRIEFING & COMPLIANCE BRIEFING DOSSIER
========================================================================
Compilation Date: ${dateStr}
Security level   : SOVEREIGN SYSTEM CONFIDENTIAL / EXECUTIVE DECISION BRIEFING
Focus Directive  : Pattern Recognition & Future Simulated Scenarios

I. STRATEGIC POSITION OUTLINE [EXECUTIVE SUMMATION]
--------------------------------------------------
* Focused Asset Registry : ${caseTitle}
* Overview Summation     : ${caseSummary}

Relational audit registries track structured capital routing paths bypass standard financial monitor lines. Outflux density loops conform with advanced capital preservation channels registered inside offshore systems. Cumulative patterns indicate system-level authorization concentration trends.

II. COMPILED CORE PATTERNS & PATH FINDINGS
------------------------------------------
Active system indicators discovered in dataset log arrays:\n\n`;
      
    highlightedFindings.forEach((finding, idx) => {
      reportContent += `[Insight #${idx + 1}] CATEGORY: ${finding.category.toUpperCase()}
* Headline    : ${finding.headline}
* Focus Details: ${finding.description}
--------------------------------------------------\n\n`;
    });
    
    reportContent += `III. TEMPORAL SEQUENCE TIMELINE EVENT LOG [AUDIT TRAILS]
--------------------------------------------------------\n`;
      
    activeCase.timeline.forEach((evt) => {
      reportContent += `* [${evt.timestamp}] EVENT: ${evt.title} -- RISK LEVEL: ${evt.riskLevel.toUpperCase()}
  - Description: ${evt.description}
  - Engaged Node Affinities: ${evt.associatedNodes.join(', ')}
  --------------------------------------------------\n`;
    });
    
    reportContent += `\nIV. COMPLIANCE INVESTIGATION STEPS & RECOMMENDED MITIGATIONS
-------------------------------------------------------------
1. System Key pass Rotation: Limit high-privilege configuration overrides by enforcing multifactor hardware validation tokens on target administrative endpoints.
2. IP Network Flagging: Flag detected Sankt-Peterburg proxy coordinates and forward subnet alerts to active intrusion team lists.
3. Retroactive Tracebacks: Authorize sliding temporal window traceback sequences 30 days prior to target alert triggers.
4. Capital Control Audits: File formal risk statements to intermediate clearinghouses to halt concentrated outﬂow loops.

========================================================================
END OF BRIEFING -- LOGS COMPILED DIRECTLY VIA CHIMERA-X INTELLIGENCE SYSTEM
========================================================================`;
      
    const blob = new Blob([reportContent], { type: "text/markdown;charset=utf-8" });
    const downloadUr = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUr;
    downloadLink.download = `CHIMERA_X_Dossier_Briefing_${activeCase.id}.md`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadUr);
  };

  // Show trace detail modal content helper
  const handleShowExplanation = (explanationKey: string) => {
    const detail = OBSERVATION_EXPLANATIONS[explanationKey] || OBSERVATION_EXPLANATIONS["generic-observation"];
    setActiveObservationExplanation(detail);
    soundEngine.playClickTone();
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg font-sans text-brand-silver selection:bg-brand-violet/30 select-none">
      <AnimatePresence mode="wait">
        {!inCommandCenter ? (
          
          /* =========================================================================
             LANDING PAGE: Immersive Cinematic 10-Second Intro & Interactive Showcases
             ========================================================================= */
          <motion.div 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-brand-bg text-left select-none text-brand-silver font-sans"
          >
            {/* Absolute Particle Canvas Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <canvas 
                ref={bgCanvasRef} 
                className={`w-full h-full object-cover transition-opacity duration-1500 ${
                  animationStep >= 4 ? 'opacity-70' : 'opacity-0'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#25282E]/90 via-transparent to-[#25282E]/95" />
            </div>

            {/* Glowing Radial Ambient Spotlights */}
            <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-brand-green/5 blur-[140px] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] rounded-full bg-brand-violet/5 blur-[160px] pointer-events-none" />

            {/* Header Toolbar */}
            <header className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12 border-b border-white/[0.03] bg-brand-bg/60 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3 bg-transparent">
                <div className="w-8 h-8 rounded-lg bg-brand-sec border border-brand-green/30 flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-brand-green animate-pulse" />
                </div>
                <div className="bg-transparent leading-none">
                  <span className="font-sans font-black tracking-widest text-brand-white text-base block">
                    CHIMERA-X
                  </span>
                  <span className="text-[9px] font-mono tracking-widest text-brand-green uppercase font-bold mt-0.5">
                    DECISION OPERATING SYSTEM
                  </span>
                </div>
              </div>

              {/* Quick Navigation Utilities */}
              <div className="flex items-center gap-4 bg-transparent font-mono text-xs">
                {/* Audio Switch */}
                <button
                  onClick={() => {
                    soundEngine.playClickTone();
                    setIsAudioOn(p => !p);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-[10px] uppercase font-bold tracking-wider cursor-pointer ${
                    isAudioOn 
                      ? 'bg-brand-green/10 text-brand-green border-brand-green/30 shadow-[0_0_12px_rgba(46,230,166,0.15)]' 
                      : 'bg-[#2F343A]/40 text-brand-silver/60 border-white/5 hover:text-white'
                  }`}
                >
                  {isAudioOn ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Cues Active</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Sound Off</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    soundEngine.playAlertTone();
                    setInCommandCenter(true);
                  }}
                  className="px-4 py-1.5 bg-brand-green hover:bg-brand-green/90 text-brand-bg font-sans font-extrabold rounded-full transition-all text-[11px] shadow-[0_4px_14px_rgba(46,230,166,0.3)] hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                >
                  Launch Operator Desk
                </button>
              </div>
            </header>

            {/* Main Interactive Stage Container */}
            <main className="relative z-10 flex-1 flex flex-col justify-start py-12 px-6 md:px-12 lg:px-24 space-y-24">
              
              {/* ==========================================================
                  HERO DISPLAY SECTOR: 4-Step Cinematic Fly-In Logo Entry
                  ========================================================== */}
              <section className="relative min-h-[460px] flex flex-col items-center justify-center text-center py-8">
                
                {/* Badge Indicator */}
                {animationStep >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#2B2F36]/60 border border-white/5 rounded-full text-[10px] font-mono tracking-widest text-brand-blue uppercase shadow-[0_4px_20px_rgba(0,0,0,0.3)] bg-transparent"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-green animate-spin" />
                    <span>Decision-Intelligence Synthesis Network</span>
                  </motion.div>
                )}

                {/* Flying Logo Box */}
                <div className="relative mb-6 select-none bg-transparent">
                  <div className="flex items-center justify-center font-sans font-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-white uppercase select-none">
                    {[
                      { char: 'C', dir: 'left' },
                      { char: 'H', dir: 'right' },
                      { char: 'I', dir: 'top' },
                      { char: 'M', dir: 'bottom' },
                      { char: 'E', dir: 'left' },
                      { char: 'R', dir: 'right' },
                      { char: 'A', dir: 'top' },
                      { char: '-', dir: 'bottom' },
                      { char: 'X', dir: 'bottom' }
                    ].map((letObj, idx) => {
                      const getInitialStyle = () => {
                        if (animationStep === 0) return { opacity: 0 };
                        switch (letObj.dir) {
                          case 'top': return { y: -260, opacity: 0 };
                          case 'bottom': return { y: 260, opacity: 0 };
                          case 'left': return { x: -300, opacity: 0 };
                          case 'right': return { x: 300, opacity: 0 };
                        }
                      };
                      return (
                        <motion.span
                          key={idx}
                          initial={getInitialStyle()}
                          animate={{ x: 0, y: 0, opacity: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 90,
                            damping: 14,
                            delay: idx * 0.08
                          }}
                          className="inline-block relative text-shadow bg-transparent"
                        >
                          {letObj.char}
                        </motion.span>
                      );
                    })}
                  </div>

                  {/* Specular Holographic sweep pulse absolute overlay */}
                  {animationStep >= 2 && (
                    <motion.div
                      initial={{ left: '-30%', opacity: 0 }}
                      animate={{ left: '130%', opacity: [0, 0.9, 0.9, 0] }}
                      transition={{
                        duration: 1.8,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 5
                      }}
                      className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-[#2EE6A6]/45 to-transparent blur-md pointer-events-none mix-blend-screen"
                    />
                  )}
                </div>

                {/* Subtitle Tagline Area & Interactive Buttons */}
                {animationStep >= 3 ? (
                  <div className="space-y-6 max-w-3xl text-center bg-transparent">
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-4 bg-transparent"
                    >
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black tracking-tight text-white bg-transparent leading-tight text-shadow">
                        Find Patterns Humans Miss.
                      </h2>
                      <p className="text-sm sm:text-base text-brand-silver max-w-2xl mx-auto leading-relaxed font-sans bg-transparent">
                        CHIMERA-X translates high-dimensional structured dataset logs into clear, actionable operational foresight. We solve only two problems: discover hidden patterns in data, and predict future outcomes from those patterns.
                      </p>
                    </motion.div>

                    {/* CTAs sliding from the right */}
                    <motion.div 
                      initial={{ x: 120, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="flex flex-wrap items-center justify-center gap-5 pt-6 bg-transparent"
                    >
                      <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(39, 227, 142, 0.35)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          soundEngine.playAlertTone();
                          setInCommandCenter(true);
                        }}
                        className="px-8 py-4 bg-brand-green hover:bg-brand-green/95 text-brand-bg font-sans font-black text-sm rounded-xl transition-all duration-300 inline-flex items-center gap-2.5 cursor-pointer border border-brand-green/20 shadow-[0_6px_20px_rgba(39,227,142,0.25)]"
                      >
                        <span>Start Analysis</span>
                        <ArrowRight className="w-4 h-4 text-brand-bg" />
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 0 20px rgba(130, 101, 255, 0.25)", borderColor: "rgba(130, 101, 255, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          soundEngine.playClickTone();
                          handleLoadCasePreset("case-01");
                          setInCommandCenter(true);
                        }}
                        className="px-8 py-4 bg-brand-sec/80 hover:bg-[#4E5664] text-white border border-white/10 rounded-xl text-sm font-semibold transition-all duration-300 inline-flex items-center gap-2.5 cursor-pointer shadow-lg"
                      >
                        <span>Load Demo Case</span>
                      </motion.button>
                    </motion.div>

                    {/* Quick Replay button */}
                    <div className="pt-2 bg-transparent">
                      <button 
                        onClick={() => {
                          soundEngine.playClickTone();
                          setAnimationStep(0);
                          setTimeout(() => setAnimationStep(1), 100);
                        }}
                        className="text-[10px] font-mono uppercase tracking-widest text-brand-silver/35 hover:text-brand-green transition-colors cursor-pointer bg-transparent"
                      >
                        ⟲ Replay Cinematic Introduction
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-40" />
                )}
              </section>

              {/* ==========================================================
                  SECTION 1: Pattern Discovery Interactive Bento Widget
                  ========================================================== */}
              {animationStep >= 4 && (
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 pt-12"
                >
                  <InwardMeetingHeading 
                    leftText="Discover" 
                    rightText="Hidden Patterns" 
                    subtitle="Section I • Autonomous Forensic Tracing" 
                  />
                  
                  <div className="max-w-2xl mx-auto text-center bg-transparent relative mb-8">
                    <p className="text-xs sm:text-sm text-brand-silver leading-relaxed bg-transparent">
                      CHIMERA-X leverages deep heuristic mapping to reveal critical high-density clusters, structural database shifts, and suspicious timeline sequences before traditional logs compile them.
                    </p>
                  </div>

                  {/* Interactive Bento Card Panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-transparent">
                    {/* Selectors Column (4/12 width) sliding from Left */}
                    <motion.div
                      initial={{ x: -80, opacity: 0, y: 15 }}
                      whileInView={{ x: 0, opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      className="lg:col-span-4 flex flex-col gap-3.5 bg-transparent"
                    >
                      {[
                        { 
                          tab: 'relationships', 
                          title: 'Hidden Relationships', 
                          desc: 'Find control paths between subjects and unlisted offshore trusts.',
                          accent: 'border-brand-green/20 hover:border-brand-green text-brand-green'
                        },
                        { 
                          tab: 'anomalies', 
                          title: 'Anomalous Activity Peaks', 
                          desc: 'Trace sudden transactional volume spikes right before disclosure.',
                          accent: 'border-brand-violet/20 hover:border-brand-violet text-brand-violet'
                        },
                        { 
                          tab: 'trends', 
                          title: 'Emerging Structural Trends', 
                          desc: 'Detect capital moving into decentralized digital escrow mix systems.',
                          accent: 'border-brand-blue/20 hover:border-brand-blue text-brand-blue'
                        },
                      ].map((item) => (
                        <div
                          key={item.tab}
                          onClick={() => {
                            soundEngine.playClickTone();
                            setActivePatternTab(item.tab as any);
                          }}
                          className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                            activePatternTab === item.tab 
                              ? 'bg-brand-card border-brand-green text-white shadow-xl translate-x-1.5' 
                              : 'bg-brand-card/20 border-white/[0.04] text-brand-silver/70 hover:bg-brand-card/40 hover:text-white'
                          }`}
                        >
                          <span className={`text-[10px] font-mono font-bold tracking-widest uppercase block mb-1.5 ${
                            activePatternTab === item.tab ? 'text-brand-green' : 'text-brand-silver/40'
                          }`}>
                            {item.title}
                          </span>
                          <p className="text-[11.5px] leading-relaxed font-sans bg-transparent">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </motion.div>

                    {/* Interactive Showcase Box (8/12 width) sliding from Right */}
                    <motion.div
                      initial={{ x: 80, opacity: 0, y: 15 }}
                      whileInView={{ x: 0, opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      className="lg:col-span-8 p-6 sm:p-8 bg-brand-sec/45 border border-white/10 rounded-3xl flex flex-col justify-between min-h-[350px] relative shadow-lg overflow-hidden select-none"
                    >
                      
                      {/* Holographic background line decoration */}
                      <div className="absolute top-0 right-0 w-[200px] h-[200px] rounded-full bg-brand-green/3 blur-[90px] pointer-events-none" />

                      {/* Display content based on active tab */}
                      <AnimatePresence mode="wait">
                        {activePatternTab === 'relationships' && (
                          <motion.div
                            key="rel"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5 text-left bg-transparent flex-1 flex flex-col justify-between"
                          >
                            <div className="space-y-2 bg-transparent">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider bg-brand-green/10 text-brand-green border border-brand-green/15">
                                Trace Discovery Active • Entity Graph Presets
                              </span>
                              <h4 className="text-lg font-bold text-brand-white">Offshore Conduit Mapping (Aegis Ledger Audit)</h4>
                              <p className="text-xs text-brand-silver leading-relaxed max-w-xl font-sans">
                                Isolates how <span className="text-white font-bold">Marcus Vance</span> controls Cayman Trust Accounts via intermediary shell corporations registered in Panama, bypassing automatic bank flagging controls.
                              </p>
                            </div>

                            {/* Simulated Interactive Graph Visual */}
                            <div className="py-4 px-5 bg-brand-bg/60 rounded-xl border border-white/5 flex flex-wrap items-center justify-center gap-6 text-xs font-mono relative">
                              <div className="flex flex-col items-center bg-transparent">
                                <span className="px-2.5 py-1 rounded bg-[#2B2F36] border border-white/10 text-white font-bold">Marcus Vance</span>
                                <span className="text-[9px] text-[#2EE6A6] uppercase mt-1">Advisor Primary</span>
                              </div>
                              <div className="flex flex-col items-center gap-1 bg-transparent text-[10px] text-brand-violet shrink-0 leading-none">
                                <span className="bg-transparent">↳ Ownership (90%)</span>
                                <span className="text-brand-silver/30 bg-transparent">--------➔</span>
                              </div>
                              <div className="flex flex-col items-center bg-transparent">
                                <span className="px-2.5 py-1 rounded bg-[#2B2F36] border border-brand-green/30 text-white font-bold">Aegis Ledger Corp</span>
                                <span className="text-[9px] text-brand-silver/55 mt-1">Panama Shell Entity</span>
                              </div>
                              <div className="flex flex-col items-center gap-1 bg-transparent text-[10px] text-[#4FD1FF] shrink-0 leading-none">
                                <span className="bg-transparent">↳ Outflux ($2.4M)</span>
                                <span className="text-brand-silver/30 bg-transparent">--------➔</span>
                              </div>
                              <div className="flex flex-col items-center bg-transparent">
                                <span className="px-2.5 py-1 rounded bg-[#2B2F36] border border-[#4FD1FF]/35 text-white font-bold">Global Trust Cayman</span>
                                <span className="text-[9px] text-brand-silver/55 mt-1">Offshore Account</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-brand-silver/50 font-mono flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-brand-green" />
                              <span>Graph constructed directly from parsed CSV ledger lines during active workspace loads.</span>
                            </p>
                          </motion.div>
                        )}

                        {activePatternTab === 'anomalies' && (
                          <motion.div
                            key="anom"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5 text-left bg-transparent flex-1 flex flex-col justify-between"
                          >
                            <div className="space-y-2 bg-transparent">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider bg-brand-violet/10 text-brand-violet border border-brand-violet/15">
                                Signal Peak Detected • Temporal Density
                              </span>
                              <h4 className="text-lg font-bold text-brand-white">Swiss Regulatory Audit Temporal Spike</h4>
                              <p className="text-xs text-brand-silver leading-relaxed max-w-xl font-sans">
                                Detects rapid capital volume changes. Outbound transfer frequency spiked <span className="text-brand-violet font-bold font-mono">4.2x above baseline</span> during the final seven days of reporting quarters.
                              </p>
                            </div>

                            {/* Beautiful visual chart representation */}
                            <div className="h-28 w-full mt-2 bg-brand-bg/50 p-3 rounded-xl border border-white/5 flex items-end justify-between font-mono text-[9px] select-none">
                              {[
                                { week: "Wk 1", val: 12 },
                                { week: "Wk 2", val: 15 },
                                { week: "Wk 3", val: 18 },
                                { week: "Wk 4", val: 11 },
                                { week: "Wk 5", val: 14 },
                                { week: "Wk 6", val: 19 },
                                { week: "Wk 7", val: 82, spike: true },
                              ].map((bar, bIdx) => (
                                <div key={bIdx} className="flex flex-col items-center gap-2 h-full justify-end flex-1 max-w-[50px] bg-transparent">
                                  <div className="w-full text-center tracking-tighter bg-transparent">
                                    <span className={bar.spike ? "text-brand-violet font-bold" : "text-brand-silver/40"}>
                                      {bar.val}%
                                    </span>
                                  </div>
                                  <div 
                                    style={{ height: `${bar.val}%` }} 
                                    className={`w-4 rounded-t-sm transition-all duration-1000 ${
                                      bar.spike 
                                        ? 'bg-gradient-to-t from-brand-violet to-[#8B5CF6]/40 shadow-[0_0_12px_rgba(139,92,246,0.3)]' 
                                        : 'bg-[#2B2F36]'
                                    }`}
                                  />
                                  <span className="text-brand-silver/50 bg-transparent">{bar.week}</span>
                                </div>
                              ))}
                            </div>

                            <p className="text-[11px] text-brand-silver/50 font-mono flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-brand-violet" />
                              <span>Sliding time-frame density algorithm contrasts transaction velocities automatically.</span>
                            </p>
                          </motion.div>
                        )}

                        {activePatternTab === 'trends' && (
                          <motion.div
                            key="trs"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-5 text-left bg-transparent flex-1 flex flex-col justify-between"
                          >
                            <div className="space-y-2 bg-transparent">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold tracking-wider bg-brand-blue/10 text-brand-blue border border-brand-blue/15">
                                Digital Escape Tracing • Ledger Transfers
                              </span>
                              <h4 className="text-lg font-bold text-brand-white">Web3 Cryptocurrency Bridge Transitions</h4>
                              <p className="text-xs text-brand-silver leading-relaxed max-w-xl font-sans">
                                Auto-scans bank transactions terminating at OTC exchange wallets. Capital is bridged into unregulated ledger protocols to dilute auditable forensic trails.
                              </p>
                            </div>

                            {/* Flow Bridge layout visual */}
                            <div className="p-4 bg-brand-bg/50 rounded-xl border border-white/5 flex items-center justify-between font-mono text-[10px] select-none text-center gap-4">
                              <div className="flex-1 bg-transparent">
                                <span className="block text-brand-white bg-transparent font-medium">Traditional Bank Capital</span>
                                <span className="text-[9px] text-brand-silver/40 block mt-0.5 font-bold">€1,410,000 Out</span>
                              </div>
                              <span className="text-brand-blue bg-transparent animate-pulse font-bold">⚡ OTC Bridge ⚡</span>
                              <div className="flex-1 bg-transparent">
                                <span className="block text-[#4FD1FF] bg-transparent font-medium">Decentralized Escrow</span>
                                <span className="text-[9px] text-[#2EE6A6] block mt-0.5 font-bold">Active On-chain Routing</span>
                              </div>
                            </div>

                            <p className="text-[11px] text-brand-silver/50 font-mono flex items-center gap-1.5">
                              <Info className="w-3.5 h-3.5 text-brand-blue" />
                              <span>Monitors SWIFT transactions connecting directly to unverified virtual assets OTC blocks.</span>
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  </div>
                </motion.section>
              )}

              {/* ==========================================================
                  SECTION 2: Future Simulation Portal (The Scenario Engine)
                  ========================================================== */}
              {animationStep >= 4 && (
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 pt-12"
                >
                  <InwardMeetingHeading 
                    leftText="Predict" 
                    rightText="Future Outcomes" 
                    subtitle="Section II • Scenario Simulation Sandbox" 
                  />
                  
                  <div className="max-w-2xl mx-auto text-center bg-transparent relative mb-8">
                    <p className="text-xs sm:text-sm text-brand-silver leading-relaxed bg-transparent">
                      Model cascading impacts of custom data parameters instantly. Set hypothetical volume expansions, frequency changes, or custom coordinate deletions to test system reactions.
                    </p>
                  </div>

                  {/* Fully Interactive Simulator Module */}
                  <div className="p-6 sm:p-8 bg-brand-sec/30 border border-[#333842] rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 shadow-xl relative overflow-hidden">
                    
                    {/* Input column sliding from Left */}
                    <motion.div
                      initial={{ x: -80, opacity: 0, y: 15 }}
                      whileInView={{ x: 0, opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      className="md:col-span-5 space-y-6 text-left z-10 bg-transparent flex flex-col justify-between"
                    >
                      <div className="space-y-4 bg-transparent">
                        <div className="space-y-1.5 bg-transparent">
                          <label className="text-[10px] font-mono uppercase text-brand-silver/55 font-bold block">
                            Select Simulation Hypothesis Preset
                          </label>
                          <div className="flex flex-col gap-2 bg-transparent">
                            {[
                              "What if Marcus Vance deletes database transaction logs?",
                              "What if transfer frequencies double over next quarter?",
                              "What if Swiss regulatory compliance thresholds increase by 50%?"
                            ].map((presetText) => (
                              <button
                                key={presetText}
                                onClick={() => {
                                  soundEngine.playClickTone();
                                  setLandingSimQuery(presetText);
                                }}
                                className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer ${
                                  landingSimQuery === presetText 
                                    ? 'bg-brand-violet/10 border-brand-violet text-brand-white' 
                                    : 'bg-[#2B2F36]/30 border-white/5 text-brand-silver/70 hover:bg-[#2F343A]/60'
                                }`}
                              >
                                {presetText}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom parameter */}
                        <div className="space-y-1.5 bg-transparent">
                          <label className="text-[10px] font-mono uppercase text-brand-silver/55 font-bold block">
                            Or Type Custom Scenario Hypothesis
                          </label>
                          <input
                            type="text"
                            value={landingSimQuery}
                            onChange={(e) => setLandingSimQuery(e.target.value)}
                            placeholder="e.g., What if outbound swift transfers are restricted?"
                            className="w-full bg-brand-bg/80 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-brand-violet/60 transition-all font-sans"
                          />
                        </div>
                      </div>

                      {/* Launch Button */}
                      <div className="pt-4 md:pt-0 bg-transparent">
                        <button
                          onClick={async () => {
                            if (!landingSimQuery) return;
                            soundEngine.playScanTone();
                            setLandingSimulating(true);
                            setLandingSimResult(null);
                            setLandingProgressLog([]);

                            // Stagger status updates
                            const logs = [
                              "Initializing predictive sandbox models...",
                              "Mapping spatial node dependencies...",
                              "Simulating capital transfer route overrides...",
                              "Synthesizing network outcome metrics..."
                            ];

                            for (let i = 0; i < logs.length; i++) {
                              setLandingProgressLog(prev => [...prev, logs[i]]);
                              await new Promise(r => setTimeout(r, 600));
                            }

                            // Generate realistic result
                            const outcomes: Record<string, any> = {
                              deleted: {
                                prediction: "Terminating Marcus Vance in server files forces administrative SOCKS5 proxy access routes to cascade into standalone automated SOCKS scripts.",
                                reasoning: "Vance represents the major anchor individual. Clearing his credential records triggers automatic backup routes originating from Russian subnets to secure the residue values.",
                                risks: "Risk of high-velocity untracable asset flight increases by 85%. Web3 escapes double within 48 hours for remaining holdings.",
                                opportunities: "Capturing coordinates from SOCKS S5 gateway traces provides permanent legal evidence.",
                                actions: "Restructure server file authority prior to credential revocation."
                              },
                              double: {
                                prediction: "Doubling frequency triggers critical regulatory limits, forcing central clearing hubs to flag the associated accounts.",
                                reasoning: "The model predicts aggregate outflux volume crossing the €15M threshold index block limit in Month 3.",
                                risks: "90% probability of sovereign court freezing orders, prompting manual account routing bypass flags.",
                                opportunities: "Immediate identification of the ultimate beneficial owners.",
                                actions: "Issue proactive hold notices on target trust entities."
                              },
                              generic: {
                                prediction: "Restricting active transaction lines causes routing paths to cluster onto parallel offshore shell banks registered inside Panama.",
                                reasoning: "The capital routing system dynamically shifts blockages toward adjacent unmonitored node routes.",
                                risks: "Elevated risk index score across intermediate nodes.",
                                opportunities: "Exposes active secondary bank accounts previously lying dormant.",
                                actions: "Cross-flag structural gateway subnets across adjacent sovereign clearing houses."
                              }
                            };

                            const key = landingSimQuery.includes("deletes") 
                              ? "deleted" 
                              : landingSimQuery.includes("double") 
                              ? "double" 
                              : "generic";

                            setLandingSimResult(outcomes[key]);
                            setLandingSimulating(false);
                            soundEngine.playAlertTone();
                          }}
                          disabled={!landingSimQuery || landingSimulating}
                          className="w-full py-3.5 bg-brand-violet hover:bg-brand-violet/90 disabled:opacity-30 text-white font-sans font-black text-xs rounded-xl transition-all duration-300 shadow-[0_4px_14px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
                        >
                          {landingSimulating ? (
                            <>
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                              <span>Forecasting Outflow Deltas...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 text-white" />
                              <span>Compute Future Cascade</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {/* Output/Console Column sliding from Right */}
                    <motion.div
                      initial={{ x: 80, opacity: 0, y: 15 }}
                      whileInView={{ x: 0, opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                      className="md:col-span-7 bg-brand-bg/85 border border-white/10 rounded-2xl p-5 min-h-[300px] flex flex-col justify-between font-sans text-xs relative"
                    >
                      
                      {/* Terminal log logs during operation */}
                      {!landingSimulating && !landingSimResult && (
                        <div className="my-auto text-center space-y-2 select-none">
                          <Radio className="w-10 h-10 text-brand-violet/40 animate-pulse mx-auto bg-transparent inline" />
                          <p className="font-mono text-brand-silver/30 text-xs uppercase tracking-wider block bg-transparent">
                            CONSOL MODELING TERMINAL READY
                          </p>
                          <p className="text-[11px] text-brand-silver/55 max-w-sm mx-auto font-sans bg-transparent">
                            Select or input a condition on the left, then click "Compute Future Cascade" to simulate future outcome trajectories.
                          </p>
                        </div>
                      )}

                      {/* Simulating Stage */}
                      {landingSimulating && (
                        <div className="flex-1 flex flex-col justify-center space-y-4 font-mono text-[11px] text-left">
                          <div className="space-y-2 bg-transparent">
                            {landingProgressLog.map((log, lIdx) => (
                              <div key={lIdx} className="flex gap-2 items-center bg-transparent">
                                <span className="text-brand-green">✓</span>
                                <span className="text-brand-silver/80">{log}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 text-brand-violet font-bold animate-pulse bg-transparent">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Computing 12-month Risk Horizon Index projections...</span>
                          </div>
                        </div>
                      )}

                      {/* Display Outcome Outcome */}
                      {landingSimResult && !landingSimulating && (
                        <div className="flex-1 flex flex-col justify-between space-y-5 text-left bg-transparent">
                          
                          {/* Heading summary */}
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 select-none bg-transparent">
                            <span className="text-[9px] font-mono text-brand-violet uppercase tracking-widest font-black">
                              PREDICTIVE FORECAST Delta SUCCESS
                            </span>
                            <span className="text-[9px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/35 px-2 py-0.5 rounded uppercase font-bold">
                              Confidence: High (94%)
                            </span>
                          </div>

                          {/* Specific output elements */}
                          <div className="space-y-3 font-sans bg-transparent">
                            <div className="bg-transparent text-left">
                              <span className="text-[9.5px] font-mono uppercase text-brand-violet font-extrabold tracking-widest block mb-0.5">
                                Predicted Outcome
                              </span>
                              <p className="text-[12px] text-brand-white leading-relaxed font-bold bg-transparent">
                                {landingSimResult.prediction}
                              </p>
                            </div>

                            <div className="bg-transparent text-left">
                              <span className="text-[9.5px] font-mono uppercase text-brand-silver/50 font-semibold block mb-0.5">
                                Theoretical Reasoning
                              </span>
                              <p className="text-[11.5px] text-brand-silver/90 leading-relaxed bg-transparent">
                                {landingSimResult.reasoning}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-transparent text-left">
                              <div className="p-3 bg-red-950/15 border border-red-500/10 rounded-lg text-left">
                                <span className="text-[9.5px] font-mono uppercase text-red-400 font-extrabold tracking-wider block mb-1">
                                  System Risks
                                </span>
                                <span className="text-[11px] text-brand-silver leading-relaxed block bg-transparent">
                                  {landingSimResult.risks}
                                </span>
                              </div>
                              <div className="p-3 bg-brand-green/5 border border-brand-green/10 rounded-lg text-left">
                                <span className="text-[9.5px] font-mono uppercase text-brand-green font-extrabold tracking-wider block mb-1">
                                  Action Focus
                                </span>
                                <span className="text-[11px] text-brand-silver leading-relaxed block bg-transparent">
                                  {landingSimResult.opportunities}
                                </span>
                              </div>
                            </div>

                            <div className="bg-transparent text-left">
                              <span className="text-[9.5px] font-mono uppercase text-brand-blue font-extrabold tracking-widest block mb-0.5">
                                Recommended Action
                              </span>
                              <p className="text-[11.5px] text-brand-white bg-brand-blue/5 border-l-2 border-brand-blue pl-2 py-0.5 tracking-wide leading-relaxed font-sans">
                                {landingSimResult.actions}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex justify-end">
                            <button
                              onClick={() => {
                                soundEngine.playClickTone();
                                setInCommandCenter(true);
                              }}
                              className="text-xs text-brand-green font-mono font-bold uppercase tracking-widest hover:underline cursor-pointer bg-transparent"
                            >
                              Open in command workstation to view model curves →
                            </button>
                          </div>

                        </div>
                      )}

                    </motion.div>
                  </div>
                </motion.section>
              )}

              {/* ==========================================================
                  SECTION 3: Conversational AI Analyst Dashboard (ChatGPT Style)
                  ========================================================== */}
              {animationStep >= 4 && (
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 pt-12"
                >
                  <InwardMeetingHeading 
                    leftText="AI Chat" 
                    rightText="Analyst Workspace" 
                    subtitle="Section III • Conversational intelligence" 
                  />
                  
                  <div className="max-w-2xl mx-auto text-center bg-transparent relative mb-8">
                    <p className="text-xs sm:text-sm text-brand-silver leading-relaxed bg-transparent">
                      Communicate with high-integrity models naturally. Ask complex causal cross-checks, trace suspicious routing coordinates, and reveal evidence trails instantly.
                    </p>
                  </div>

                  <AnalystLandingWidget />
                </motion.section>
              )}

              {/* ==========================================================
                  SECTION 4: Professional Workflow Pipeline (How It Works)
                  ========================================================== */}
              {animationStep >= 4 && (
                <motion.section 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8 }}
                  className="space-y-8 pt-12"
                >
                  <InwardMeetingHeading 
                    leftText="SYSTEM" 
                    rightText="ARCHITECTURE" 
                    subtitle="Continuous Auditing Architecture" 
                  />
                  
                  <div className="max-w-2xl mx-auto text-center bg-transparent mb-8">
                    <p className="text-xs sm:text-sm text-brand-silver leading-relaxed bg-transparent">
                      An integrated four-part execution pipeline built on scalable parsing models, deep graph structures, and semantic decision reasoning.
                    </p>
                  </div>

                  {/* Flow Map UI layout */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none bg-transparent">
                    {[
                      {
                        stepIdx: 0,
                        title: "1. Upload Raw Records",
                        label: "INGEST",
                        desc: "Drop csv or Excel spreadsheets directly. Our parsing engines automatically map and clean transaction columns.",
                        indicatorColor: "text-brand-green"
                      },
                      {
                        stepIdx: 1,
                        title: "2. Graph Relationships",
                        label: "SYNTHESIS",
                        desc: "AI identifies entity affiliations, money routing networks, SOCKS5 servers, and offshore control assets.",
                        indicatorColor: "text-brand-violet"
                      },
                      {
                        stepIdx: 2,
                        title: "3. Extract Risk Insights",
                        label: "DIAGNOSTICS",
                        desc: "Translates structural patterns, anomalies, and temporal velocity changes into high-integrity human-led points.",
                        indicatorColor: "text-brand-blue"
                      },
                      {
                        stepIdx: 3,
                        title: "4. Future Simulation",
                        label: "PROJECTION",
                        desc: "Modulates hypothetical deltas or subject deletes. The Scenario Engine computes the risk cascade parameters.",
                        indicatorColor: "text-brand-green"
                      },
                    ].map((stepObj) => (
                      <div
                        key={stepObj.stepIdx}
                        onClick={() => {
                          soundEngine.playClickTone();
                          setActiveHowItWorksStep(stepObj.stepIdx);
                        }}
                        className={`p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 relative ${
                          activeHowItWorksStep === stepObj.stepIdx 
                            ? 'bg-[#2B2F36] border-brand-green text-white shadow-xl scale-[1.02]' 
                            : 'bg-[#2B2F36]/15 border-white/[0.04] text-brand-silver/70 hover:bg-[#2B2F36]/30'
                        }`}
                      >
                        <div className="flex justify-between items-center bg-transparent mb-4">
                          <span className="text-[10px] font-mono text-brand-silver/40 font-bold uppercase block tracking-widest bg-transparent">
                            {stepObj.label}
                          </span>
                          <span className={`w-2.5 h-2.5 rounded-full bg-current ${stepObj.indicatorColor}`} />
                        </div>
                        <h4 className="text-sm font-bold text-brand-white bg-transparent">
                          {stepObj.title}
                        </h4>
                        <p className="text-xs text-brand-silver/80 leading-relaxed mt-2.5 font-sans bg-transparent">
                          {stepObj.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Flow Detail Modal or Segment block */}
                  <div className="p-6 bg-[#2B2F36]/20 border border-white/5 rounded-3xl text-left shadow-md select-none">
                    <span className="text-[10px] font-mono uppercase text-brand-green tracking-widest block font-bold mb-1">
                      Step Detail Context
                    </span>
                    <p className="text-xs sm:text-sm text-brand-silver max-w-4xl leading-relaxed font-sans mt-1">
                      {activeHowItWorksStep === 0 && (
                        <span>
                          <strong>Document Ingestion:</strong> Ingests large structured lists of transactions, SWIFT coordinates, SOCKS5 server logs, and contract files. Columns are normalized using auto-mapping semantic heuristics that isolate timestamp lists, target transfer coordinates, sending individuals, and transaction value limits, eliminating timezone discrepancies.
                        </span>
                      )}
                      {activeHowItWorksStep === 1 && (
                        <span>
                          <strong>Dynamic Graph Synthesis:</strong> Maps multiple data source registers onto an unified entity-relationship dependency network. Solves structural clusters by calculating node centrality, hub influence indices, and affiliation ties, which exposes hidden coordinates like Sankt-Peterburg proxies bypassing standard commercial registries.
                        </span>
                      )}
                      {activeHowItWorksStep === 2 && (
                        <span>
                          <strong>Intelligence Diagnosis:</strong> The analysis layer extracts outstanding observations. Translates raw graphs and timeline events into clinical plain-English bulletins (such as identifying concentration anomalies on three primary sending accounts, or SOCKS interface access overrides originating from restricted subnets prior to disclosure dates).
                        </span>
                      )}
                      {activeHowItWorksStep === 3 && (
                        <span>
                          <strong>Cascade Modeling Projections:</strong> The Scenario Engine models structural changes. Allows you to remove anchor entities (e.g. Marcus Vance) or change transaction velocity. The system traces downstream risks, predicted bypasses, opportunities, and outputs a concrete sequence of mitigation actions.
                        </span>
                      )}
                    </p>
                  </div>
                </motion.section>
              )}

            </main>

            {/* Bottom info footer banner */}
            <footer className="relative z-10 mt-12 py-8 px-6 md:px-12 lg:px-24 border-t border-white/[0.04] bg-brand-bg/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] font-mono text-brand-silver/45 gap-4">
              <div className="flex items-center gap-1.5 uppercase bg-transparent">
                <ShieldCheck className="w-4 h-4 text-brand-green/50 bg-transparent" />
                <span>Verified high-integrity sandbox • Computations local and secure</span>
              </div>
              <div className="bg-transparent">
                <span>© {new Date().getFullYear()} CHIMERA-X Operating Systems. Elite Intelligence Workspace.</span>
              </div>
            </footer>
          </motion.div>
        ) : (
          
          /* =========================================================================
             COMMAND CENTER WORKSPACE: 10-Second-understandable three-column layout
             ========================================================================= */
          <motion.div 
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-screen min-h-screen text-[13px] bg-brand-bg text-brand-silver"
          >
             {/* Sleek Top Navigation Bar */}
             <header className="h-14 border-b border-[#464D55]/25 bg-brand-bg/95 backdrop-blur-md px-6 flex items-center justify-between z-10 select-none shrink-0">
               <div className="flex items-center gap-4 bg-transparent">
                 <div className="flex items-center gap-2.5 cursor-pointer bg-transparent" onClick={() => setInCommandCenter(false)}>
                   <ShieldCheck className="w-5 h-5 text-brand-green" />
                   <span className="font-sans font-black tracking-widest text-[#F3F4F6] text-sm select-none">
                     CHIMERA AUDIT
                   </span>
                 </div>
                 <span className="hidden md:inline-block h-4 w-[1px] bg-[#464D55]/30" />
                 <span className="hidden md:inline-block text-xs text-brand-silver bg-transparent">
                   Currently Auditing: <strong className="text-white">{activeCase ? activeCase.title : "No active database file loaded"}</strong>
                 </span>
               </div>
 
               {/* Status and Audio Indicator row */}
               <div className="flex items-center gap-3 bg-transparent">
                 
                 {/* Clean volume switch */}
                 <button
                   onClick={() => setIsAudioOn(prev => !prev)}
                   title={isAudioOn ? "Mute audio cues" : "Unmute audio cues"}
                   className={`p-2 rounded border transition-all duration-200 cursor-pointer ${
                     isAudioOn 
                       ? 'bg-brand-green/10 text-brand-green border-brand-green/30' 
                       : 'bg-brand-card/30 text-[#BFC5CD] border-white/5 hover:bg-[#464D55]/55'
                   }`}
                 >
                   {isAudioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                 </button>
 
                 <button
                   onClick={() => {
                     soundEngine.playClickTone();
                     setInCommandCenter(false);
                   }}
                   className="px-3.5 py-1.5 text-xs text-brand-silver hover:text-white bg-brand-card/30 hover:bg-[#464D55]/65 border border-white/10 rounded transition-all cursor-pointer"
                 >
                   Return to Home
                 </button>
               </div>
             </header>
 
             {/* Core Workframe Workspace Grid */}
             <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative bg-brand-bg">
               
               {/* =====================================================================
                  1. LEFT COLUMN PANEL: File Workspace & Pre-loaded cases (Col span 3)
                  ===================================================================== */}
               <div className="lg:col-span-3 border-r border-[#464D55]/20 bg-brand-sec flex flex-col h-full overflow-y-auto p-5 space-y-6 text-left">
                 
                 {/* Clear block prompt */}
                 <div className="space-y-1 bg-transparent">
                   <h3 className="text-xs font-bold text-brand-silver uppercase tracking-widest font-mono">
                     Source Documents
                   </h3>
                   <p className="text-[11px] text-[#BFC5CD]/60 leading-relaxed font-sans bg-transparent">
                     Upload custom spreadsheet logs or toggle presets below to scan immediately.
                   </p>
                 </div>
 
                 {/* Drag and Drop Zone (Clean layout) */}
                 <div className="space-y-2 bg-transparent">
                   <div
                     onDragOver={handleDragOver}
                     onDragLeave={handleDragLeave}
                     onDrop={handleDrop}
                     onClick={() => {
                       soundEngine.playClickTone();
                       const el = document.getElementById('file-upload-input');
                       el?.click();
                     }}
                     className={`border border-dashed p-4.5 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none ${
                       isDragging 
                         ? 'border-brand-green bg-brand-green/10' 
                         : uploadingDoc
                         ? 'border-brand-violet bg-brand-violet/10'
                         : 'border-[#464D55] hover:border-brand-green/55 bg-[#2F343A]/40'
                     }`}
                   >
                     <input
                       id="file-upload-input"
                       type="file"
                       onChange={(e) => {
                         if (e.target.files && e.target.files.length > 0) {
                           handleFileUpload(e.target.files[0]);
                         }
                       }}
                       className="hidden"
                     />
                     
                     {uploadingDoc ? (
                       <Loader2 className="w-7 h-7 text-brand-green animate-spin mb-2" />
                     ) : (
                       <Upload className="w-7 h-7 text-brand-silver mb-2 inline bg-transparent" />
                     )}
                     <span className="text-xs font-semibold text-brand-white block bg-transparent">
                       {uploadingDoc ? "Parsing ledger lines..." : "Drag & drop spreadsheets (.csv, .xlsx) here"}
                     </span>
                     <span className="text-[10px] text-[#BFC5CD]/40 font-mono mt-1 block bg-transparent">
                       CLICK TO UPLOAD
                     </span>
                   </div>
                 </div>
 
                 {/* Active Files logs */}
                 <div className="space-y-3 bg-transparent">
                   <div className="flex items-center justify-between border-b border-[#464D55]/30 pb-1 select-none bg-transparent">
                     <span className="text-[11px] font-bold text-brand-white uppercase tracking-wider font-mono">
                       Loaded Raw Documents
                     </span>
                     <span className="text-[10px] font-mono text-[#BFC5CD]/45">
                       {uploadedFiles.length} FILES
                     </span>
                   </div>
                   <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 bg-transparent">
                     {uploadedFiles.map((file, idx) => (
                       <div key={idx} className="flex items-center justify-between p-2.5 bg-brand-card/25 rounded border border-[#464D55]/40 text-[11px]">
                         <div className="min-w-0 pr-2 bg-transparent text-left">
                           <span className="block font-medium truncate text-[#F5F7FA] bg-transparent">{file.name}</span>
                           <span className="text-[#BFC5CD]/50 text-[10px] bg-transparent">{file.size}</span>
                         </div>
                         <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-brand-green/10 text-brand-green border border-brand-green/10 shrink-0">
                           {file.status}
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>
 
                 {/* Case Selector Selection Cards */}
                 <div className="space-y-3 bg-transparent">
                   <div className="border-b border-[#464D55]/30 pb-1 select-none bg-transparent">
                     <span className="text-[11px] font-bold text-brand-white uppercase tracking-wider font-mono block">
                       Select Audit Scenario Preset
                     </span>
                   </div>
                   <div className="space-y-2 bg-transparent">
                     {[
                       { id: "case-01", name: "Operation Frostbite", desc: "Decentralized channel capital flight log", type: "Finances Extract" },
                       { id: "case-02", name: "Project Genesis", desc: "Industrial control system access logs", type: "Telemetry Audit" },
                       { id: "case-03", name: "Syndicate Omicron", desc: "Corporate shipping registry discrepant cargo weights", type: "Smuggling Manifest" }
                     ].map(preset => {
                       const isActive = activeCase?.id === preset.id;
                       return (
                         <div
                           key={preset.id}
                           onClick={() => handleLoadCasePreset(preset.id)}
                           className={`w-full text-left p-3.5 rounded-lg border transition-all duration-200 select-none cursor-pointer group ${
                             isActive 
                               ? 'bg-brand-green/10 border-brand-green text-white shadow-md' 
                               : 'bg-[#2F343A]/25 border-[#464D55]/60 text-brand-silver hover:bg-brand-card/35 hover:border-brand-violet hover:text-[#F5F7FA]'
                           }`}
                         >
                           <div className="flex justify-between items-center bg-transparent">
                             <span className="text-xs font-bold text-[#F5F7FA] block group-hover:text-brand-green transition-colors bg-transparent">{preset.name}</span>
                             <span className="text-[9px] font-mono text-brand-silver border border-[#464D55] px-1.5 py-0.5 rounded bg-transparent">{preset.type}</span>
                           </div>
                           <span className="text-[11px] text-[#BFC5CD]/75 block mt-1.5 leading-relaxed bg-transparent">{preset.desc}</span>
                         </div>
                       );
                     })}
                   </div>
                 </div>
 
                 {/* Database State Controls */}
                 <div className="pt-2 select-none bg-transparent">
                   <button
                     onClick={handleResetWorkspace}
                     className="w-full py-2 bg-[#2F343A]/30 hover:bg-red-950/15 hover:text-red-400 border border-[#464D55]/35 hover:border-red-500/25 rounded text-xs font-mono font-bold text-brand-silver transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                   >
                     <RotateCcw className="w-3.5 h-3.5" />
                     <span>Reset App Workspace</span>
                   </button>
                 </div>
                </div>

              

              {/* =====================================================================
                 2. CENTER COLUMN PANEL: "What did the AI Find?" & ChatGPT Conversation
                 ===================================================================== */}
              <div className="lg:col-span-5 bg-brand-bg flex flex-col h-full border-r border-[#464D55]/20 overflow-hidden text-left">
                
                {/* Instant Glimpse Status Row */}
                <div className="h-11 border-b border-[#464D55]/20 px-5 flex items-center justify-between bg-brand-sec select-none shrink-0 text-xs">
                  <span className="font-sans text-brand-silver font-semibold flex items-center gap-1.5 bg-transparent">
                    <User className="w-3.5 h-3.5 text-brand-green" />
                    <span>Audit Findings & AI Assistant</span>
                  </span>
                  <span className="font-mono text-[10px] text-brand-silver/40 bg-transparent">
                    LOCAL SANDBOX DATA
                  </span>
                </div>

                {/* Sub-Scroll Container wrapping the core highlights and conversational feed */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                  
                  {/* "WHAT DID THE AI FIND?" SECTION */}
                  <div className="space-y-4 bg-transparent text-left">
                    <div className="flex items-center justify-between border-b border-[#464D55]/25 pb-1 select-none bg-transparent">
                      <div className="flex items-center gap-1.5 bg-transparent">
                        <Sparkles className="w-4 h-4 text-brand-green" />
                        <h2 className="text-sm font-extrabold text-white font-sans tracking-wide">
                          What did the AI find?
                        </h2>
                      </div>
                      <span className="text-[11px] font-mono text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded border border-brand-green/15 font-bold bg-transparent">
                        {highlightedFindings.length} Active Observations
                      </span>
                    </div>

                    {/* Highly polished, plain-English observation block cards */}
                    <div className="grid grid-cols-1 gap-3 bg-transparent">
                      {highlightedFindings.map((finding) => {
                        let catBg = "bg-brand-green/10 text-brand-green border-brand-green/20";
                        if (finding.category === 'Unusual') catBg = "bg-brand-violet/10 text-brand-violet border-brand-violet/20";
                        if (finding.category === 'Pattern') catBg = "bg-brand-blue/10 text-brand-blue border-brand-blue/20";

                        return (
                          <div 
                            key={finding.id} 
                            className="bg-brand-card/30 p-4 rounded-lg border border-[#464D55]/50 transition-all hover:border-brand-violet/50 hover:bg-brand-card/55 flex justify-between gap-3 items-start select-none group"
                          >
                            <div className="space-y-1 bg-transparent text-left">
                              <div className="flex items-center gap-1.5 bg-transparent">
                                <span className={`text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${catBg}`}>
                                  {finding.category}
                                </span>
                                <span className="text-[10px] text-brand-silver/65 font-mono bg-transparent font-medium">
                                  AUDIT DIAGNOSTIC INSIGHT
                                </span>
                              </div>
                              <h4 className="text-[13px] font-bold text-brand-white group-hover:text-brand-green transition-colors bg-transparent mt-1">
                                {finding.headline}
                              </h4>
                              <p className="text-[11px] text-brand-silver/80 leading-relaxed bg-transparent">
                                {finding.description}
                              </p>
                            </div>

                            {/* EXPLAIN FINDING button (Opens details with simple human overlay) */}
                            <button
                              onClick={() => handleShowExplanation(finding.explanationKey)}
                              className="px-2.5 py-2 bg-brand-sec hover:bg-brand-green hover:text-brand-bg text-[10px] font-mono font-bold text-[#D1D5DB] rounded uppercase transition-all shrink-0 cursor-pointer flex items-center gap-1 border border-brand-card select-none active:scale-95 bg-transparent"
                            >
                              <Info className="w-3.5 h-3.5 bg-transparent" />
                              <span>Analyze</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI ANALYST CONVERSATION PANEL */}
                  <div className="space-y-4 pt-2 bg-transparent text-left">
                    <div className="flex items-center gap-1 border-b border-[#464D55]/25 pb-1 select-none bg-transparent font-sans">
                      <Terminal className="w-4 h-4 text-brand-violet" />
                      <h2 className="text-sm font-sans font-extrabold text-white tracking-wide">
                        Interactive Chat Auditor
                      </h2>
                    </div>

                    {/* Preconfigured, extremely natural questions prompts */}
                    <div className="grid grid-cols-2 gap-2 select-none bg-transparent">
                      {[
                        { text: "Summarize transactions", desc: "Analyze chronological event lines" },
                        { text: "Highlight unusual velocity", desc: "Isolate rapid transfers or bypass logs" },
                        { text: "Find high-volume accounts", desc: "Identify top wire senders and receivers" },
                        { text: "Show simulation trend", desc: "Forecast risks based on volume changes" }
                      ].map((prompt, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSendQuery(prompt.text)}
                          className="bg-brand-sec/45 hover:bg-brand-card/75 p-2.5 rounded-lg border border-brand-card hover:border-brand-green/45 transition-all cursor-pointer text-left group"
                        >
                          <div className="font-bold text-[#F5F7FA] text-xs flex items-center gap-1 bg-transparent group-hover:text-brand-green transition-colors">
                            <span>{prompt.text}</span>
                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" />
                          </div>
                          <span className="text-[10px] text-brand-silver/50 block leading-normal mt-0.5 bg-transparent font-sans">{prompt.desc}</span>
                        </div>
                      ))}
                    </div>

                    {/* Message Log Console (ChatGPT Style) */}
                    <div className="space-y-3 bg-[#2F343A]/45 p-4 rounded-xl border border-brand-card/45 min-h-60 max-h-96 overflow-y-auto">
                      {aiChatLogs.map((log, idx) => {
                        const isAi = log.sender === 'assistant';
                        return (
                          <div 
                            key={idx} 
                            className={`flex ${isAi ? 'justify-start' : 'justify-end'} bg-transparent`}
                          >
                            <div className={`max-w-[85%] rounded-xl px-4 py-3 text-left space-y-1 ${
                              isAi 
                                ? 'bg-brand-card text-[#F5F7FA] border border-brand-card/85' 
                                : 'bg-brand-green/15 text-brand-green border border-brand-green/25'
                            }`}>
                              <div className="flex items-center justify-between text-[10px] font-mono text-brand-silver/45 gap-6 bg-transparent">
                                <span className="font-bold tracking-wider">{isAi ? 'CHIMERA AUDIT ASSISTANT' : 'AUDITOR REQUEST'}</span>
                                <span>{log.time}</span>
                              </div>
                              <p className="text-[12.5px] font-normal leading-relaxed whitespace-pre-wrap font-sans bg-transparent">
                                {log.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {aiLoading && (
                        <div className="flex justify-start bg-transparent">
                          <div className="bg-brand-card text-brand-silver rounded-xl px-4 py-3 border border-brand-card/80 inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-brand-green animate-spin bg-transparent" />
                            <span className="text-xs font-mono bg-transparent">Audit assistant checking transaction directories...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Chat Input form bar with custom placeholder */}
                    <div className="flex gap-2 bg-transparent">
                      <input
                        type="text"
                        value={chatInputValue}
                        onChange={(e) => setChatInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSendQuery();
                        }}
                        placeholder="Query suspicious account sequences, transaction frequencies, or volume flow gaps..."
                        className="flex-1 bg-brand-sec border border-[#464D55]/65 hover:border-brand-card focus:border-brand-green/45 rounded-lg px-4 py-2.5 outline-none font-sans text-[#F5F7FA] transition-all text-xs"
                      />
                      <button
                        onClick={() => handleSendQuery()}
                        disabled={aiLoading}
                        className="px-4 py-2.5 bg-brand-green hover:bg-brand-green/90 disabled:opacity-50 text-brand-bg rounded-lg transition-all text-xs font-bold font-sans cursor-pointer flex items-center gap-1 border border-brand-green/20"
                      >
                        <Send className="w-3.5 h-3.5 text-brand-bg bg-transparent inline" />
                        <span>Send</span>
                      </button>
                    </div>

                  </div>

                </div>

              </div>

              {/* =====================================================================
                 3. RIGHT COLUMN PANEL: Futuring Simulation & Consulting Dossier Report
                 ===================================================================== */}
              <div className="lg:col-span-4 bg-brand-sec flex flex-col h-full overflow-y-auto p-5 space-y-6 border-l border-[#464D55]/20">
                
                {/* Tab layout switch between Future Simulation & Printable Consulting Report */}
                <div className="flex bg-[#2F343A] p-1 rounded-lg border border-brand-card/40 select-none text-xs">
                  <button
                    onClick={() => {
                      soundEngine.playClickTone();
                      setActiveTab('observations');
                    }}
                    className={`flex-1 py-1.5 rounded-md font-sans font-bold uppercase transition-all tracking-wider cursor-pointer ${
                      activeTab === 'observations' 
                        ? 'bg-brand-green text-brand-bg' 
                        : 'text-brand-silver hover:text-white bg-transparent'
                    }`}
                  >
                    Scenario Forecast
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClickTone();
                      setActiveTab('report');
                    }}
                    className={`flex-1 py-1.5 rounded-md font-sans font-bold uppercase transition-all tracking-wider cursor-pointer ${
                      activeTab === 'report' 
                        ? 'bg-brand-green text-brand-bg' 
                        : 'text-brand-silver hover:text-white bg-transparent'
                    }`}
                  >
                    Audit Report
                  </button>
                </div>

                {activeTab === 'observations' && (
                  <div className="space-y-5 text-left">
                    <div className="space-y-1 select-none bg-transparent">
                      <div className="flex items-center gap-1 text-brand-green bg-transparent">
                        <TrendingUp className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest font-mono bg-transparent">
                          Future Scenario Forecast
                        </h3>
                      </div>
                      <p className="text-[11px] text-brand-silver/60 leading-relaxed font-sans bg-transparent">
                        Model the potential impact of transaction growth, ledger shifts, or account activity trends over time.
                      </p>
                    </div>

                    {/* Predefined Simulator Scenarios selector inputs */}
                    <div className="space-y-3.5 select-none bg-transparent">
                      <div className="space-y-1.5 bg-transparent">
                        <label className="text-[10px] font-mono uppercase text-brand-silver/50 font-bold block bg-transparent">
                          Scenario Conditions
                        </label>
                        <select
                          value={selectedScenario}
                          onChange={(e) => setSelectedScenario(e.target.value)}
                          className="w-full bg-brand-bg border border-brand-card/85 rounded-lg p-2.5 text-xs focus:border-brand-green/50 outline-none pr-8 text-brand-white"
                        >
                          <option value="Transaction volume increases by 50%. bg-brand-sec text-white">Transaction volume increases by 50%.</option>
                          <option value="Subject coordinates (Marcus Vance) deleted from database logs. bg-brand-sec text-white">Subject coordinates (Marcus Vance) deleted from database logs.</option>
                          <option value="Transfer frequencies double over six consecutive months. bg-brand-sec text-white">Transfer frequencies double over six consecutive months.</option>
                        </select>
                      </div>

                      {/* Custom query input simulator alternative */}
                      <div className="space-y-1.5 bg-transparent">
                        <label className="text-[10px] font-mono uppercase text-brand-silver/50 font-bold block bg-transparent">
                          Custom simulation parameters
                        </label>
                        <input
                          type="text"
                          value={customScenarioInput}
                          onChange={(e) => setCustomScenarioInput(e.target.value)}
                          placeholder="e.g., If Saint Petersburg proxy subnet blocks are bypassed entirely"
                          className="w-full bg-brand-bg border border-brand-card/85 rounded-lg p-2 text-xs focus:border-brand-green/45 outline-none text-brand-white placeholder-brand-silver/30"
                        />
                      </div>

                      {/* Sliders layout */}
                      <div className="grid grid-cols-2 gap-4 bg-transparent">
                        <div className="space-y-1 bg-transparent">
                          <div className="flex justify-between text-[10px] font-mono text-brand-silver/40 font-bold bg-transparent">
                            <span>ESTIMATED VOLUME CHANGE</span>
                            <span>{simGrowth}%</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="150"
                            value={simGrowth}
                            onChange={(e) => setSimGrowth(parseInt(e.target.value))}
                            className="w-full accent-brand-green bg-brand-bg h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="space-y-1 bg-transparent">
                          <div className="flex justify-between text-[10px] font-mono text-brand-silver/40 font-bold bg-transparent">
                            <span>PROJECTION RANGE</span>
                            <span>{simMonths} MOS</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="12"
                            value={simMonths}
                            onChange={(e) => setSimMonths(parseInt(e.target.value))}
                            className="w-full accent-brand-green bg-brand-bg h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Simulation CTA clicker */}
                      <button
                        onClick={handleTriggerSimulation}
                        disabled={simulating}
                        className="w-full py-2.5 bg-brand-violet hover:bg-brand-violet/90 disabled:opacity-50 text-white rounded-lg transition-all text-xs font-bold font-sans cursor-pointer flex items-center justify-center gap-2 border border-brand-violet/20 active:scale-[0.98]"
                      >
                        {simulating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                            <span>Forecasting audit trend...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Forecast Trend</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Simulation result outputs */}
                    {simResult && !simulating && (
                      <div className="bg-brand-card p-4 rounded-xl border border-brand-card/70 space-y-4 select-none animate-fadeIn shadow-lg text-left">
                        
                        <div className="space-y-1 bg-transparent">
                          <div className="flex items-center justify-between bg-transparent">
                            <span className="text-[10px] font-mono tracking-wider font-extrabold text-brand-blue uppercase bg-transparent">
                              Forecast Summary
                            </span>
                            <span className="text-[10px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
                              Data Coverage: High-Integrity Verified
                            </span>
                          </div>
                          <h4 className="text-[13px] font-bold text-brand-white italic bg-transparent">
                            "{simResult.scenarioName}"
                          </h4>
                        </div>

                        {/* Text explanation tracing back actual numbers cleanly */}
                        <div className="space-y-1 bg-transparent">
                          <span className="text-[9px] font-mono uppercase text-brand-silver/50 font-bold block bg-transparent">
                            Impact Assessment:
                          </span>
                          <p className="text-[11px] text-brand-silver/90 leading-relaxed font-sans bg-transparent">
                            Model pathways show transaction routing trends consolidating on primary intermediary accounts over the forecast window, revealing a systemic concentration risk profile.
                          </p>
                        </div>

                        {/* Listed critical impacts */}
                        <div className="space-y-2 bg-transparent">
                          <span className="text-[9px] font-mono uppercase text-brand-silver/40 font-bold block bg-transparent">
                            Key Simulation Outcomes:
                          </span>
                          <div className="space-y-1.5 bg-transparent">
                            {simResult.criticalOutcomes.map((outcome, idx) => (
                              <div key={idx} className="flex gap-2 items-start text-[11px] text-brand-silver/90 leading-normal bg-transparent text-left">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand-violet shrink-0 mt-1.5" />
                                <span className="bg-transparent">{outcome}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* simple line projection using Recharts */}
                        <div className="space-y-2 bg-transparent">
                          <div className="bg-transparent">
                            <span className="text-[9px] font-mono uppercase text-brand-silver/40 font-bold block bg-transparent">
                              Diagnostic Projection:
                            </span>
                            <p className="text-[11.5px] text-brand-white font-sans font-medium leading-relaxed mt-1 bg-transparent border-l border-brand-green/40 pl-2">
                              Question: Will outbound volume velocity and account clustering exceed regulatory compliance thresholds?
                            </p>
                          </div>
                          <div className="h-32 w-full mt-1 bg-transparent">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={animatedRiskProjection.length > 0 ? animatedRiskProjection : simResult.riskProjection}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.01)" />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.35)" fontSize={9} />
                                <YAxis stroke="rgba(255,255,255,0.35)" fontSize={9} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#111215', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', fontSize: '10px' }} 
                                />
                                <Line type="monotone" dataKey="risk" stroke="#2ECC71" strokeWidth={2} name="Concentration Index" isAnimationActive={false} />
                                <Line type="monotone" dataKey="nodeCount" stroke="#7C5CFC" strokeWidth={1} name="Account Connections" isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                )}

                {/* TABCONTENT: EXECUTIVE CONSULTING REPORT LOG */}
                {activeTab === 'report' && (
                  <div className="space-y-5 text-left select-none bg-transparent">
                    
                    <div className="space-y-1 select-none bg-transparent">
                      <div className="flex items-center gap-1 text-brand-green bg-transparent">
                        <FileText className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest font-mono bg-transparent">
                          Executive Audit Report
                        </h3>
                      </div>
                      <p className="text-[11px] text-brand-silver/60 leading-relaxed font-sans bg-transparent">
                        Standardized report layout for audit reviews, compliance handovers, and executive briefs.
                      </p>
                    </div>

                    {/* Consulting Form Style Paper Mock */}
                    <div className="bg-[#FAF9F5] text-neutral-900 p-5 rounded-lg border border-[#D5D2C2] shadow-sm font-sans space-y-4 max-h-[500px] overflow-y-auto card-report select-text selection:bg-neutral-300">
                      
                      {/* Paper head */}
                      <div className="border-b-2 border-neutral-900 pb-3 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono uppercase font-black tracking-widest block text-neutral-500 bg-transparent">
                            AUDIT BRIEF DOCUMENT
                          </span>
                          <h4 className="text-sm font-extrabold tracking-tight text-neutral-900 uppercase leading-none bg-transparent font-sans">
                            CHIMERA RISK SUMMARY
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 bg-transparent">
                          {new Date().toISOString().substring(0, 10)}
                        </span>
                      </div>

                      {/* Section I: Legal & Security Overview */}
                      <div className="space-y-1 bg-transparent">
                        <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-neutral-800 block bg-transparent">
                          I. Overview
                        </span>
                        <p className="text-[11.5px] leading-relaxed text-neutral-700 font-sans bg-transparent">
                          A structural evaluation of transaction histories and relational ledger items confirms a pattern of capital concentration routed securely to offshore corporate holdings registered inside Panama. Audit logs isolate significant temporal accelerations preceding reporting quarters, pointing to a systemic target bypass protocol.
                        </p>
                      </div>

                      {/* Section II: Key Detections list */}
                      <div className="space-y-1.5 bg-transparent">
                        <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-neutral-800 block bg-transparent">
                          II. Observed Patterns
                        </span>
                        <div className="space-y-2 bg-transparent">
                          {highlightedFindings.map((finding, idx) => (
                            <div key={idx} className="p-2.5 bg-neutral-100/70 border border-neutral-200 rounded text-[11px] space-y-0.5 text-left font-sans">
                              <span className="font-extrabold text-neutral-900 block font-sans bg-transparent">{finding.headline}</span>
                              <span className="text-neutral-600 block font-sans bg-transparent">{finding.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section III: Chronological timeline */}
                      <div className="space-y-2 bg-transparent">
                        <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-neutral-800 block bg-transparent">
                          III. Audit Timeline
                        </span>
                        <div className="space-y-2.5 bg-transparent">
                          {activeCase?.timeline.slice(0, 3).map((evt) => (
                            <div key={evt.id} className="text-[10.5px] border-l border-neutral-300 pl-2.5 space-y-0.5 text-left font-sans bg-transparent">
                              <div className="flex justify-between items-center bg-transparent">
                                <span className="font-bold text-neutral-800 bg-transparent font-sans">{evt.title}</span>
                                <span className="text-[9.5px] font-mono text-neutral-500 bg-transparent">{evt.timestamp}</span>
                              </div>
                              <p className="text-neutral-600 leading-relaxed bg-transparent">{evt.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section IV: Recommendations */}
                      <div className="space-y-1 bg-transparent">
                        <span className="text-[10px] font-mono tracking-wider font-extrabold uppercase text-neutral-800 block bg-transparent font-sans">
                          IV. Recommended Steps
                        </span>
                        <div className="space-y-1 text-[11px] leading-relaxed text-neutral-700 font-sans pl-3 list-decimal bg-transparent">
                          <div className="bg-transparent font-sans">1. Temporarily restrict accounts flagged with anomalous transaction patterns.</div>
                          <div className="bg-transparent font-sans">2. Implement dual-factor authentication on administrative account logins.</div>
                          <div className="bg-transparent font-sans">3. Verify ultimate beneficial owner records against regional business registries.</div>
                        </div>
                      </div>

                    </div>

                    {/* Download dossier simulation */}
                    <button
                      onClick={handleDownloadDossier}
                      className="w-full py-2.5 bg-brand-green hover:bg-brand-green/90 text-brand-bg rounded-lg text-xs font-mono font-black transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 border border-brand-green/30"
                    >
                      <FileDown className="w-4 h-4 text-brand-bg" />
                      <span>Export Document</span>
                    </button>

                  </div>
                )}

              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         MODAL DIALOG: Smooth trace detail overlay for single finding explanations
         ========================================================================= */}
      <AnimatePresence>
        {activeObservationExplanation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-lg bg-brand-card border border-brand-card/85 rounded-2xl overflow-hidden shadow-2xl z-60 text-left"
            >
              {/* Header */}
              <div className="px-5 py-4 bg-brand-sec border-b border-brand-card/45 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-brand-green animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#D1D5DB]">
                    Detailed Insight Breakdown
                  </span>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playClickTone();
                    setActiveObservationExplanation(null);
                  }}
                  className="p-1 px-2.5 rounded bg-white/5 hover:bg-white/10 text-brand-silver hover:text-white text-xs select-none cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-left font-sans bg-transparent">
                
                <div className="space-y-1 bg-transparent text-left">
                  <h3 className="text-sm font-sans font-extrabold text-white">
                    {activeObservationExplanation.title}
                  </h3>
                  <p className="text-[12.5px] text-brand-white leading-relaxed bg-transparent font-sans">
                    {activeObservationExplanation.context}
                  </p>
                </div>

                <div className="space-y-1.5 bg-transparent text-left">
                  <span className="text-[9px] font-mono uppercase text-brand-green font-extrabold tracking-widest block bg-transparent">
                    Why This Finding Matters
                  </span>
                  <p className="text-[12.2px] text-[#BFC5CD] leading-relaxed bg-transparent font-sans">
                    {activeObservationExplanation.whyItMatters}
                  </p>
                </div>

                <div className="space-y-1.5 bg-transparent text-left">
                  <span className="text-[9px] font-mono uppercase text-[#BFC5CD]/60 font-bold block bg-transparent">
                    Analysis Methodology
                  </span>
                  <p className="text-[11.5px] text-[#BFC5CD] italic bg-transparent font-sans">
                    {activeObservationExplanation.methodology}
                  </p>
                </div>

                {/* Tactical mitigation steps */}
                <div className="space-y-2 bg-transparent select-none text-left">
                  <span className="text-[9px] font-mono uppercase text-brand-silver/50 font-bold block bg-transparent bg-transparent">
                    Next Mitigation Actions
                  </span>
                  <div className="space-y-1.5 bg-transparent">
                    {activeObservationExplanation.mitigationSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-center text-brand-white leading-normal bg-transparent text-left">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 bg-transparent" />
                        <span className="text-[12px] bg-transparent font-sans">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer action */}
              <div className="px-5 py-3 bg-brand-sec border-t border-brand-card/45 flex justify-end">
                <button
                  onClick={() => {
                    soundEngine.playClickTone();
                    setActiveObservationExplanation(null);
                  }}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green/90 text-brand-bg font-sans font-bold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Acknowledge Detail
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
