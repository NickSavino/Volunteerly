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