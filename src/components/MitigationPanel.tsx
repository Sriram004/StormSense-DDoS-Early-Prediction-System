import type { MitigationActionRow } from '../lib/supabase';
import { Ban, Gauge, Bell, Shield, CheckCircle, Clock } from 'lucide-react';

interface MitigationPanelProps {
  actions: MitigationActionRow[];
}

export function MitigationPanel({ actions }: MitigationPanelProps) {
  const getIcon = (actionType: string) => {
    switch (actionType) {
      case 'ip_block':
        return <Ban className="w-5 h-5 text-red-600" />;
      case 'rate_limit':
        return <Gauge className="w-5 h-5 text-orange-600" />;
      case 'alert':
        return <Bell className="w-5 h-5 text-blue-600" />;
      default:
        return <Shield className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      active: { label: 'Active', color: 'bg-blue-100 text-blue-800', icon: Shield },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      failed: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: Ban },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const recentActions = actions.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Automated Mitigation Actions</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentActions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No mitigation actions taken yet</p>
          </div>
        ) : (
          recentActions.map((action) => (
            <div
              key={action.id}
              className="p-4 rounded-lg bg-gray-50 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(action.action_type)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-semibold text-gray-900 capitalize">
                        {action.action_type.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">→ {action.target}</span>
                    </div>
                    {getStatusBadge(action.status)}
                  </div>
                  <div className="text-xs text-gray-600">
                    Triggered: {formatTime(action.triggered_at)}
                  </div>
                  {action.details && Object.keys(action.details).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {Object.entries(action.details).slice(0, 2).map(([key, value]) => (
                        <div key={key}>
                          {key}: {String(value)}
                        </div>
                      ))}
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
