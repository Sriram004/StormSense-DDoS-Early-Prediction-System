import type { BlockedIPRow } from '../lib/supabase';
import { Ban, AlertCircle } from 'lucide-react';

interface BlockedIPListProps {
  blockedIPs: BlockedIPRow[];
}

export function BlockedIPList({ blockedIPs }: BlockedIPListProps) {
  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return 'Permanent';

    const now = Date.now();
    const expires = new Date(expiresAt).getTime();
    const remaining = expires - now;

    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / 60000);
    if (minutes < 60) return `${minutes}m`;

    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Blocked IP Addresses</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
          <Ban className="w-4 h-4 text-red-600" />
          <span className="text-sm font-semibold text-red-800">{blockedIPs.length} Active</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {blockedIPs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No IPs currently blocked</p>
          </div>
        ) : (
          blockedIPs.map((ip) => (
            <div
              key={ip.id}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Ban className="w-5 h-5 text-red-500" />
                  <span className="font-mono font-bold text-gray-900">{ip.ip_address}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getThreatLevelColor(ip.threat_level)}`}>
                  {ip.threat_level.toUpperCase()}
                </span>
              </div>

              <div className="ml-8 space-y-1">
                <div className="text-sm text-gray-900 font-medium">{ip.attack_type}</div>
                <div className="text-xs text-gray-600">{ip.reason}</div>

                <div className="flex gap-4 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                  <span>Blocked: {formatTime(ip.blocked_at)}</span>
                  <span>Expires: {getTimeRemaining(ip.expires_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {blockedIPs.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          Automatic unblocking when threat expires or is cleared
        </div>
      )}
    </div>
  );
}
