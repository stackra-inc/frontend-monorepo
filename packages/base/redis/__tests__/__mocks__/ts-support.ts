/**
 * Mock for @stackra/ts-support
 *
 * Provides a stub MultipleInstanceManager base class and Facade
 * so RedisManager can extend it without the real package installed.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export class MultipleInstanceManager<T> {
  private _instances = new Map<string, T>();
  private _pending = new Map<string, Promise<T>>();

  protected getDefaultInstance(): string {
    return '';
  }

  protected setDefaultInstance(_name: string): void {}

  protected getInstanceConfig(_name: string): Record<string, any> | undefined {
    return undefined;
  }

  protected createDriver(_driver: string, _config: Record<string, any>): T {
    throw new Error('Not implemented');
  }

  protected async createDriverAsync(_driver: string, _config: Record<string, any>): Promise<T> {
    throw new Error('Not implemented');
  }

  protected async instanceAsync(name?: string): Promise<T> {
    const key = name ?? this.getDefaultInstance();
    if (this._instances.has(key)) {
      return this._instances.get(key) as T;
    }
    if (this._pending.has(key)) {
      return this._pending.get(key) as Promise<T>;
    }
    const config = this.getInstanceConfig(key);
    if (!config) {
      throw new Error(`Redis connection [${key}] not configured`);
    }
    const promise = this.createDriverAsync(config.driver as string, config).then((inst) => {
      this._instances.set(key, inst);
      this._pending.delete(key);
      return inst;
    });
    this._pending.set(key, promise);
    return promise;
  }

  protected instance(name: string): T {
    return this._instances.get(name) as T;
  }

  protected hasInstance(name: string): boolean {
    return this._instances.has(name);
  }

  protected forgetInstance(name: string): void {
    this._instances.delete(name);
  }

  protected getResolvedInstances(): string[] {
    return Array.from(this._instances.keys());
  }

  protected purge(): void {
    this._instances.clear();
  }
}

export class Facade {
  static make<T>(_token: any): T {
    return {} as T;
  }

  static setApplication(): void {}
  static swap(): void {}
  static clearResolvedInstances(): void {}
}
