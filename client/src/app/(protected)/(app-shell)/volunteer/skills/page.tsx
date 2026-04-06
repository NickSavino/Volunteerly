"use client";
 
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
  
type NodeStatus = "mastered" | "in_progress" | "locked";
 
interface SkillNodeDef {
  id: string;
  label: string;
  icon: string;
  tier: number; 
  col: number;  
  trackedSkills: string[]; 
  threshold: number;
  requiresAny: string[][];
  description: string;
  requirementLabel: string;
}
 
interface SkillNode extends SkillNodeDef {
  status: NodeStatus;
  current: number;
}

const TECH_NODES: SkillNodeDef[] = [
  {
    id: "python", label: "Python", icon: "🐍",
    tier: 1, col: 1,
    trackedSkills: ["Python"],
    threshold: 2, requiresAny: [],
    description: "Use Python scripting or automation in volunteer work.",
    requirementLabel: "Log Python in 2 opportunities",
  },
  {
    id: "excel", label: "Excel", icon: "📊",
    tier: 1, col: 3,
    trackedSkills: ["Excel"],
    threshold: 2, requiresAny: [],
    description: "Use Excel spreadsheets to manage or analyse data for organisations.",
    requirementLabel: "Log Excel in 2 opportunities",
  },
  {
    id: "javascript", label: "JavaScript", icon: "⚡",
    tier: 1, col: 0,
    trackedSkills: ["JavaScript", "TypeScript"],
    threshold: 2, requiresAny: [],
    description: "Use JavaScript or TypeScript in volunteer web projects.",
    requirementLabel: "Log JavaScript or TypeScript in 2 opportunities",
  },
 
  {
    id: "sql", label: "SQL / DBs", icon: "🗄️",
    tier: 2, col: 1,
    trackedSkills: ["SQL", "Databases"],
    threshold: 2, requiresAny: [["python"]],
    description: "Write SQL queries and work with databases in volunteer systems.",
    requirementLabel: "Unlock Python, then log SQL or Databases in 2 opportunities",
  },
  {
    id: "powerbi", label: "Power BI", icon: "📉",
    tier: 2, col: 3,
    trackedSkills: ["Excel", "Data Analysis"],
    threshold: 3, requiresAny: [["excel"]],
    description: "Build dashboards and BI reports to drive org decisions.",
    requirementLabel: "Unlock Excel, then log Excel + Data Analysis across 3 combined opportunities",
  },
  {
    id: "webdev", label: "Web Dev", icon: "🌐",
    tier: 2, col: 0,
    trackedSkills: ["JavaScript", "TypeScript", "React", "Node.js", "UI/UX Design"],
    threshold: 3, requiresAny: [["javascript"]],
    description: "Build web interfaces and full-stack apps for nonprofits.",
    requirementLabel: "Unlock JavaScript, then log any web dev skills in 3 opportunities",
  },
  {
    id: "mobile", label: "Mobile Dev", icon: "📱",
    tier: 2, col: 4,
    trackedSkills: ["Mobile Development"],
    threshold: 2, requiresAny: [["javascript"]],
    description: "Build mobile apps that serve community organisations.",
    requirementLabel: "Unlock JavaScript, then log Mobile Development in 2 opportunities",
  },

  {
    id: "data_analysis", label: "Data Analysis", icon: "📈",
    tier: 3, col: 2,
    trackedSkills: ["Data Analysis", "Python", "SQL", "Excel"],
    threshold: 4,
    requiresAny: [["sql", "powerbi"]],
    description: "Full data analysis — reachable via Python/SQL or Excel/Power BI.",
    requirementLabel: "Unlock SQL/DBs OR Power BI, then log any data skills in 4 total opportunities",
  },
  {
    id: "devops", label: "DevOps", icon: "⚙️",
    tier: 3, col: 0,
    trackedSkills: ["DevOps", "Cloud (AWS/GCP/Azure)"],
    threshold: 3, requiresAny: [["webdev"]],
    description: "CI/CD pipelines, infrastructure, and deployment for volunteer tech.",
    requirementLabel: "Unlock Web Dev, then log DevOps or Cloud in 3 opportunities",
  },
  {
    id: "cybersecurity", label: "Cybersecurity", icon: "🔐",
    tier: 3, col: 1,
    trackedSkills: ["Cybersecurity"],
    threshold: 2, requiresAny: [["sql"]],
    description: "Apply security best practices across volunteer systems.",
    requirementLabel: "Unlock SQL/DBs, then log Cybersecurity in 2 opportunities",
  },

  {
    id: "machine_learning", label: "ML / AI", icon: "🤖",
    tier: 4, col: 2,
    trackedSkills: ["Machine Learning"],
    threshold: 3, requiresAny: [["data_analysis"]],
    description: "Apply machine learning and AI in real nonprofit projects.",
    requirementLabel: "Unlock Data Analysis, then log Machine Learning in 3 opportunities",
  },
  {
    id: "cloud", label: "Cloud Arch.", icon: "☁️",
    tier: 4, col: 0,
    trackedSkills: ["Cloud (AWS/GCP/Azure)", "DevOps"],
    threshold: 4, requiresAny: [["devops"]],
    description: "Design and manage scalable cloud-based systems for nonprofits.",
    requirementLabel: "Unlock DevOps, then log Cloud or DevOps in 4 total opportunities",
  },

  {
    id: "tech_expert", label: "Tech Expert", icon: "🏆",
    tier: 5, col: 2,
    trackedSkills: ["Machine Learning", "Cloud (AWS/GCP/Azure)", "DevOps", "Data Analysis"],
    threshold: 6, requiresAny: [["machine_learning"]],
    description: "Recognised technical leader — reachable via dev OR business paths.",
    requirementLabel: "Unlock ML/AI, then log 6 total advanced tech skills",
  },
];

const NT_NODES: SkillNodeDef[] = [
  {
    id: "nt_communication", label: "Communication", icon: "💬",
    tier: 1, col: 1,
    trackedSkills: ["Communication"],
    threshold: 2, requiresAny: [],
    description: "Demonstrate clear, effective communication in volunteer roles.",
    requirementLabel: "Log Communication in 2 opportunities",
  },
  {
    id: "nt_writing", label: "Writing", icon: "✍️",
    tier: 1, col: 3,
    trackedSkills: ["Writing"],
    threshold: 2, requiresAny: [],
    description: "Professional writing, reports, and documentation for organisations.",
    requirementLabel: "Log Writing in 2 opportunities",
  },
  {
    id: "nt_teamwork", label: "Teamwork", icon: "🤝",
    tier: 1, col: 0,
    trackedSkills: ["Teamwork", "Adaptability"],
    threshold: 2, requiresAny: [],
    description: "Collaborate and adapt effectively in diverse volunteer teams.",
    requirementLabel: "Log Teamwork or Adaptability in 2 opportunities",
  },
 
  {
    id: "nt_public_speaking", label: "Public Speaking", icon: "🎤",
    tier: 2, col: 1,
    trackedSkills: ["Public Speaking", "Communication"],
    threshold: 3, requiresAny: [["nt_communication"]],
    description: "Present, pitch, or speak on behalf of organisations.",
    requirementLabel: "Unlock Communication, then log Public Speaking in 2 opportunities",
  },
  {
    id: "nt_research", label: "Research", icon: "🔍",
    tier: 2, col: 3,
    trackedSkills: ["Research", "Critical Thinking"],
    threshold: 2, requiresAny: [["nt_writing"]],
    description: "Conduct structured research and produce insights for nonprofits.",
    requirementLabel: "Unlock Writing, then log Research in 2 opportunities",
  },
  {
    id: "nt_mentoring", label: "Mentoring", icon: "🧑‍🏫",
    tier: 2, col: 0,
    trackedSkills: ["Mentoring", "Teaching"],
    threshold: 2, requiresAny: [["nt_teamwork"]],
    description: "Guide and develop other volunteers or community members.",
    requirementLabel: "Unlock Teamwork, then log Mentoring or Teaching in 2 opportunities",
  },
  {
    id: "nt_fundraising", label: "Fundraising", icon: "💰",
    tier: 2, col: 4,
    trackedSkills: ["Fundraising", "Networking"],
    threshold: 2, requiresAny: [["nt_communication"]],
    description: "Drive fundraising efforts and build donor or sponsor networks.",
    requirementLabel: "Unlock Communication, then log Fundraising or Networking in 2 opportunities",
  },
 
  {
    id: "nt_event_planning", label: "Event Planning", icon: "📅",
    tier: 3, col: 1,
    trackedSkills: ["Event Planning", "Time Management"],
    threshold: 3,
    requiresAny: [["nt_public_speaking", "nt_mentoring"]],
    description: "Organise and run volunteer events end-to-end.",
    requirementLabel: "Unlock Public Speaking OR Mentoring, then log Event Planning in 3 opportunities",
  },
  {
    id: "nt_project_mgmt", label: "Project Mgmt", icon: "📋",
    tier: 3, col: 3,
    trackedSkills: ["Project Management", "Problem Solving"],
    threshold: 3, requiresAny: [["nt_research"]],
    description: "Deliver projects on time with clear ownership and accountability.",
    requirementLabel: "Unlock Research, then log Project Management in 3 opportunities",
  },
  {
    id: "nt_marketing", label: "Marketing", icon: "📣",
    tier: 3, col: 4,
    trackedSkills: ["Marketing", "Social Media"],
    threshold: 2, requiresAny: [["nt_fundraising"]],
    description: "Promote causes and grow audiences using marketing and social media.",
    requirementLabel: "Unlock Fundraising, then log Marketing or Social Media in 2 opportunities",
  },
 
  {
    id: "nt_leadership", label: "Leadership", icon: "⭐",
    tier: 4, col: 2,
    trackedSkills: ["Leadership"],
    threshold: 3, requiresAny: [["nt_event_planning"]],
    description: "Lead volunteers, coordinate multi-person teams, own outcomes.",
    requirementLabel: "Unlock Event Planning, then log Leadership in 3 opportunities",
  },
  {
    id: "nt_strategy", label: "Strategy", icon: "♟️",
    tier: 4, col: 4,
    trackedSkills: ["Problem Solving", "Critical Thinking", "Project Management"],
    threshold: 5,
    requiresAny: [["nt_project_mgmt", "nt_marketing"]],
    description: "Strategic planning and high-level decision-making for organisations.",
    requirementLabel: "Unlock Project Mgmt AND Marketing, then log strategic skills in 5 total opportunities",
  },
 
  {
    id: "nt_community_leader", label: "Community Leader", icon: "🌟",
    tier: 5, col: 2,
    trackedSkills: ["Leadership", "Project Management", "Communication"],
    threshold: 8,
    requiresAny: [["nt_leadership", "nt_strategy"]],
    description: "Recognised community leader with broad impact across people, projects, and organisations.",
    requirementLabel: "Unlock Leadership AND Strategy, then log 8 total leadership skills",
  },
];