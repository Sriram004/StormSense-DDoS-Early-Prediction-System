import { supabase } from './supabase';
import { TrafficSimulator } from './trafficSimulator';
import { PredictionEngine } from './predictionEngine';
import type { TrafficMetrics } from './trafficSimulator';
import type { AttackPrediction } from './predictionEngine';
import type {
  TrafficDataRow,
  AttackPredictionRow,
  MitigationActionRow,
  BlockedIPRow,
} from './supabase';

export class MonitoringService {
  private simulator: TrafficSimulator;
  private predictor: PredictionEngine;
  private isRunning = false;
  private intervalId: number | null = null;
  private updateInterval = 2000;

  constructor() {
    this.simulator = new TrafficSimulator();
    this.predictor = new PredictionEngine();
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    this.intervalId = window.setInterval(async () => {
      await this.collectAndAnalyze();
    }, this.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async collectAndAnalyze() {
    try {
      const metrics = this.simulator.generateMetrics();
      const prediction = this.predictor.predict(metrics);

      await this.saveTrafficData(metrics);
      await this.savePrediction(prediction);

      if (prediction.riskScore > 70) {
        await this.triggerMitigation(prediction);
      }
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }

  private async saveTrafficData(metrics: TrafficMetrics) {
    const data: TrafficDataRow = {
      timestamp: metrics.timestamp.toISOString(),
      packet_rate: metrics.packetRate,
      byte_rate: metrics.byteRate,
      syn_ack_ratio: metrics.synAckRatio,
      entropy: metrics.entropy,
      flow_duration: metrics.flowDuration,
      source_ip_diversity: metrics.sourceIPDiversity,
      protocol_distribution: metrics.protocolDistribution,
      is_anomaly: metrics.isAnomaly,
    };

    const { error } = await supabase.from('traffic_data').insert(data);
    if (error) console.error('Error saving traffic data:', error);
  }

  private async savePrediction(prediction: AttackPrediction) {
    const data: AttackPredictionRow = {
      timestamp: prediction.timestamp.toISOString(),
      risk_score: prediction.riskScore,
      attack_type: prediction.attackType,
      confidence: prediction.confidence,
      prediction_window: prediction.predictionWindow,
      features: prediction.features,
      model_version: prediction.modelVersion,
      is_active: prediction.isActive,
    };

    const { error } = await supabase.from('attack_predictions').insert(data);
    if (error) console.error('Error saving prediction:', error);
  }

  private async triggerMitigation(prediction: AttackPrediction) {
    const actions: MitigationActionRow[] = [];

    if (prediction.riskScore > 85) {
      actions.push({
        action_type: 'ip_block',
        target: this.generateSuspiciousIP(),
        status: 'active',
        details: {
          riskScore: prediction.riskScore,
          attackType: prediction.attackType,
          autoBlocked: true,
        },
        triggered_at: new Date().toISOString(),
      });

      await this.blockIP(prediction);
    }

    if (prediction.riskScore > 70) {
      actions.push({
        action_type: 'rate_limit',
        target: 'global',
        status: 'active',
        details: {
          maxRequestsPerSecond: 1000,
          duration: 300,
        },
        triggered_at: new Date().toISOString(),
      });
    }

    actions.push({
      action_type: 'alert',
      target: 'soc_team',
      status: 'completed',
      details: {
        alertLevel: prediction.riskScore > 85 ? 'critical' : 'high',
        message: `${prediction.attackType} detected with ${prediction.confidence * 100}% confidence`,
      },
      triggered_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    for (const action of actions) {
      const { error } = await supabase.from('mitigation_actions').insert(action);
      if (error) console.error('Error saving mitigation action:', error);
    }
  }

  private async blockIP(prediction: AttackPrediction) {
    const ipAddress = this.generateSuspiciousIP();
    const threatLevel =
      prediction.riskScore > 90 ? 'critical' : prediction.riskScore > 75 ? 'high' : 'medium';

    const blockedIP: BlockedIPRow = {
      ip_address: ipAddress,
      reason: `Automated block: ${prediction.attackType} detected`,
      attack_type: prediction.attackType,
      threat_level: threatLevel,
      blocked_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      is_active: true,
    };

    const { error } = await supabase.from('blocked_ips').insert(blockedIP);
    if (error && !error.message.includes('duplicate')) {
      console.error('Error blocking IP:', error);
    }
  }

  private generateSuspiciousIP(): string {
    const ranges = [
      () => `185.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      () => `45.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
      () => `193.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    ];
    return ranges[Math.floor(Math.random() * ranges.length)]();
  }

  async simulateAttack(duration: number = 30000) {
    await this.simulator.startAttackSequence(duration);
  }

  getModelInfo() {
    return this.predictor.getModelInfo();
  }

  isActive() {
    return this.isRunning;
  }
}

export const monitoringService = new MonitoringService();
