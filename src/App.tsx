import { useEffect, useState } from 'react';
import { SystemHeader } from './components/SystemHeader';
import { RiskMeter } from './components/RiskMeter';
import { TrafficChart } from './components/TrafficChart';
import { AttackTimeline } from './components/AttackTimeline';
import { MitigationPanel } from './components/MitigationPanel';
import { BlockedIPList } from './components/BlockedIPList';
import {
  useRealtimeTraffic,
  useRealtimePredictions,
  useRealtimeMitigations,
  useBlockedIPs,
} from './hooks/useRealtimeData';
import { monitoringService } from './lib/monitoringService';

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isAttackSimulation, setIsAttackSimulation] = useState(false);

  const { data: trafficData } = useRealtimeTraffic(50);
  const { data: predictions } = useRealtimePredictions(20);
  const { data: mitigations } = useRealtimeMitigations(30);
  const { data: blockedIPs } = useBlockedIPs();

  const currentPrediction = predictions[0] || {
    risk_score: 0,
    attack_type: 'Normal Traffic',
    confidence: 0,
  };

  useEffect(() => {
    return () => {
      monitoringService.stop();
    };
  }, []);

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      monitoringService.stop();
      setIsMonitoring(false);
    } else {
      monitoringService.start();
      setIsMonitoring(true);
    }
  };

  const handleSimulateAttack = async () => {
    if (isAttackSimulation) return;

    setIsAttackSimulation(true);
    await monitoringService.simulateAttack(30000);
    setIsAttackSimulation(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SystemHeader
        isMonitoring={isMonitoring}
        onToggleMonitoring={handleToggleMonitoring}
        onSimulateAttack={handleSimulateAttack}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1">
            <RiskMeter
              riskScore={currentPrediction.risk_score}
              attackType={currentPrediction.attack_type}
              confidence={currentPrediction.confidence}
            />
          </div>

          <div className="lg:col-span-2">
            <TrafficChart data={trafficData} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AttackTimeline predictions={predictions} />
          <MitigationPanel actions={mitigations} />
        </div>

        <div className="grid grid-cols-1">
          <BlockedIPList blockedIPs={blockedIPs} />
        </div>

        {isAttackSimulation && (
          <div className="fixed bottom-6 right-6 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-pulse">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <span className="font-semibold">Attack Simulation in Progress...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
