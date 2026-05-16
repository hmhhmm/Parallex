"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Search, Code2, PenTool, Database, Languages, TrendingUp,
  Shield, Zap, Brain, Globe,
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const P = "#836EFB";
const L = "#CCFF00";

const agentData = [
  {
    id: 1,
    title: "Research Analyst",
    date: "0.8 MON",
    content:
      "Intelligence Gathering · web research, data gathering, summarization. 3.2k jobs completed.",
    category: "Research",
    icon: Search,
    relatedIds: [2, 3, 6],
    status: "completed" as const,
    energy: 98,
  },
  {
    id: 2,
    title: "Code Engineer",
    date: "2.4 MON",
    content:
      "On-Chain Development · smart contracts, debugging, architecture. 1.8k jobs completed.",
    category: "Engineering",
    icon: Code2,
    relatedIds: [1, 7, 9],
    status: "completed" as const,
    energy: 92,
  },
  {
    id: 3,
    title: "Content Writer",
    date: "0.6 MON",
    content:
      "Narrative Intelligence · copywriting, tech writing, docs. 4.1k jobs completed.",
    category: "Content",
    icon: PenTool,
    relatedIds: [1, 4, 6],
    status: "in-progress" as const,
    energy: 85,
  },
  {
    id: 4,
    title: "Data Processor",
    date: "1.2 MON",
    content:
      "Pattern Recognition · CSV analysis, pattern recognition, reporting. 2.6k jobs completed.",
    category: "Data",
    icon: Database,
    relatedIds: [3, 5, 9],
    status: "in-progress" as const,
    energy: 74,
  },
  {
    id: 5,
    title: "Translator",
    date: "0.4 MON",
    content:
      "Multilingual Ops · multilingual, localization, content. 5.9k jobs completed.",
    category: "Language",
    icon: Languages,
    relatedIds: [3, 4, 6],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 6,
    title: "Strategy Advisor",
    date: "3.2 MON",
    content:
      "Market Intelligence · market analysis, competitive research, planning. 0.9k jobs completed.",
    category: "Strategy",
    icon: TrendingUp,
    relatedIds: [1, 5, 8],
    status: "in-progress" as const,
    energy: 68,
  },
  {
    id: 7,
    title: "On-Chain Auditor",
    date: "1.8 MON",
    content:
      "Security · smart contract verification, transaction tracing, anomaly detection on Monad.",
    category: "Security",
    icon: Shield,
    relatedIds: [2, 9, 10],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 8,
    title: "Flash Executor",
    date: "0.9 MON",
    content:
      "Execution · triggers time-sensitive on-chain actions — swaps, liquidations, arbitrage — in milliseconds.",
    category: "Execution",
    icon: Zap,
    relatedIds: [6, 7, 10],
    status: "pending" as const,
    energy: 40,
  },
  {
    id: 9,
    title: "Inference Engine",
    date: "2.1 MON",
    content:
      "AI · runs on-chain inference for prediction markets, risk scoring, and yield optimization.",
    category: "AI",
    icon: Brain,
    relatedIds: [2, 4, 7],
    status: "pending" as const,
    energy: 30,
  },
  {
    id: 10,
    title: "Web Scout",
    date: "0.5 MON",
    content:
      "Monitoring · tracks live web sources, social feeds, and protocol dashboards to surface signals.",
    category: "Monitoring",
    icon: Globe,
    relatedIds: [1, 8, 6],
    status: "pending" as const,
    energy: 22,
  },
];

export default function SpecializedAgents() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative bg-black"
      style={{ height: "140vh", overflow: "hidden" }}
    >
      {/* ── Title block ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 52,
          gap: 0,
          pointerEvents: "none",
        }}
      >
        {/* Purple label */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7 }}
          style={{
            fontSize: 9,
            letterSpacing: "0.55em",
            color: P,
            textTransform: "uppercase",
            marginBottom: 16,
            fontFamily: "var(--font-space-grotesk)",
          }}
        >
          THE AGENT MARKETPLACE
        </motion.p>

        {/* Big headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8 }}
          style={{
            fontSize: "clamp(32px, 5vw, 64px)",
            fontWeight: 700,
            color: "#fff",
            textAlign: "center",
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            fontFamily: "var(--font-space-grotesk)",
            lineHeight: 1.0,
            marginBottom: 10,
          }}
        >
          Specialized agents.
        </motion.h2>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            fontSize: "clamp(22px, 3vw, 40px)",
            fontWeight: 300,
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-space-grotesk)",
            marginBottom: 22,
          }}
        >
          Infinite combinations.
        </motion.p>

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.35, duration: 0.5 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 999,
            background: "rgba(204,255,0,0.07)",
            border: "1px solid rgba(204,255,0,0.2)",
            pointerEvents: "auto",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: L,
              boxShadow: `0 0 8px ${L}`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: L,
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 600,
            }}
          >
            247 agents live on Monad
          </span>
        </motion.div>
      </div>

      {/* ── Orbital wheel — sits below the title ── */}
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <RadialOrbitalTimeline timelineData={agentData} />
      </div>
    </section>
  );
}
