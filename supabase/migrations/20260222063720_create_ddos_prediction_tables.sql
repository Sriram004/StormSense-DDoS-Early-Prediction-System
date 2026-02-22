/*
  # DDoS Early Prediction System Database Schema

  1. New Tables
    - `traffic_data` - Real-time network traffic metrics
    - `attack_predictions` - ML model predictions for DDoS attacks
    - `mitigation_actions` - Automated mitigation action logs
    - `blocked_ips` - Blocked IP address tracking

  2. Security
    - Enable RLS on all tables
    - Public read access for dashboard
    - Service role only for modifications
*/

-- Traffic Data Table
CREATE TABLE IF NOT EXISTS traffic_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  packet_rate integer NOT NULL DEFAULT 0,
  byte_rate bigint NOT NULL DEFAULT 0,
  syn_ack_ratio numeric(5,4) DEFAULT 0,
  entropy numeric(5,4) DEFAULT 0,
  flow_duration numeric(10,2) DEFAULT 0,
  source_ip_diversity integer DEFAULT 0,
  protocol_distribution jsonb DEFAULT '{}',
  is_anomaly boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_traffic_data_timestamp ON traffic_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_data_anomaly ON traffic_data(is_anomaly) WHERE is_anomaly = true;

ALTER TABLE traffic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for traffic data"
  ON traffic_data FOR SELECT
  TO anon, authenticated
  USING (true);

-- Attack Predictions Table
CREATE TABLE IF NOT EXISTS attack_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  attack_type text NOT NULL,
  confidence numeric(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  prediction_window integer DEFAULT 60,
  features jsonb DEFAULT '{}',
  model_version text DEFAULT 'v1.0',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attack_predictions_timestamp ON attack_predictions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_attack_predictions_active ON attack_predictions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_attack_predictions_risk ON attack_predictions(risk_score DESC);

ALTER TABLE attack_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for predictions"
  ON attack_predictions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Mitigation Actions Table
CREATE TABLE IF NOT EXISTS mitigation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id uuid REFERENCES attack_predictions(id),
  action_type text NOT NULL,
  target text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  details jsonb DEFAULT '{}',
  triggered_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mitigation_actions_prediction ON mitigation_actions(prediction_id);
CREATE INDEX IF NOT EXISTS idx_mitigation_actions_status ON mitigation_actions(status);
CREATE INDEX IF NOT EXISTS idx_mitigation_actions_triggered ON mitigation_actions(triggered_at DESC);

ALTER TABLE mitigation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for mitigation actions"
  ON mitigation_actions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL UNIQUE,
  reason text NOT NULL,
  attack_type text NOT NULL,
  threat_level text NOT NULL DEFAULT 'medium',
  blocked_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  unblocked_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON blocked_ips(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_blocked_ips_threat ON blocked_ips(threat_level);

ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for blocked IPs"
  ON blocked_ips FOR SELECT
  TO anon, authenticated
  USING (true);