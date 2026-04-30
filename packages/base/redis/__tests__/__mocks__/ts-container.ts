/**
 * Mock for @stackra/ts-container
 *
 * Provides no-op decorator implementations so classes can be
 * instantiated without the DI container.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export const Injectable =
  () =>
  (target: any): any =>
    target;

export const Inject =
  () =>
  (_target: any, _key: string | symbol, _index: number): void => {};

export const Optional =
  () =>
  (_target: any, _key: string | symbol, _index: number): void => {};

export const Module =
  () =>
  (target: any): any =>
    target;

export const useInject = (_token: any): any => ({});

export type OnModuleInit = { onModuleInit(): Promise<void> | void };
export type OnModuleDestroy = { onModuleDestroy(): Promise<void> | void };
export type DynamicModule = Record<string, any>;
