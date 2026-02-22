import type { AttackPredictionRow } from '../lib/supabase';
import { AlertTriangle, Shield, Activity } from 'lucide-react';

interface AttackTimelineProps {
  predictions: AttackPredictionRow[];
}

export function AttackTimeline({ predictions }: AttackTimelineProps) {
  const getIcon = (riskScore: number) => {
    if (riskScore >= 70) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (riskScore >= 40) return <Shield className="w-5 h-5 text-yellow-500" />;
    return <Activity className="w-5 h-5 text-green-500" />;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const recentPredictions = predictions.slice(0, 8);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Attack Detection Timeline</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentPredictions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No predictions yet. System initializing...</p>
          </div>
        ) : (
          recentPredictions.map((pred) => (
            <div
              key={pred.id}
              className={`p-4 rounded-lg border-l-4 transition-all ${
                pred.risk_score >= 70
                  ? 'bg-red-50 border-red-500'
                  : pred.risk_score >= 40
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-green-50 border-green-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(pred.risk_score)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-gray-900">{pred.attack_type}</span>
                    <span className="text-xs text-gray-600">{formatTime(pred.timestamp)}</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>
                      Risk: <span className="font-semibold">{pred.risk_score}</span>
                    </span>
                    <span>
                      Confidence: <span className="font-semibold">{(pred.confidence * 100).toFixed(0)}%</span>
                    </span>
                    <span>
                      Window: <span className="font-semibold">{pred.prediction_window}s</span>
                    </span>
                  </div>
                  {pred.is_active && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-red-700">Active Threat</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
