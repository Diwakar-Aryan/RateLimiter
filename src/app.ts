import { Argument, program } from 'commander'
import { RateLimiterType } from './enums';
import {
   FixedWindowCounterArgs,
   RateLimiterArgs,
   SlidingWindowCounterArgs,
   SlidingWindowLogArgs,
   TokenBucketArgs
} from './types';

program.addArgument(new Argument('<algorithm>', 'The algorithm to use for the rate limiter').choices(Object.values(RateLimiterType)))

program.option('-p,--port <port>', 'Port on which server will start', '8080')
program.option('--debug', 'Enable Debugging')

program.parse()
const options = program.opts()
const rateLimiterType = program.args[0] as RateLimiterType
const PORT = parseInt(options.port);
const DEBUG = options.debug;


async function getRateLimiterArgs(rateLimiterType: RateLimiterType): Promise<RateLimiterArgs> {

   switch (rateLimiterType) {
      case RateLimiterType.TOKEN_BUCKET: {
         const arg: TokenBucketArgs = { capacity: 10, timePeriodInMs: 1000 }
         return arg
      }
      case RateLimiterType.FIXED_WINDOW_COUNTER: {
         const arg: FixedWindowCounterArgs = { threshold: 1 }
         return arg
      }
      case RateLimiterType.SLIDING_WINDOW_LOG: {
         const arg: SlidingWindowLogArgs = { logThreshold: 1 }
         return arg
      }
      case RateLimiterType.SLIDING_WINDOW_COUNTER: {
         const arg: SlidingWindowCounterArgs = { threshold: 1 }
         return arg
      }
      // case RateLimiterType.REDIS_SLIDING_WINDOW_COUNTER: {
      //    // const client = new ClientRequest()
      //    // client.on('error', (err) => {
      //    //    if (console.error(err))
      //    // })
      // }
      default: {
         const arg: TokenBucketArgs = { capacity: 10, timePeriodInMs: 1000 }
         return arg
      }
   }
}

// (async () => {
//   const args = await getRateLimiterArgs(rateLimiterType)
//   createRateLimiterServer(rateLimiterType, args, PORT, DEBUG)
// })()