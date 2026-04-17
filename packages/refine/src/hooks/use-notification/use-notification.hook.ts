/** @fileoverview useNotification hook. @module @abdokouta/react-refine @category Hooks */
import type { INotificationService } from '@/interfaces/i-notification-service.interface';
import type { OpenNotificationParams } from '@/interfaces/open-notification-params.interface';

let _notificationService: INotificationService | undefined;
export function setNotificationService(svc: INotificationService) {
  _notificationService = svc;
}

const noop = () => {};

export function useNotification(): {
  open: (params: OpenNotificationParams) => void;
  close: (key: string) => void;
} {
  if (!_notificationService) return { open: noop, close: noop };
  return {
    open: (params) => _notificationService!.open(params),
    close: (key) => _notificationService!.close(key),
  };
}
