import redis, { RedisClient, RedisError } from 'redis';

export default class ClientRedis {
  private static redisConnection: any;

  private constructor() {}

  public static getRedisConnection(): any {
    if (!ClientRedis.redisConnection) {
      /** Create new connection if there is no connection */
      ClientRedis.redisConnection = redis.createClient();
      ClientRedis.redisConnection.on('connect', () => {
        process.stdout.write('======> Connected to Redis\n');
      });
    }

    return ClientRedis.redisConnection;
  }
}
