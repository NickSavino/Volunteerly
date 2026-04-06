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

const NODE_W = 72;
const NODE_H = 72;
const COL_GAP = 92;
const ROW_GAP = 116;
const PAD_X = 36;
const PAD_Y = 40;
const COLS = 5;
const MAX_TIER = 5;
 
function getPos(tier: number, col: number, svgH: number) {
  const x = PAD_X + col * COL_GAP + COL_GAP / 2;
  const y = svgH - PAD_Y - (tier - 1) * ROW_GAP - ROW_GAP / 2;
  return { x, y };
}

 
function prereqsMet(node: SkillNode, byId: Record<string, SkillNode>): boolean {
  if (node.requiresAny.length === 0) return true;
  return node.requiresAny.every((orGroup) =>
    orGroup.some((id) => byId[id]?.status === "mastered")
  );
}
 
function computeNodes(defs: SkillNodeDef[], skillCounts: Record<string, number>): SkillNode[] {
  const map: Record<string, SkillNode> = {};
 
  for (const def of defs) {
    const current = def.trackedSkills.reduce((s, k) => s + (skillCounts[k] ?? 0), 0);
    map[def.id] = { ...def, status: "locked", current };
  }
 
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of Object.keys(map)) {
      const node = map[id];
      const unlocked = prereqsMet(node, map);
 
      let status: NodeStatus;
      if (!unlocked) {
        status = "locked";
      } else if (node.current >= node.threshold) {
        status = "mastered";
      } else if (node.current > 0) {
        status = "in_progress";
      } else {
        status = "locked";
      }
 
      if (map[id].status !== status) {
        map[id] = { ...map[id], status };
        changed = true;
      }
    }
  }
 
  return defs.map((d) => map[d.id]);
}

function buildEdges(
  nodes: SkillNode[],
  svgH: number
): { x1: number; y1: number; x2: number; y2: number; lit: boolean }[] {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const edges: { x1: number; y1: number; x2: number; y2: number; lit: boolean }[] = [];
 
  for (const node of nodes) {
    const to = getPos(node.tier, node.col, svgH);
    for (const orGroup of node.requiresAny) {
      for (const reqId of orGroup) {
        const req = byId[reqId];
        if (!req) continue;
        const from = getPos(req.tier, req.col, svgH);
        edges.push({
          x1: from.x,
          y1: from.y - NODE_H / 2,   
          x2: to.x,
          y2: to.y + NODE_H / 2,   
          lit: req.status !== "locked",
        });
      }
    }
  }
  return edges;
}

function SkillTree({ nodes, onSelect, selectedId }: {
  nodes: SkillNode[];
  onSelect: (n: SkillNode) => void;
  selectedId: string | null;
}) {
  const svgW = PAD_X * 2 + COLS * COL_GAP;
  const svgH = PAD_Y * 2 + MAX_TIER * ROW_GAP;
  const edges = buildEdges(nodes, svgH);
 
  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" as any, padding: "0 20px 20px" }}>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} width={svgW} height={svgH} style={{ display: "block", minWidth: svgW }}>
        {edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={e.lit ? "var(--accent)" : "var(--line-locked)"}
            strokeWidth={2.5}
            strokeDasharray={e.lit ? "none" : "5 4"}
            opacity={e.lit ? 0.85 : 0.3}
          />
        ))}
        {nodes.map((node) => {
          const { x, y } = getPos(node.tier, node.col, svgH);
          return (
            <g key={node.id}
              transform={`translate(${x - NODE_W / 2},${y - NODE_H / 2})`}
              onClick={() => onSelect(node)}
              style={{ cursor: "pointer" }}>
              <TreeNode node={node} w={NODE_W} h={NODE_H} selected={selectedId === node.id} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
 
function TreeNode({ node, w, h, selected }: { node: SkillNode; w: number; h: number; selected: boolean }) {
  const r = 18;
  const fill =
    node.status === "mastered" ? "var(--mastered-fill)"
    : node.status === "in_progress" ? "var(--progress-fill)"
    : "var(--locked-fill)";
  const stroke = selected ? "var(--selected)"
    : node.status === "mastered" ? "var(--mastered-stroke)"
    : node.status === "in_progress" ? "var(--accent)"
    : "var(--locked-stroke)";
  const dimmed = node.status === "locked";
 
  return (
    <g>
      {node.status !== "locked" && (
        <rect x={-5} y={-5} width={w + 10} height={h + 10} rx={r + 5}
          fill={node.status === "mastered" ? "var(--mastered-glow)" : "var(--progress-glow)"}
          opacity={selected ? 0.55 : 0.22}
        />
      )}
      <rect x={0} y={0} width={w} height={h} rx={r}
        fill={fill} stroke={stroke} strokeWidth={selected ? 3 : 2}
      />
      <text x={w / 2} y={h / 2 - 5}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={23} opacity={dimmed ? 0.32 : 1}>
        {node.icon}
      </text>
      <text x={w / 2} y={h - 11}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={8} fontWeight="700"
        fill="var(--node-text)" opacity={dimmed ? 0.32 : 1}
        fontFamily="'DM Sans', sans-serif" letterSpacing="0.05em">
        {node.label.toUpperCase()}
      </text>
      {node.status === "mastered" && (
        <g transform={`translate(${w - 14}, -4)`}>
          <circle r={9} fill="#16A34A" />
          <text textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="white">✓</text>
        </g>
      )}
      {node.status === "in_progress" && node.current > 0 && (
        <g transform={`translate(${w - 14}, -4)`}>
          <circle r={9} fill="var(--accent)" />
          <text textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight="700" fill="#1E293B">
            {node.current}
          </text>
        </g>
      )}
    </g>
  );
}

function DetailPanel({ node, onClose }: { node: SkillNode; onClose: () => void }) {
  const pct = node.threshold > 0 ? Math.min(100, Math.round((node.current / node.threshold) * 100)) : 0;
  const statusLabel = node.status === "mastered" ? "Mastered" : node.status === "in_progress" ? "In Progress" : "Locked";
  const statusColor = node.status === "mastered" ? "#16A34A" : node.status === "in_progress" ? "var(--accent-stroke)" : "var(--locked-stroke)";
  const barColor = node.status === "mastered" ? "#16A34A" : node.status === "in_progress" ? "var(--accent)" : "var(--locked-stroke)";
 
  const prereqIds = [...new Set(node.requiresAny.flat())];
 
  return (
    <div className="st-panel" onClick={(e) => e.stopPropagation()}>
      <button className="st-panel-close" onClick={onClose}>✕</button>
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>{node.icon}</div>
      <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.01em" }}>
        {node.label}
      </div>
      <span style={{
        display: "inline-block", padding: "3px 11px", borderRadius: 99,
        fontSize: "0.7rem", fontWeight: 700, border: `1.5px solid ${statusColor}`,
        color: statusColor, marginBottom: 14, letterSpacing: "0.05em", textTransform: "uppercase" as const,
      }}>{statusLabel}</span>
 
      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
        {node.description}
      </p>
 
      <div className="st-section">
        <div className="st-section-label">🎯 Requirement</div>
        <div className="st-req-box">{node.requirementLabel}</div>
      </div>
 
      <div className="st-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span className="st-section-label">📊 Progress</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)" }}>
            {node.current} / {node.threshold}
          </span>
        </div>
        <div className="st-bar-bg">
          <div className="st-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textAlign: "right", marginTop: 3 }}>{pct}% complete</div>
      </div>
 
      <div className="st-section">
        <div className="st-section-label">🏷️ Skills That Count</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {node.trackedSkills.map((s) => (
            <span key={s} className="st-tag">{s}</span>
          ))}
        </div>
      </div>
 
      {prereqIds.length > 0 && (
        <div className="st-section">
          <div className="st-section-label">🔗 Requires</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {node.requiresAny.map((orGroup, i) => (
              <span key={i} className="st-tag">
                {orGroup.map((id) => id.replace(/^nt_/, "").replace(/_/g, " ")).join(" or ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SkillTreePage() {
  const [tab, setTab] = useState<"technical" | "nontechnical">("technical");
  const [selected, setSelected] = useState<SkillNode | null>(null);
  const [skillCounts, setSkillCounts] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
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
 
  return (
    <>
      <style>{`
        :root {
          --accent: #F5C842;
          --accent-stroke: #D4A017;
          --mastered-fill: #F5C842;
          --mastered-stroke: #D4A017;
          --mastered-glow: rgba(245,200,66,0.5);
          --progress-fill: #FEFCE8;
          --progress-glow: rgba(245,200,66,0.3);
          --locked-fill: #F1F5F9;
          --locked-stroke: #CBD5E1;
          --line-locked: #CBD5E1;
          --node-text: #1E293B;
          --selected: #3B82F6;
          --bg: #F8FAFC;
          --card: #FFFFFF;
          --border: #E2E8F0;
          --text: #0F172A;
          --text-muted: #64748B;
        }
        .st-page { min-height: 100vh; background: var(--bg); font-family: 'DM Sans','Segoe UI',sans-serif; }
        .st-header { max-width: 640px; margin: 0 auto; padding: 24px 20px 0; }
        .st-header h1 { font-size: 1.55rem; font-weight: 800; color: var(--text); margin: 0 0 4px; letter-spacing: -0.025em; }
        .st-header p { font-size: 0.83rem; color: var(--text-muted); margin: 0 0 18px; line-height: 1.5; }
        .st-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
        .st-chip { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; font-size: 0.77rem; font-weight: 600; border: 1.5px solid var(--border); background: var(--card); color: var(--text); }
        .st-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .st-tabs { display: flex; gap: 4px; background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 4px; width: fit-content; }
        .st-tab { padding: 7px 18px; border-radius: 9px; border: none; background: transparent; font-size: 0.82rem; font-weight: 700; cursor: pointer; color: var(--text-muted); transition: all 0.18s; white-space: nowrap; }
        .st-tab.active { background: #0F172A; color: #fff; }
        .st-canvas { position: relative; max-width: 640px; margin: 0 auto; padding-top: 12px; }
        .st-legend { position: absolute; top: 20px; right: 20px; background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 10px 14px; font-size: 0.73rem; z-index: 10; display: flex; flex-direction: column; gap: 6px; }
        .st-legend-item { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-weight: 500; }
        .st-legend-swatch { width: 13px; height: 13px; border-radius: 4px; flex-shrink: 0; }
        .st-panel-wrap { max-width: 640px; margin: 0 auto; padding: 0 20px 40px; }
        .st-panel { background: var(--card); border: 1.5px solid var(--border); border-radius: 20px; padding: 24px; position: relative; box-shadow: 0 4px 28px rgba(0,0,0,0.07); animation: stIn 0.18s ease; }
        @keyframes stIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .st-panel-close { position: absolute; top: 14px; right: 14px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.73rem; color: var(--text-muted); }
        .st-section { margin-bottom: 14px; }
        .st-section-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 6px; }
        .st-req-box { font-size: 0.82rem; font-weight: 600; color: var(--text); background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 12px; line-height: 1.4; }
        .st-bar-bg { height: 8px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 99px; overflow: hidden; }
        .st-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
        .st-tag { padding: 3px 10px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 99px; font-size: 0.72rem; font-weight: 600; color: var(--text); white-space: nowrap; }
        .st-hint { text-align: center; font-size: 0.74rem; color: var(--text-muted); padding: 4px 20px 12px; max-width: 640px; margin: 0 auto; }
        .st-loading { text-align: center; padding: 56px 20px; font-size: 0.85rem; color: var(--text-muted); }
        .st-error { text-align: center; padding: 56px 20px; font-size: 0.85rem; color: #EF4444; }
        @media (max-width: 480px) {
          .st-header h1 { font-size: 1.25rem; }
          .st-legend { display: none; }
        }
      `}</style>
 
      <div className="st-page" onClick={() => setSelected(null)}>
        <div className="st-header">
          <h1>Skill Tree</h1>
          <p>Skills unlock as you log what you use across completed opportunities. Start at the bottom — work your way up.</p>
 
          {!loading && !error && (
            <div className="st-stats">
              <div className="st-chip"><div className="st-dot" style={{ background: "#D4A017" }} />{mastered} Mastered</div>
              <div className="st-chip"><div className="st-dot" style={{ background: "#F5C842" }} />{inProg} In Progress</div>
              <div className="st-chip"><div className="st-dot" style={{ background: "#CBD5E1" }} />{nodes.length - mastered - inProg} Locked</div>
            </div>
          )}
 
          <div className="st-tabs">
            <button className={`st-tab${tab === "technical" ? " active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setTab("technical"); setSelected(null); }}>
              ⚡ Technical
            </button>
            <button className={`st-tab${tab === "nontechnical" ? " active" : ""}`}
              onClick={(e) => { e.stopPropagation(); setTab("nontechnical"); setSelected(null); }}>
              🌱 Non-Technical
            </button>
          </div>
        </div>
 
        {loading && <div className="st-loading">Loading your skills…</div>}
        {error && <div className="st-error">{error}</div>}
 
        {!loading && !error && (
          <>
            <div className="st-canvas">
              <div className="st-legend">
                <div className="st-legend-item">
                  <div className="st-legend-swatch" style={{ background: "#F5C842", border: "2px solid #D4A017" }} />Mastered
                </div>
                <div className="st-legend-item">
                  <div className="st-legend-swatch" style={{ background: "#FEFCE8", border: "2px solid #F5C842" }} />In Progress
                </div>
                <div className="st-legend-item">
                  <div className="st-legend-swatch" style={{ background: "#F1F5F9", border: "2px solid #CBD5E1" }} />Locked
                </div>
              </div>
              <SkillTree
                nodes={nodes}
                onSelect={(n) => setSelected((p) => p?.id === n.id ? null : n)}
                selectedId={selected?.id ?? null}
              />
            </div>
 
            {!selected && <p className="st-hint">Tap any node to see requirements and your progress</p>}
 
            {selected && (
              <div className="st-panel-wrap" onClick={(e) => e.stopPropagation()}>
                <DetailPanel node={selected} onClose={() => setSelected(null)} />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}