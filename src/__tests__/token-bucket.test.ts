import { RateLimiterType } from "../enums"
import { createRateLimiterServer } from "../server"
import { TokenBucketArgs } from "../types"

describe('Testing token bucket rate limiter', () => {
   const rateLimiterType = RateLimiterType.TOKEN_BUCKET
   const port = 8080
   const args: TokenBucketArgs = {
      capacity: 5,
      timePeriodInMs: 1000
   }
   const serverUrl = 'http://127.0.0.1:8080/limited';
   const server = createRateLimiterServer(rateLimiterType,args,port)

})