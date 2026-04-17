/**
 * React Hooks — App Module
 *
 * Register the RedisModule before using hooks in components.
 */

import { Module } from '@abdokouta/ts-container';
import { RedisModule } from '@abdokouta/ts-redis';
import redisConfig from './redis.config';

@Module({
  imports: [RedisModule.forRoot(redisConfig)],
})
export class AppModule {}
