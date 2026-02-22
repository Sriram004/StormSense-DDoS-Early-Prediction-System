import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TrafficDataRow {
  id?: string;
  timestamp: string;
  packet_rate: number;
  byte_rate: number;
  syn_ack_ratio: number;
  entropy: number;
  flow_duration: number;
  source_ip_diversity: number;
  protocol_distribution: Record<string, number>;
  is_anomaly: boolean;
  created_at?: string;
}

export interface AttackPredictionRow {
  id?: string;
  timestamp: string;
  risk_score: number;
  attack_type: string;
  confidence: number;
  prediction_window: number;
  features: Record<string, number>;
  model_version: string;
  is_active: boolean;
  created_at?: string;
}

export interface MitigationActionRow {
  id?: string;
  prediction_id?: string;
  action_type: string;
  target: string;
  status: string;
  details: Record<string, unknown>;
  triggered_at: string;
  completed_at?: string;
  created_at?: string;
}

export interface BlockedIPRow {
  id?: string;
  ip_address: string;
  reason: string;
  attack_type: string;
  threat_level: string;
  blocked_at: string;
  expires_at?: string;
  is_active: boolean;
  unblocked_at?: string;
  created_at?: string;
}
