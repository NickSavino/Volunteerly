"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Code, Table, Zap, Database, BarChart2, Globe, Smartphone,
  TrendingUp, Settings, Lock, Bot, Cloud, Trophy,
  MessageCircle, PenLine, Users, Mic, Search, GraduationCap,
  DollarSign, Calendar, ClipboardList, Megaphone, Star, ChevronUp, Award,
  BookOpen, Briefcase, PieChart,
  type LucideIcon,
} from "lucide-react";

export type NodeStatus = "mastered" | "in_progress" | "locked";

export interface SkillNodeDef {
  id: string;
  label: string;
  iconKey: string;
  icon: LucideIcon;
  tier: number;
  col: number;
  trackedSkills: string[];
  threshold: number;
  requiresAny: string[][];
  description: string;
  requirementLabel: string;
}

export interface SkillNode extends SkillNodeDef {
  status: NodeStatus;
  current: number;
}

export const ICON_PATHS: Record<string, string> = {
  Code: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  Table: "M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18",
  Zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  Database: "M12 2C6.477 2 2 4.477 2 7s4.477 5 10 5 10-2.477 10-5S17.523 2 12 2zM2 7v5c0 2.523 4.477 5 10 5s10-2.477 10-5V7M2 12v5c0 2.523 4.477 5 10 5s10-2.477 10-5v-5",
  BarChart2: "M18 20V10M12 20V4M6 20v-6",
  Globe: "M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c-3 4-3 12 0 20m0-20c3 4 3 12 0 20M2 12h20",
  Smartphone: "M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zm-5 17a1 1 0 110-2 1 1 0 010 2z",
  TrendingUp: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  Settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm6.9-3a6.9 6.9 0 01-.07 1l1.57 1.23a.4.4 0 01.09.49l-1.5 2.6a.4.4 0 01-.48.17l-1.85-.74a7 7 0 01-1.73 1l-.28 1.96a.39.39 0 01-.39.34h-3a.39.39 0 01-.39-.34l-.28-1.97a7 7 0 01-1.73-1l-1.85.75a.4.4 0 01-.48-.17l-1.5-2.6a.39.39 0 01.09-.49l1.57-1.22A6.9 6.9 0 015.1 12a6.9 6.9 0 01.07-1L3.6 9.77a.4.4 0 01-.09-.49l1.5-2.6a.4.4 0 01.48-.17l1.85.74a7 7 0 011.73-1l.28-1.96A.39.39 0 019.74 4h3c.2 0 .36.14.39.34l.28 1.97a7 7 0 011.73 1l1.85-.75a.4.4 0 01.48.17l1.5 2.6a.39.39 0 01-.09.49L17.83 11A6.9 6.9 0 0118.9 12z",
  Lock: "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM12 15v3M12 11V7a4 4 0 00-8 0",
  Bot: "M12 2a2 2 0 012 2v2h4a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4V4a2 2 0 012-2zM8 13a1 1 0 102 0 1 1 0 00-2 0zm6 0a1 1 0 102 0 1 1 0 00-2 0zM9 17h6",
  Cloud: "M18 10a6 6 0 00-11.94-.9A5 5 0 006 19h12a4 4 0 000-8z",
  Trophy: "M8 21h8m-4-4v4M6 3H3v5a6 6 0 006 6 6 6 0 006-6V3h-3M6 3h12",
  MessageCircle: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  PenLine: "M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z",
  Users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm8 4a4 4 0 00-4-4M23 21v-2a4 4 0 00-3-3.87",
  Mic: "M12 1a3 3 0 013 3v8a3 3 0 01-6 0V4a3 3 0 013-3zm-7 9a7 7 0 0014 0M12 19v4m-4 0h8",
  Search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  GraduationCap: "M22 10v6M2 10l10-5 10 5-10 5-10-5zm6.5 5.5v4l3.5 2 3.5-2v-4",
  DollarSign: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  Calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  ClipboardList: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  Megaphone: "M21 13V6a1 1 0 00-1.447-.894L13 8.5V5a1 1 0 00-1-1H8a1 1 0 00-1 1v10a1 1 0 001 1h4a1 1 0 001-1v-3.5l6.553 3.394A1 1 0 0021 15v-2zm-9 4H8m1 4h2",
  Star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  ChevronUp: "M18 15l-6-6-6 6",
  Award: "M12 15a7 7 0 100-14 7 7 0 000 14zm0 0v6m-3-3h6",
  BookOpen: "M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zm20 0h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z",
  Briefcase: "M20 7H4a2 2 0 00-2 2v11a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zm-8 11v-5m-4-6V5a2 2 0 012-2h4a2 2 0 012 2v2",
  PieChart: "M21.21 15.89A10 10 0 118 2.83M22 12A10 10 0 0012 2v10z",
};

export const ALL_NODE_LABELS: Record<string, string> = {};

export const TECH_NODES: SkillNodeDef[] = [
  {
    id: "javascript", label: "JS Basics", iconKey: "Zap", icon: Zap,
    tier: 1, col: 0,
    trackedSkills: ["JavaScript", "TypeScript"],
    threshold: 2, requiresAny: [],
    description: "Use JavaScript or TypeScript in volunteer web projects.",
    requirementLabel: "Log JavaScript or TypeScript in 2 opportunities",
  },
  {
    id: "python", label: "Python Basics", iconKey: "Code", icon: Code,
    tier: 1, col: 1,
    trackedSkills: ["Python"],
    threshold: 2, requiresAny: [],
    description: "Use Python scripting or automation in volunteer work.",
    requirementLabel: "Log Python in 2 opportunities",
  },
  {
    id: "accounting", label: "Bookkeeping", iconKey: "BookOpen", icon: BookOpen,
    tier: 1, col: 2,
    trackedSkills: ["Accounting", "Bookkeeping"],
    threshold: 2, requiresAny: [],
    description: "Apply bookkeeping and accounting practices in volunteer finance roles.",
    requirementLabel: "Log Accounting or Bookkeeping in 2 opportunities",
  },
  {
    id: "excel", label: "Spreadsheets", iconKey: "Table", icon: Table,
    tier: 1, col: 3,
    trackedSkills: ["Excel"],
    threshold: 2, requiresAny: [],
    description: "Use Excel spreadsheets to manage or analyse data for organisations.",
    requirementLabel: "Log Excel in 2 opportunities",
  },
  {
    id: "mobile", label: "Mobile Dev", iconKey: "Smartphone", icon: Smartphone,
    tier: 1, col: 4,
    trackedSkills: ["Mobile Development"],
    threshold: 2, requiresAny: [],
    description: "Build mobile apps that serve community organisations.",
    requirementLabel: "Log Mobile Development in 2 opportunities",
  },

  {
    id: "webdev", label: "Web Dev", iconKey: "Globe", icon: Globe,
    tier: 2, col: 0,
    trackedSkills: ["JavaScript", "TypeScript", "React", "Node.js", "UI/UX Design"],
    threshold: 3, requiresAny: [["javascript"]],
    description: "Build web interfaces and full-stack apps for nonprofits.",
    requirementLabel: "Unlock JS Basics, then log any web dev skills in 3 opportunities",
  },
  {
    id: "sql", label: "SQL / DBs", iconKey: "Database", icon: Database,
    tier: 2, col: 1,
    trackedSkills: ["SQL", "Databases"],
    threshold: 2, requiresAny: [["python"]],
    description: "Write SQL queries and work with databases in volunteer systems.",
    requirementLabel: "Unlock Python Basics, then log SQL or Databases in 2 opportunities",
  },
  {
    id: "finance", label: "Finance", iconKey: "Briefcase", icon: Briefcase,
    tier: 2, col: 2,
    trackedSkills: ["Finance", "Budgeting"],
    threshold: 2, requiresAny: [["accounting"]],
    description: "Manage budgets and financial planning for nonprofit organisations.",
    requirementLabel: "Unlock Bookkeeping, then log Finance or Budgeting in 2 opportunities",
  },
  {
    id: "powerbi", label: "Power BI", iconKey: "BarChart2", icon: BarChart2,
    tier: 2, col: 3,
    trackedSkills: ["Excel", "Data Analysis"],
    threshold: 3, requiresAny: [["excel"]],
    description: "Build dashboards and BI reports to drive org decisions.",
    requirementLabel: "Unlock Spreadsheets, then log Excel or Data Analysis across 3 combined opportunities",
  },
  {
    id: "cybersecurity", label: "Cyber Basics", iconKey: "Lock", icon: Lock,
    tier: 2, col: 4,
    trackedSkills: ["Cybersecurity"],
    threshold: 2, requiresAny: [["javascript", "python"]],
    description: "Apply security best practices across volunteer systems.",
    requirementLabel: "Unlock JS Basics or Python Basics, then log Cybersecurity in 2 opportunities",
  },

  {
    id: "devops", label: "DevOps & CI/CD", iconKey: "Settings", icon: Settings,
    tier: 3, col: 0,
    trackedSkills: ["DevOps", "Cloud (AWS/GCP/Azure)"],
    threshold: 3, requiresAny: [["webdev", "sql"]],
    description: "CI/CD pipelines, infrastructure, and deployment for volunteer tech.",
    requirementLabel: "Unlock Web Dev or SQL/DBs, then log DevOps or Cloud in 3 opportunities",
  },
  {
    id: "data_analysis", label: "Data Analyst", iconKey: "TrendingUp", icon: TrendingUp,
    tier: 3, col: 1,
    trackedSkills: ["Data Analysis", "Python", "SQL", "Excel"],
    threshold: 4,
    requiresAny: [["sql", "powerbi"]],
    description: "Full data analysis — reachable via Python/SQL or Excel/Power BI.",
    requirementLabel: "Unlock SQL/DBs or Power BI, then log Data Analysis, Python, SQL, or Excel in 4 total opportunities",
  },
  {
    id: "financial_analysis", label: "Finance Analyst", iconKey: "PieChart", icon: PieChart,
    tier: 3, col: 2,
    trackedSkills: ["Financial Analysis", "Excel", "Data Analysis"],
    threshold: 3, requiresAny: [["finance", "powerbi"]],
    description: "Analyse financial data and produce reports to guide org decisions.",
    requirementLabel: "Unlock Finance or Power BI, then log Financial Analysis, Excel, or Data Analysis in 3 opportunities",
  },
  {
    id: "networking_infra", label: "IT & Networks", iconKey: "Globe", icon: Globe,
    tier: 3, col: 3,
    trackedSkills: ["Networking", "IT Support", "Cybersecurity"],
    threshold: 3, requiresAny: [["cybersecurity"]],
    description: "Manage IT infrastructure and networking for volunteer organisations.",
    requirementLabel: "Unlock Cyber Basics, then log Networking, IT Support, or Cybersecurity in 3 opportunities",
  },
  {
    id: "mobile_advanced", label: "App Dev", iconKey: "Smartphone", icon: Smartphone,
    tier: 3, col: 4,
    trackedSkills: ["Mobile Development", "JavaScript", "TypeScript", "React"],
    threshold: 3, requiresAny: [["webdev"]],
    description: "Build advanced cross-platform applications for nonprofits.",
    requirementLabel: "Unlock Web Dev, then log Mobile Development, JavaScript, TypeScript, or React in 3 opportunities",
  },

  {
    id: "cloud", label: "Cloud Arch.", iconKey: "Cloud", icon: Cloud,
    tier: 4, col: 0,
    trackedSkills: ["Cloud (AWS/GCP/Azure)", "DevOps"],
    threshold: 4, requiresAny: [["devops", "networking_infra"]],
    description: "Design and manage scalable cloud-based systems for nonprofits.",
    requirementLabel: "Unlock DevOps or IT & Networks, then log Cloud or DevOps in 4 total opportunities",
  },
  {
    id: "machine_learning", label: "ML / AI", iconKey: "Bot", icon: Bot,
    tier: 4, col: 1,
    trackedSkills: ["Machine Learning"],
    threshold: 3, requiresAny: [["data_analysis"]],
    description: "Apply machine learning and AI in real nonprofit projects.",
    requirementLabel: "Unlock Data Analyst, then log Machine Learning in 3 opportunities",
  },
  {
    id: "business_intelligence", label: "Business Intel.", iconKey: "BarChart2", icon: BarChart2,
    tier: 4, col: 2,
    trackedSkills: ["Financial Analysis", "Data Analysis", "Excel"],
    threshold: 4, requiresAny: [["financial_analysis", "data_analysis"]],
    description: "Drive data-informed decisions across finance and operations.",
    requirementLabel: "Unlock Finance Analyst or Data Analyst, then log Financial Analysis, Data Analysis, or Excel in 4 opportunities",
  },
  {
    id: "it_management", label: "IT Management", iconKey: "Settings", icon: Settings,
    tier: 4, col: 3,
    trackedSkills: ["DevOps", "Cybersecurity", "Networking", "IT Support"],
    threshold: 4, requiresAny: [["networking_infra", "devops"]],
    description: "Oversee IT systems, security, and infrastructure for organisations.",
    requirementLabel: "Unlock IT & Networks or DevOps, then log DevOps, Cybersecurity, Networking, or IT Support in 4 opportunities",
  },
  {
    id: "product_dev", label: "Product Dev", iconKey: "Trophy", icon: Trophy,
    tier: 4, col: 4,
    trackedSkills: ["Mobile Development", "JavaScript", "TypeScript", "React", "UI/UX Design"],
    threshold: 4, requiresAny: [["mobile_advanced"]],
    description: "Lead end-to-end product development for nonprofit digital tools.",
    requirementLabel: "Unlock App Dev, then log Mobile Development, JavaScript, TypeScript, React, or UI/UX Design in 4 opportunities",
  },

  {
    id: "tech_expert", label: "Tech Expert", iconKey: "Trophy", icon: Trophy,
    tier: 5, col: 2,
    trackedSkills: ["Machine Learning", "Cloud (AWS/GCP/Azure)", "DevOps", "Data Analysis", "Financial Analysis", "Cybersecurity"],
    threshold: 6, requiresAny: [["machine_learning", "cloud", "business_intelligence", "it_management", "product_dev"]],
    description: "Recognised technical leader across engineering, data, and business paths.",
    requirementLabel: "Unlock any tier-4 node, then log Machine Learning, Cloud, DevOps, Data Analysis, Financial Analysis, or Cybersecurity in 6 total opportunities",
  },
];

export const NT_NODES: SkillNodeDef[] = [
  {
    id: "nt_communication", label: "Clear Comms", iconKey: "MessageCircle", icon: MessageCircle,
    tier: 1, col: 1,
    trackedSkills: ["Communication"],
    threshold: 2, requiresAny: [],
    description: "Demonstrate clear, effective communication in volunteer roles.",
    requirementLabel: "Log Communication in 2 opportunities",
  },
  {
    id: "nt_writing", label: "Written Comms", iconKey: "PenLine", icon: PenLine,
    tier: 1, col: 3,
    trackedSkills: ["Writing"],
    threshold: 2, requiresAny: [],
    description: "Professional writing, reports, and documentation for organisations.",
    requirementLabel: "Log Writing in 2 opportunities",
  },
  {
    id: "nt_teamwork", label: "Team Player", iconKey: "Users", icon: Users,
    tier: 1, col: 0,
    trackedSkills: ["Teamwork", "Adaptability"],
    threshold: 2, requiresAny: [],
    description: "Collaborate and adapt effectively in diverse volunteer teams.",
    requirementLabel: "Log Teamwork or Adaptability in 2 opportunities",
  },

  {
    id: "nt_public_speaking", label: "Public Speaking", iconKey: "Mic", icon: Mic,
    tier: 2, col: 1,
    trackedSkills: ["Public Speaking", "Communication"],
    threshold: 3, requiresAny: [["nt_communication"]],
    description: "Present, pitch, or speak on behalf of organisations.",
    requirementLabel: "Unlock Clear Comms, then log Public Speaking in 2 opportunities",
  },
  {
    id: "nt_research", label: "Researcher", iconKey: "Search", icon: Search,
    tier: 2, col: 3,
    trackedSkills: ["Research", "Critical Thinking"],
    threshold: 2, requiresAny: [["nt_writing"]],
    description: "Conduct structured research and produce insights for nonprofits.",
    requirementLabel: "Unlock Written Comms, then log Research in 2 opportunities",
  },
  {
    id: "nt_mentoring", label: "Mentor", iconKey: "GraduationCap", icon: GraduationCap,
    tier: 2, col: 0,
    trackedSkills: ["Mentoring", "Teaching"],
    threshold: 2, requiresAny: [["nt_teamwork"]],
    description: "Guide and develop other volunteers or community members.",
    requirementLabel: "Unlock Team Player, then log Mentoring or Teaching in 2 opportunities",
  },
  {
    id: "nt_fundraising", label: "Fundraiser", iconKey: "DollarSign", icon: DollarSign,
    tier: 2, col: 4,
    trackedSkills: ["Fundraising", "Networking"],
    threshold: 2, requiresAny: [["nt_communication"]],
    description: "Drive fundraising efforts and build donor or sponsor networks.",
    requirementLabel: "Unlock Clear Comms, then log Fundraising or Networking in 2 opportunities",
  },

  {
    id: "nt_event_planning", label: "Event Planning", iconKey: "Calendar", icon: Calendar,
    tier: 3, col: 1,
    trackedSkills: ["Event Planning", "Time Management"],
    threshold: 3,
    requiresAny: [["nt_public_speaking", "nt_mentoring", "nt_fundraising"]],
    description: "Organise and run volunteer events end-to-end.",
    requirementLabel: "Unlock Public Speaking, Mentor, or Fundraiser, then log Event Planning or Time Management in 3 opportunities",
  },
  {
    id: "nt_project_mgmt", label: "Project Mgmt", iconKey: "ClipboardList", icon: ClipboardList,
    tier: 3, col: 3,
    trackedSkills: ["Project Management", "Problem Solving"],
    threshold: 3, requiresAny: [["nt_research", "nt_mentoring"]],
    description: "Deliver projects on time with clear ownership and accountability.",
    requirementLabel: "Unlock Researcher or Mentor, then log Project Management or Problem Solving in 3 opportunities",
  },
  {
    id: "nt_marketing", label: "Marketer", iconKey: "Megaphone", icon: Megaphone,
    tier: 3, col: 4,
    trackedSkills: ["Marketing", "Social Media"],
    threshold: 2, requiresAny: [["nt_fundraising"]],
    description: "Promote causes and grow audiences using marketing and social media.",
    requirementLabel: "Unlock Fundraiser, then log Marketing or Social Media in 2 opportunities",
  },

  {
    id: "nt_leadership", label: "Team Leader", iconKey: "Star", icon: Star,
    tier: 4, col: 2,
    trackedSkills: ["Leadership"],
    threshold: 3, requiresAny: [["nt_event_planning", "nt_project_mgmt"]],
    description: "Lead volunteers, coordinate multi-person teams, own outcomes.",
    requirementLabel: "Unlock Event Planning or Project Mgmt, then log Leadership in 3 opportunities",
  },
  {
    id: "nt_strategy", label: "Strategy", iconKey: "ChevronUp", icon: ChevronUp,
    tier: 4, col: 4,
    trackedSkills: ["Problem Solving", "Critical Thinking", "Project Management"],
    threshold: 5,
    requiresAny: [["nt_project_mgmt", "nt_marketing"]],
    description: "Strategic planning and high-level decision-making for organisations.",
    requirementLabel: "Unlock Project Mgmt or Marketer, then log Problem Solving, Critical Thinking, or Project Management in 5 total opportunities",
  },

  {
    id: "nt_community_leader", label: "Community Leader", iconKey: "Award", icon: Award,
    tier: 5, col: 2,
    trackedSkills: ["Leadership", "Project Management", "Communication"],
    threshold: 8,
    requiresAny: [["nt_leadership"], ["nt_strategy"]],
    description: "Recognised community leader with broad impact across people, projects, and organisations.",
    requirementLabel: "Unlock both Team Leader and Strategy, then log Leadership, Project Management, or Communication in 8 total opportunities",
  },
];

[...TECH_NODES, ...NT_NODES].forEach((n) => { ALL_NODE_LABELS[n.id] = n.label; });

function prereqsMet(node: SkillNode, byId: Record<string, SkillNode>): boolean {
  if (node.requiresAny.length === 0) return true;
  return node.requiresAny.every((orGroup) =>
    orGroup.some((id) => byId[id]?.status === "mastered")
  );
}

export function computeNodes(defs: SkillNodeDef[], skillCounts: Record<string, number>): SkillNode[] {
  const map: Record<string, SkillNode> = {};

  for (const def of defs) {
    map[def.id] = { ...def, status: "locked", current: 0 };
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Object.keys(map)) {
      const node = map[id];
      const unlocked = prereqsMet(node, map);

      const current = unlocked
        ? defs.find((d) => d.id === id)!.trackedSkills.reduce((s, k) => s + (skillCounts[k] ?? 0), 0)
        : 0;

      let status: NodeStatus;
      if (!unlocked) {
        status = "locked";
      } else if (current >= node.threshold) {
        status = "mastered";
      } else if (current > 0) {
        status = "in_progress";
      } else {
        status = "locked";
      }

      if (map[id].status !== status || map[id].current !== current) {
        map[id] = { ...map[id], status, current };
        changed = true;
      }
    }
  }

  return defs.map((d) => map[d.id]);
}

export function useSkillTreeViewModel() {
  const [tab, setTab] = useState<"technical" | "nontechnical">("technical");
  const [selected, setSelected] = useState<SkillNode | null>(null);
  const [skillCounts, setSkillCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<Record<string, number>>("/current-volunteer/skill-counts")
      .then((data) => { if (!cancelled) { setSkillCounts(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err?.message ?? "Failed to load skill data"); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const counts = skillCounts ?? {};
  const techNodes = computeNodes(TECH_NODES, counts);
  const ntNodes = computeNodes(NT_NODES, counts);
  const nodes = tab === "technical" ? techNodes : ntNodes;

  const mastered = nodes.filter((n) => n.status === "mastered").length;
  const inProg = nodes.filter((n) => n.status === "in_progress").length;

  return {
    tab, setTab,
    selected, setSelected,
    nodes,
    loading,
    error,
    mastered,
    inProg,
  };
}