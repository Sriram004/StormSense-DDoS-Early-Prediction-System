import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  TrafficDataRow,
  AttackPredictionRow,
  MitigationActionRow,
  BlockedIPRow,
} from '../lib/supabase';

export function useRealtimeTraffic(limit: number = 50) {
  const [data, setData] = useState<TrafficDataRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitial();

    const channel = supabase
      .channel('traffic_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'traffic_data' },
        (payload) => {
          setData((current) => {
            const updated = [payload.new as TrafficDataRow, ...current];
            return updated.slice(0, limit);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const fetchInitial = async () => {
    const { data: initialData, error } = await supabase
      .from('traffic_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (!error && initialData) {
      setData(initialData);
    }
    setLoading(false);
  };

  return { data, loading };
}

export function useRealtimePredictions(limit: number = 20) {
  const [data, setData] = useState<AttackPredictionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitial();

    const channel = supabase
      .channel('prediction_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attack_predictions' },
        (payload) => {
          setData((current) => {
            const updated = [payload.new as AttackPredictionRow, ...current];
            return updated.slice(0, limit);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const fetchInitial = async () => {
    const { data: initialData, error } = await supabase
      .from('attack_predictions')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (!error && initialData) {
      setData(initialData);
    }
    setLoading(false);
  };

  return { data, loading };
}

export function useRealtimeMitigations(limit: number = 30) {
  const [data, setData] = useState<MitigationActionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitial();

    const channel = supabase
      .channel('mitigation_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mitigation_actions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((current) => {
              const updated = [payload.new as MitigationActionRow, ...current];
              return updated.slice(0, limit);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const fetchInitial = async () => {
    const { data: initialData, error } = await supabase
      .from('mitigation_actions')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(limit);

    if (!error && initialData) {
      setData(initialData);
    }
    setLoading(false);
  };

  return { data, loading };
}

export function useBlockedIPs() {
  const [data, setData] = useState<BlockedIPRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitial();

    const channel = supabase
      .channel('blocked_ip_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blocked_ips' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData((current) => [payload.new as BlockedIPRow, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setData((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as BlockedIPRow) : item
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchInitial = async () => {
    const { data: initialData, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('is_active', true)
      .order('blocked_at', { ascending: false });

    if (!error && initialData) {
      setData(initialData);
    }
    setLoading(false);
  };

  return { data, loading };
}
