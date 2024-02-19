import { NextFunction, Request, Response } from "express";
import { RateLimiter, TokenBucketArgs } from "../types";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

export class TokenBucketRateLimiter implements RateLimiter {

   /**
    * A map that stores the number of available token for each IP address
    * Each ip has its own bucket
    */
   tokens: Map<string, number>;
   timer: any;
   capacity: number;
   timePeriodInMs: number;
   constructor({ capacity, timePeriodInMs }: TokenBucketArgs) {
      this.capacity = capacity
      this.tokens = new Map<string, number>()

      //verify timePeriodInMs
      if (timePeriodInMs > 0) {
         this.timePeriodInMs = timePeriodInMs
      } else {
         throw new Error(`Invalid timePeriod ${timePeriodInMs}. It should be >= 0`)
      }
      //start add token with provided timer period
      // TODO : check race condition
      this.timer = setInterval(() => this.addTokens(), timePeriodInMs)
   }

   /**
    * Adds token to all the buckets
    * @private
    */
   private addTokens(): void {
      this.tokens.forEach((value, key) => {
         if (value >= this.capacity) { return }
         this.tokens.set(key, value + 1)
      })
   }

   handleRequest(req: Request, res: Response, next: NextFunction): void {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

      //Make sure a valid ip is provided
      if (typeof ip !== 'string') {
         res.status(400).send('Invalid x-forwarded-for header or remote address\n')
         return
      }
      const tokenInBucket = this.tokens.get(ip)

      //First time encountering this ip
      //Initialize a new bucket for this
      if (tokenInBucket === undefined) {
         this.tokens.set(ip, this.capacity - 1)
         next()
         return;
      }

      //if no tokens left to utilize, reject the request
      if (tokenInBucket === 0) {
         res.status(429).send(
            'Too many requests, Please try again later\n'
         )
      }

      //Decrement the number of tokens for this ip
      this.tokens.set(ip, tokenInBucket - 1)
      next()
   }
   cleanup(): void {
      clearInterval(this.timer)
   }
}