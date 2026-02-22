import { Shield, Activity, Play, Square, Zap } from 'lucide-react';

interface SystemHeaderProps {
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onSimulateAttack: () => void;
}

export function SystemHeader({
  isMonitoring,
  onToggleMonitoring,
  onSimulateAttack,
}: SystemHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">DDoS Early Prediction System</h1>
              <p className="text-sm text-gray-300 mt-1">
                AI-Powered Real-time Threat Detection & Adaptive Mitigation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
              <Activity className={`w-5 h-5 ${isMonitoring ? 'text-green-400 animate-pulse' : 'text-gray-400'}`} />
              <span className="text-sm font-medium">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
              </span>
            </div>

            <button
              onClick={onToggleMonitoring}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isMonitoring
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isMonitoring ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </button>

            <button
              onClick={onSimulateAttack}
              disabled={!isMonitoring}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              <Zap className="w-4 h-4" />
              Simulate Attack
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
            <div className="text-xs text-gray-400 mb-1">ML Model</div>
            <div className="text-sm font-semibold">Ensemble (RF+XGB+LSTM)</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
            <div className="text-xs text-gray-400 mb-1">Accuracy</div>
            <div className="text-sm font-semibold">96.7%</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
            <div className="text-xs text-gray-400 mb-1">Prediction Window</div>
            <div className="text-sm font-semibold">30-60 seconds</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
            <div className="text-xs text-gray-400 mb-1">Auto Mitigation</div>
            <div className="text-sm font-semibold text-green-400">Enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
