"use client";

import React from "react";
import { ALL_NODE_LABELS, ICON_PATHS, useSkillTreeViewModel, type SkillNode } from "./skillTreeVm";

const NODE_W = 88;
const NODE_H = 88;
const COL_GAP = 124;
const ROW_GAP = 160;
const PAD_X = 56;
const PAD_Y = 56;
const COLS = 5;
const MAX_TIER = 5;

const TIER_OFFSET_X: Record<number, number> = {
    1: 0,
    2: 28,
    3: -14,
    4: 20,
    5: 0,
};

function getPos(tier: number, col: number, svgH: number) {
    const baseX = PAD_X + col * COL_GAP + COL_GAP / 2;
    const x = baseX + (TIER_OFFSET_X[tier] ?? 0);
    const y = svgH - PAD_Y - (tier - 1) * ROW_GAP - ROW_GAP / 2;
    return { x, y };
}

function buildEdges(
    nodes: SkillNode[],
    svgH: number,
): { x1: number; y1: number; x2: number; y2: number; lit: boolean; mastered: boolean }[] {
    const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
    const edges: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        lit: boolean;
        mastered: boolean;
    }[] = [];

    for (const node of nodes) {
        const to = getPos(node.tier, node.col, svgH);
        for (const orGroup of node.requiresAny) {
            for (const reqId of orGroup) {
                const req = byId[reqId];
                if (!req) continue;
                if (node.tier - req.tier !== 1) continue;
                const from = getPos(req.tier, req.col, svgH);
                edges.push({
                    x1: from.x,
                    y1: from.y - NODE_H / 2,
                    x2: to.x,
                    y2: to.y + NODE_H / 2,
                    lit: req.status !== "locked",
                    mastered: req.status === "mastered",
                });
            }
        }
    }
    return edges;
}

function CurvedEdge({
    x1,
    y1,
    x2,
    y2,
    lit,
    mastered,
}: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lit: boolean;
    mastered: boolean;
}) {
    const cy = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
    const colour = mastered ? "var(--mastered-edge)" : lit ? "var(--accent)" : "var(--line-locked)";
    return (
        <path
            d={d}
            fill="none"
            stroke={colour}
            strokeWidth={lit ? 2.5 : 2}
            strokeDasharray={lit ? "none" : "5 4"}
            opacity={lit ? 0.7 : 0.55}
        />
    );
}

function SkillTree({
    nodes,
    onSelect,
    selectedId,
}: {
    nodes: SkillNode[];
    onSelect: (n: SkillNode) => void;
    selectedId: string | null;
}) {
    const svgW = PAD_X * 2 + COLS * COL_GAP + 40;
    const svgH = PAD_Y * 2 + MAX_TIER * ROW_GAP;
    const edges = buildEdges(nodes, svgH);

    return (
        <div
            style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
                padding: "0 20px 20px",
            }}
        >
            <svg
                viewBox={`0 0 ${svgW} ${svgH}`}
                width={svgW}
                height={svgH}
                style={{ display: "block", minWidth: svgW }}
            >
                {edges.map((e, i) => (
                    <CurvedEdge key={i} {...e} />
                ))}
                {nodes.map((node) => {
                    const { x, y } = getPos(node.tier, node.col, svgH);
                    return (
                        <g
                            key={node.id}
                            transform={`translate(${x - NODE_W / 2},${y - NODE_H / 2})`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(node);
                            }}
                            style={{ cursor: "pointer" }}
                        >
                            <TreeNode
                                node={node}
                                w={NODE_W}
                                h={NODE_H}
                                selected={selectedId === node.id}
                            />
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function TreeNode({
    node,
    w,
    h,
    selected,
}: {
    node: SkillNode;
    w: number;
    h: number;
    selected: boolean;
}) {
    const r = 20;
    const fill =
        node.status === "mastered"
            ? "var(--mastered-fill)"
            : node.status === "in_progress"
              ? "var(--progress-fill)"
              : "var(--locked-fill)";
    const stroke = selected
        ? "var(--selected)"
        : node.status === "mastered"
          ? "var(--mastered-stroke)"
          : node.status === "in_progress"
            ? "var(--accent)"
            : "var(--locked-stroke)";
    const dimmed = node.status === "locked";

    const words = node.label.toUpperCase().split(" ");
    const mid = Math.ceil(words.length / 2);
    const line1 = words.slice(0, mid).join(" ");
    const line2 = words.slice(mid).join(" ");
    const hasTwo = line2.length > 0;

    const scale = 26 / 24;
    const iconPath = ICON_PATHS[node.iconKey] ?? "";

    return (
        <g>
            {node.status !== "locked" && (
                <rect
                    x={-7}
                    y={-7}
                    width={w + 14}
                    height={h + 14}
                    rx={r + 7}
                    fill={
                        node.status === "mastered" ? "var(--mastered-glow)" : "var(--progress-glow)"
                    }
                    opacity={selected ? 0.6 : 0.18}
                />
            )}
            <rect x={3} y={5} width={w} height={h} rx={r} fill="rgba(0,0,0,0.06)" />
            <rect
                x={0}
                y={0}
                width={w}
                height={h}
                rx={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={selected ? 3 : 2}
            />
            <g
                transform={`translate(${(w - 20) / 2}, ${h / 2 - 20}) scale(${scale})`}
                opacity={dimmed ? 0.55 : 1}
                stroke={
                    dimmed
                        ? "#94A3B8"
                        : node.status === "mastered"
                          ? "#7C2D12"
                          : node.status === "in_progress"
                            ? "#D97706"
                            : "#94A3B8"
                }
                strokeWidth={1.5 / scale}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                pointerEvents="none"
            >
                <path d={iconPath} />
            </g>
            <text
                textAnchor="middle"
                fontSize={9}
                fontWeight="700"
                fill={
                    dimmed
                        ? "var(--text-muted)"
                        : node.status === "mastered"
                          ? "#7C2D12"
                          : "var(--node-text)"
                }
                opacity={dimmed ? 0.75 : 1}
                fontFamily="'DM Sans', sans-serif"
                letterSpacing="0.04em"
                pointerEvents="none"
            >
                <tspan x={w / 2} y={hasTwo ? h - 17 : h - 12}>
                    {line1}
                </tspan>
                {hasTwo && (
                    <tspan x={w / 2} dy={10}>
                        {line2}
                    </tspan>
                )}
            </text>
            {node.status === "mastered" && (
                <g transform={`translate(${w - 14}, -4)`} pointerEvents="none">
                    <circle r={9} fill="#16A34A" stroke="white" strokeWidth={1.5} />
                    <text textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="white">
                        ✓
                    </text>
                </g>
            )}
        </g>
    );
}

function DetailPanel({ node, onClose }: { node: SkillNode; onClose: () => void }) {
    const pct =
        node.threshold > 0 ? Math.min(100, Math.round((node.current / node.threshold) * 100)) : 0;
    const statusLabel =
        node.status === "mastered"
            ? "Mastered"
            : node.status === "in_progress"
              ? "In Progress"
              : "Locked";
    const statusColor =
        node.status === "mastered"
            ? "#16A34A"
            : node.status === "in_progress"
              ? "var(--accent-stroke)"
              : "var(--locked-stroke)";
    const barColor =
        node.status === "mastered"
            ? "#16A34A"
            : node.status === "in_progress"
              ? "var(--accent)"
              : "var(--locked-stroke)";

    const Icon = node.icon;

    const getLabel = (id: string) =>
        ALL_NODE_LABELS[id] ??
        id
            .replace(/^nt_/, "")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="st-panel" onClick={(e) => e.stopPropagation()}>
            <button className="st-panel-close" onClick={onClose}>
                ✕
            </button>
            <div style={{ marginBottom: 8, color: "var(--text)" }}>
                <Icon size={28} strokeWidth={1.5} />
            </div>
            <div
                style={{
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "var(--text)",
                    marginBottom: 8,
                    letterSpacing: "-0.01em",
                }}
            >
                {node.label}
            </div>
            <span
                style={{
                    display: "inline-block",
                    padding: "3px 11px",
                    borderRadius: 99,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    border: `1.5px solid ${statusColor}`,
                    color: statusColor,
                    marginBottom: 14,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase" as const,
                }}
            >
                {statusLabel}
            </span>

            <p
                style={{
                    fontSize: "0.82rem",
                    color: "var(--text-muted)",
                    marginBottom: 16,
                    lineHeight: 1.5,
                }}
            >
                {node.description}
            </p>

            <div className="st-section">
                <div className="st-section-label">Requirement</div>
                <div className="st-req-box">{node.requirementLabel}</div>
            </div>

            <div className="st-section">
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                    }}
                >
                    <span className="st-section-label">Progress</span>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)" }}>
                        {node.current} / {node.threshold}
                    </span>
                </div>
                <div className="st-bar-bg">
                    <div
                        className="st-bar-fill"
                        style={{ width: `${pct}%`, background: barColor }}
                    />
                </div>
                <div
                    style={{
                        fontSize: "0.7rem",
                        color: "var(--text-muted)",
                        textAlign: "right",
                        marginTop: 3,
                    }}
                >
                    {pct}% complete
                </div>
            </div>

            <div className="st-section">
                <div className="st-section-label">Skills That Count</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {node.trackedSkills.map((s) => (
                        <span key={s} className="st-tag">
                            {s}
                        </span>
                    ))}
                </div>
            </div>

            {node.requiresAny.length > 0 && (
                <div className="st-section">
                    <div className="st-section-label">Requires</div>
                    <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}
                    >
                        {node.requiresAny.map((orGroup, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && (
                                    <span
                                        style={{
                                            fontSize: "0.7rem",
                                            color: "var(--text-muted)",
                                            fontWeight: 600,
                                        }}
                                    >
                                        AND
                                    </span>
                                )}
                                {orGroup.map((id, j) => (
                                    <React.Fragment key={id}>
                                        {j > 0 && (
                                            <span
                                                style={{
                                                    fontSize: "0.7rem",
                                                    color: "var(--text-muted)",
                                                }}
                                            >
                                                or
                                            </span>
                                        )}
                                        <span className="st-tag">{getLabel(id)}</span>
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SkillTreePage() {
    const { tab, setTab, selected, setSelected, nodes, loading, error, mastered, inProg } =
        useSkillTreeViewModel();

    return (
        <>
            <style>{`
        :root {
          --accent: #F5C842;
          --accent-stroke: #D4A017;
          --mastered-fill: #FB923C;
          --mastered-stroke: #C2410C;
          --mastered-glow: rgba(251,146,60,0.45);
          --mastered-edge: #EA580C;
          --progress-fill: #FFFBEB;
          --progress-glow: rgba(245,200,66,0.3);
          --locked-fill: #E9EEF4;
          --locked-stroke: #94A3B8;
          --line-locked: #94A3B8;
          --node-text: #1E293B;
          --selected: #3B82F6;
          --bg: #F1F5F9;
          --card: #FFFFFF;
          --border: #E2E8F0;
          --text: #0F172A;
          --text-muted: #64748B;
        }
        .st-page { min-height: 100vh; background: var(--bg); font-family: 'DM Sans','Segoe UI',sans-serif; }
        .st-header { max-width: 1140px; margin: 0 auto; padding: 24px 20px 0; }
        .st-header h1 { font-size: 1.55rem; font-weight: 800; color: var(--text); margin: 0 0 4px; letter-spacing: -0.025em; }
        .st-header p { font-size: 0.83rem; color: var(--text-muted); margin: 0 0 18px; line-height: 1.5; }
        .st-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
        .st-chip { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; font-size: 0.77rem; font-weight: 600; border: 1.5px solid var(--border); background: var(--card); color: var(--text); }
        .st-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .st-tabs { display: flex; gap: 4px; background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 4px; width: fit-content; }
        .st-tab { padding: 7px 18px; border-radius: 9px; border: none; background: transparent; font-size: 0.82rem; font-weight: 700; cursor: pointer; color: var(--text-muted); transition: all 0.18s; white-space: nowrap; }
        .st-tab.active { background: #0F172A; color: #fff; }
        .st-body { display: flex; align-items: flex-start; gap: 24px; max-width: 1140px; margin: 0 auto; padding: 0 20px 40px; }
        .st-canvas { position: relative; flex-shrink: 0; padding-top: 12px; }
        .st-legend { position: absolute; top: 20px; right: 0px; background: var(--card); border: 1.5px solid var(--border); border-radius: 12px; padding: 10px 14px; font-size: 0.73rem; z-index: 10; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
        .st-legend-item { display: flex; align-items: center; gap: 8px; color: var(--text-muted); font-weight: 500; }
        .st-legend-swatch { width: 13px; height: 13px; border-radius: 4px; flex-shrink: 0; }
        .st-panel-wrap { flex: 1; min-width: 260px; max-width: 320px; padding-top: 12px; }
        .st-panel { background: var(--card); border: 1.5px solid var(--border); border-radius: 20px; padding: 24px; position: relative; box-shadow: 0 4px 28px rgba(0,0,0,0.07); animation: stIn 0.18s ease; }
        @keyframes stIn { from { opacity:0; transform:translateX(8px); } to { opacity:1; transform:translateX(0); } }
        .st-panel-close { position: absolute; top: 14px; right: 14px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.73rem; color: var(--text-muted); }
        .st-section { margin-bottom: 14px; }
        .st-section-label { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 6px; }
        .st-req-box { font-size: 0.82rem; font-weight: 600; color: var(--text); background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 12px; line-height: 1.4; }
        .st-bar-bg { height: 8px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 99px; overflow: hidden; }
        .st-bar-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
        .st-tag { padding: 3px 10px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 99px; font-size: 0.72rem; font-weight: 600; color: var(--text); white-space: nowrap; }
        .st-hint { text-align: center; font-size: 0.74rem; color: var(--text-muted); padding: 4px 20px 12px; max-width: 1140px; margin: 0 auto; }
        .st-loading { text-align: center; padding: 56px 20px; font-size: 0.85rem; color: var(--text-muted); }
        .st-error { text-align: center; padding: 56px 20px; font-size: 0.85rem; color: #EF4444; }
        @media (max-width: 760px) {
          .st-body { flex-direction: column; align-items: stretch; }
          .st-panel-wrap { max-width: 100%; }
          .st-legend { display: none; }
          .st-header h1 { font-size: 1.25rem; }
        }
      `}</style>

            <div className="st-page" onClick={() => setSelected(null)}>
                <div className="st-header">
                    <h1>Skill Tree</h1>
                    <p>
                        Nodes unlock based on the skills you log after completing an opportunity.
                        Start at the bottom and work your way up.
                    </p>

                    {!loading && !error && (
                        <div className="st-stats">
                            <div className="st-chip">
                                <div
                                    className="st-dot"
                                    style={{ background: "var(--mastered-stroke)" }}
                                />
                                {mastered} Mastered
                            </div>
                            <div className="st-chip">
                                <div className="st-dot" style={{ background: "var(--accent)" }} />
                                {inProg} In Progress
                            </div>
                            <div className="st-chip">
                                <div
                                    className="st-dot"
                                    style={{ background: "var(--locked-stroke)" }}
                                />
                                {nodes.length - mastered - inProg} Locked
                            </div>
                        </div>
                    )}

                    <div className="st-tabs">
                        <button
                            className={`
                                st-tab${tab === "technical" ? "active" : ""}
                            `}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTab("technical");
                                setSelected(null);
                            }}
                        >
                            Technical
                        </button>
                        <button
                            className={`
                                st-tab${tab === "nontechnical" ? "active" : ""}
                            `}
                            onClick={(e) => {
                                e.stopPropagation();
                                setTab("nontechnical");
                                setSelected(null);
                            }}
                        >
                            Non-Technical
                        </button>
                    </div>
                </div>

                {loading && <div className="st-loading">Loading your skills…</div>}
                {error && <div className="st-error">{error}</div>}

                {!loading && !error && (
                    <>
                        {!selected && (
                            <p className="st-hint">
                                Tap any node to see requirements and your progress
                            </p>
                        )}
                        <div className="st-body">
                            <div className="st-canvas">
                                <div className="st-legend">
                                    <div className="st-legend-item">
                                        <div
                                            className="st-legend-swatch"
                                            style={{
                                                background: "var(--mastered-fill)",
                                                border: "2px solid var(--mastered-stroke)",
                                            }}
                                        />
                                        Mastered
                                    </div>
                                    <div className="st-legend-item">
                                        <div
                                            className="st-legend-swatch"
                                            style={{
                                                background: "var(--progress-fill)",
                                                border: "2px solid var(--accent)",
                                            }}
                                        />
                                        In Progress
                                    </div>
                                    <div className="st-legend-item">
                                        <div
                                            className="st-legend-swatch"
                                            style={{
                                                background: "var(--locked-fill)",
                                                border: "2px solid var(--locked-stroke)",
                                            }}
                                        />
                                        Locked
                                    </div>
                                </div>
                                <SkillTree
                                    nodes={nodes}
                                    onSelect={(n) =>
                                        setSelected((p) => (p?.id === n.id ? null : n))
                                    }
                                    selectedId={selected?.id ?? null}
                                />
                            </div>

                            {selected && (
                                <div className="st-panel-wrap" onClick={(e) => e.stopPropagation()}>
                                    <DetailPanel
                                        node={selected}
                                        onClose={() => setSelected(null)}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
