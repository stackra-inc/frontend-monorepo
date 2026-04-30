/**
 * @fileoverview usePresence React hook for presence channel member tracking.
 * @module @stackra/ts-realtime
 * @category Hooks
 */

import { useState, useEffect, useRef } from 'react';
import { useInject } from '@stackra/ts-container';

import { REALTIME_MANAGER } from '../constants/tokens.constant';
import type { RealtimeManager } from '../services/realtime-manager.service';
import type { RealtimeConnection } from '../interfaces/realtime-connection.interface';
import type { PresenceChannelWrapper } from '../services/presence-channel-wrapper.service';

/**
 * Return type for the `usePresence` hook.
 */
export interface UsePresenceReturn<TMember> {
  /** The current list of members in the presence channel. */
  members: TMember[];
  /** Whether the WebSocket connection is currently active. */
  connected: boolean;
  /** The latest error, or `null` if no error has occurred. */
  error: Error | null;
}

/**
 * React hook for subscribing to a Laravel Broadcasting presence channel.
 *
 * Resolves the default connection asynchronously, joins the presence channel
 * on mount, and tracks members via `here()`, `joining()`, and `leaving()`
 * callbacks. Leaves the channel on unmount.
 *
 * @template TMember - The member type
 * @param channelName - The presence channel name to join
 * @returns An object containing `members`, `connected`, and `error`
 *
 * @example
 * ```tsx
 * import { usePresence } from '@stackra/ts-realtime';
 *
 * interface User {
 *   id: number;
 *   name: string;
 * }
 *
 * function OnlineUsers() {
 *   const { members, connected, error } = usePresence<User>('chat-room.1');
 *
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!connected) return <div>Connecting...</div>;
 *
 *   return (
 *     <ul>
 *       {members.map((user) => (
 *         <li key={user.id}>{user.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function usePresence<TMember>(channelName: string): UsePresenceReturn<TMember> {
  const manager = useInject<RealtimeManager>(REALTIME_MANAGER);

  if (!manager) {
    throw new Error(
      'RealtimeManager not found. Import RealtimeModule.forRoot() in your app module.'
    );
  }

  const [members, setMembers] = useState<TMember[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  const connRef = useRef<RealtimeConnection | null>(null);
  const channelRef = useRef<PresenceChannelWrapper | null>(null);

  // Resolve the default connection asynchronously
  useEffect(() => {
    let cancelled = false;

    manager
      .connection()
      .then((conn) => {
        if (cancelled) return;
        connRef.current = conn;
        setConnected(conn.isConnected());

        const unsubscribe = conn.onStatusChange(() => {
          setConnected(conn.isConnected());
        });

        return unsubscribe;
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to resolve connection'));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [manager]);

  // Join presence channel once connected
  useEffect(() => {
    if (!connected || !connRef.current) return;

    const conn = connRef.current;
    let wrapper: PresenceChannelWrapper;

    try {
      wrapper = conn.join(channelName);
      channelRef.current = wrapper;

      wrapper
        .here<TMember>((currentMembers) => {
          setMembers([...currentMembers]);
        })
        .joining<TMember>((member) => {
          setMembers((prev) => [...prev, member]);
        })
        .leaving<TMember>((member) => {
          setMembers((prev) => prev.filter((m) => m !== member));
        })

        .onError((err) => {
          setError(err);
        });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to join presence channel'));
      return;
    }

    return () => {
      try {
        wrapper.leave();
      } catch {
        // Already left
      }
      channelRef.current = null;
      setMembers([]);
    };
  }, [channelName, connected]);

  return { members, connected, error };
}
