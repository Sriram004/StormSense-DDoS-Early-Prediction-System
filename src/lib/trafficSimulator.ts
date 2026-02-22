export interface TrafficMetrics {
  timestamp: Date;
  packetRate: number;
  byteRate: number;
  synAckRatio: number;
  entropy: number;
  flowDuration: number;
  sourceIPDiversity: number;
  protocolDistribution: {
    tcp: number;
    udp: number;
    http: number;
    https: number;
    icmp: number;
  };
  isAnomaly: boolean;
}

export type AttackType = 'normal' | 'udp_flood' | 'syn_flood' | 'http_flood' | 'icmp_flood' | 'dns_amplification';

export class TrafficSimulator {
  private basePacketRate = 5000;
  private baseByteRate = 750000;
  private currentAttackType: AttackType = 'normal';
  private attackIntensity = 0;
  private noiseLevel = 0.15;

  setAttackScenario(type: AttackType, intensity: number = 0.7) {
    this.currentAttackType = type;
    this.attackIntensity = Math.max(0, Math.min(1, intensity));
  }

  private addNoise(value: number, factor: number = this.noiseLevel): number {
    return value * (1 + (Math.random() - 0.5) * factor);
  }

  private calculateEntropy(distribution: Record<string, number>): number {
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;

    let entropy = 0;
    for (const value of Object.values(distribution)) {
      if (value > 0) {
        const p = value / total;
        entropy -= p * Math.log2(p);
      }
    }
    return Math.max(0, Math.min(1, entropy / 2.5));
  }

  generateMetrics(): TrafficMetrics {
    const timestamp = new Date();
    let packetRate = this.basePacketRate;
    let byteRate = this.baseByteRate;
    let synAckRatio = 1.0;
    let flowDuration = 2.5;
    let sourceIPDiversity = 450;
    let protocolDist = { tcp: 0.6, udp: 0.2, http: 0.1, https: 0.08, icmp: 0.02 };

    switch (this.currentAttackType) {
      case 'udp_flood':
        packetRate = this.basePacketRate * (1 + this.attackIntensity * 25);
        byteRate = this.baseByteRate * (1 + this.attackIntensity * 20);
        protocolDist = { tcp: 0.1, udp: 0.85, http: 0.02, https: 0.02, icmp: 0.01 };
        sourceIPDiversity = Math.floor(450 * (1 + this.attackIntensity * 8));
        flowDuration = 0.5;
        break;

      case 'syn_flood':
        packetRate = this.basePacketRate * (1 + this.attackIntensity * 30);
        byteRate = this.baseByteRate * (1 + this.attackIntensity * 5);
        synAckRatio = 5.0 + this.attackIntensity * 15;
        protocolDist = { tcp: 0.95, udp: 0.02, http: 0.01, https: 0.01, icmp: 0.01 };
        sourceIPDiversity = Math.floor(450 * (1 + this.attackIntensity * 12));
        flowDuration = 0.2;
        break;

      case 'http_flood':
        packetRate = this.basePacketRate * (1 + this.attackIntensity * 18);
        byteRate = this.baseByteRate * (1 + this.attackIntensity * 15);
        protocolDist = { tcp: 0.3, udp: 0.05, http: 0.6, https: 0.04, icmp: 0.01 };
        sourceIPDiversity = Math.floor(450 * (1 + this.attackIntensity * 4));
        flowDuration = 1.8;
        break;

      case 'icmp_flood':
        packetRate = this.basePacketRate * (1 + this.attackIntensity * 22);
        byteRate = this.baseByteRate * (1 + this.attackIntensity * 8);
        protocolDist = { tcp: 0.1, udp: 0.1, http: 0.02, https: 0.01, icmp: 0.77 };
        sourceIPDiversity = Math.floor(450 * (1 + this.attackIntensity * 6));
        flowDuration = 0.3;
        break;

      case 'dns_amplification':
        packetRate = this.basePacketRate * (1 + this.attackIntensity * 28);
        byteRate = this.baseByteRate * (1 + this.attackIntensity * 35);
        protocolDist = { tcp: 0.05, udp: 0.92, http: 0.01, https: 0.01, icmp: 0.01 };
        sourceIPDiversity = Math.floor(450 * (1 + this.attackIntensity * 15));
        flowDuration = 0.4;
        break;

      case 'normal':
      default:
        packetRate = this.addNoise(this.basePacketRate, 0.2);
        byteRate = this.addNoise(this.baseByteRate, 0.2);
        synAckRatio = this.addNoise(1.0, 0.1);
        flowDuration = this.addNoise(2.5, 0.3);
        sourceIPDiversity = Math.floor(this.addNoise(450, 0.15));
        break;
    }

    packetRate = Math.floor(this.addNoise(packetRate, 0.08));
    byteRate = Math.floor(this.addNoise(byteRate, 0.08));
    synAckRatio = Math.max(0.1, this.addNoise(synAckRatio, 0.05));
    flowDuration = Math.max(0.1, this.addNoise(flowDuration, 0.1));

    const entropy = this.calculateEntropy(protocolDist);
    const isAnomaly = this.currentAttackType !== 'normal' && this.attackIntensity > 0.3;

    return {
      timestamp,
      packetRate,
      byteRate,
      synAckRatio: Number(synAckRatio.toFixed(4)),
      entropy: Number(entropy.toFixed(4)),
      flowDuration: Number(flowDuration.toFixed(2)),
      sourceIPDiversity,
      protocolDistribution: {
        tcp: Number(protocolDist.tcp.toFixed(2)),
        udp: Number(protocolDist.udp.toFixed(2)),
        http: Number(protocolDist.http.toFixed(2)),
        https: Number(protocolDist.https.toFixed(2)),
        icmp: Number(protocolDist.icmp.toFixed(2)),
      },
      isAnomaly,
    };
  }

  startAttackSequence(duration: number = 30000): Promise<void> {
    return new Promise((resolve) => {
      const attackTypes: AttackType[] = ['udp_flood', 'syn_flood', 'http_flood', 'icmp_flood', 'dns_amplification'];
      const randomAttack = attackTypes[Math.floor(Math.random() * attackTypes.length)];

      this.setAttackScenario(randomAttack, 0);

      const rampUpTime = duration * 0.2;
      const sustainTime = duration * 0.6;
      const rampDownTime = duration * 0.2;

      const startTime = Date.now();

      const updateIntensity = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed < rampUpTime) {
          this.attackIntensity = (elapsed / rampUpTime) * 0.85;
        } else if (elapsed < rampUpTime + sustainTime) {
          this.attackIntensity = 0.75 + Math.random() * 0.2;
        } else if (elapsed < duration) {
          const rampDownElapsed = elapsed - (rampUpTime + sustainTime);
          this.attackIntensity = 0.85 * (1 - rampDownElapsed / rampDownTime);
        } else {
          this.attackIntensity = 0;
          this.currentAttackType = 'normal';
          resolve();
          return;
        }

        setTimeout(updateIntensity, 100);
      };

      updateIntensity();
    });
  }
}
