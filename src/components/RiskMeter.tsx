interface RiskMeterProps {
  riskScore: number;
  attackType: string;
  confidence: number;
}

export function RiskMeter({ riskScore, attackType, confidence }: RiskMeterProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 85) return { label: 'CRITICAL', color: 'text-red-600', bgColor: 'bg-red-500' };
    if (score >= 70) return { label: 'HIGH', color: 'text-orange-600', bgColor: 'bg-orange-500' };
    if (score >= 40) return { label: 'MEDIUM', color: 'text-yellow-600', bgColor: 'bg-yellow-500' };
    return { label: 'LOW', color: 'text-green-600', bgColor: 'bg-green-500' };
  };

  const risk = getRiskLevel(riskScore);
  const rotation = (riskScore / 100) * 180 - 90;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Threat Risk Score</h2>

      <div className="relative w-64 h-32 mx-auto mb-6">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="12"
            strokeLinecap="round"
          />

          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 * (1 - riskScore / 100)}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />

          <line
            x1="100"
            y1="90"
            x2="100"
            y2="30"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 90)`}
            style={{ transition: 'transform 0.5s ease' }}
          />

          <circle cx="100" cy="90" r="6" fill="#1f2937" />
        </svg>

        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{riskScore}</div>
            <div className={`text-sm font-semibold ${risk.color}`}>{risk.label}</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Attack Type:</span>
          <span className="text-sm font-semibold text-gray-900">{attackType}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Confidence:</span>
          <span className="text-sm font-semibold text-gray-900">
            {(confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${risk.bgColor} animate-pulse`}></div>
            <span className="text-xs text-gray-600">
              {riskScore > 70 ? 'Active threat detected' : 'System monitoring active'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
