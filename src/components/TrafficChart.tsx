import type { TrafficDataRow } from '../lib/supabase';

interface TrafficChartProps {
  data: TrafficDataRow[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  const maxPacketRate = Math.max(...data.map((d) => d.packet_rate), 10000);
  const chartHeight = 200;
  const chartWidth = 600;

  const normalizedData = data
    .slice(0, 50)
    .reverse()
    .map((d, i) => ({
      x: (i / 49) * chartWidth,
      y: chartHeight - (d.packet_rate / maxPacketRate) * chartHeight,
      isAnomaly: d.is_anomaly,
      value: d.packet_rate,
    }));

  const pathData = normalizedData
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Real-time Traffic Flow</h2>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Anomaly</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={chartHeight * ratio}
              x2={chartWidth}
              y2={chartHeight * ratio}
              stroke="#e5e7eb"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          <path d={areaPath} fill="url(#areaGradient)" />

          <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2.5" />

          {normalizedData.map((point, i) =>
            point.isAnomaly ? (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#ef4444"
                className="animate-pulse"
              />
            ) : null
          )}
        </svg>

        <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          <span>{maxPacketRate.toLocaleString()} pps</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-2">
          <span>0 pps</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
        <div>
          <div className="text-xs text-gray-600">Current Rate</div>
          <div className="text-lg font-bold text-gray-900">
            {data[0]?.packet_rate.toLocaleString() || 0}
            <span className="text-xs font-normal text-gray-600 ml-1">pps</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Byte Rate</div>
          <div className="text-lg font-bold text-gray-900">
            {((data[0]?.byte_rate || 0) / 1024 / 1024).toFixed(1)}
            <span className="text-xs font-normal text-gray-600 ml-1">MB/s</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">SYN/ACK Ratio</div>
          <div className="text-lg font-bold text-gray-900">
            {data[0]?.syn_ack_ratio.toFixed(2) || '0.00'}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-600">Source IPs</div>
          <div className="text-lg font-bold text-gray-900">
            {data[0]?.source_ip_diversity.toLocaleString() || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
