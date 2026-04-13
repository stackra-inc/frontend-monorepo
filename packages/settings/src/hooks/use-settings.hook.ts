/**
 * @fileoverview useSettings React hook.
 *
 * Resolves SettingsService from the DI container via useInject,
 * then provides reactive access to a settings group.
 *
 * @module hooks/use-settings
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInject } from '@abdokouta/ts-container-react';
import type {
  SettingDtoConstructor,
  ResolvedSettingGroup,
} from '@/interfaces/setting-group.interface';
import { SettingsService } from '@/services/settings.service';

/**
 * Return type for the useSettings hook.
 */
export type UseSettingsReturn<T> = [
  values: T,
  set: (key: keyof T & string, value: unknown) => void,
  setMany: (partial: Partial<T>) => void,
  reset: () => void,
];

/**
 * React hook for reactive settings access.
 *
 * @template T - The settings class type
 * @param dto - The settings class (must be registered via forFeature)
 */
export function useSettings<T>(dto: SettingDtoConstructor<T>): UseSettingsReturn<T> {
  const service = useInject<SettingsService>(SettingsService);

  if (!service) {
    throw new Error(
      '[useSettings] SettingsService not found. Import SettingsModule.forRoot() in your app module.'
    );
  }

  const [values, setValues] = useState<T>(() => service.get(dto));
  const dtoRef = useRef(dto);
  dtoRef.current = dto;

  useEffect(() => {
    const group = service.getGroups().find((g: ResolvedSettingGroup) => g.dto === dtoRef.current);
    if (!group) return;

    const unsubscribe = service.subscribe(group.key, () => {
      setValues(service.get(dtoRef.current));
    });
    return unsubscribe;
  }, [service]);

  const set = useCallback(
    (key: keyof T & string, value: unknown) => service.set(dtoRef.current, key, value),
    [service]
  );

  const setMany = useCallback(
    (partial: Partial<T>) => service.setMany(dtoRef.current, partial),
    [service]
  );

  const reset = useCallback(() => service.reset(dtoRef.current), [service]);

  return [values, set, setMany, reset];
}
