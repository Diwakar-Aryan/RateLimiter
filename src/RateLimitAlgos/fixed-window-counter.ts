import { NextFunction, Request, Response } from 'express';
import { FixedWindowCounterArgs, RateLimiter } from '../types';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

interface Counter {
   /**
    * The start of window
    */
   window: number
   /**
    * Number of requests recieved so far in current window
    */
   count: number
}

export class FixedWindowCounterRateLimiter implements RateLimiter {
   counters: Map<string, Counter>;
   threshold: number
   constructor({ threshold }: FixedWindowCounterArgs) {
      this.threshold = threshold
      this.counters = new Map<string, Counter>()
   }

   handleRequest(req: Request, res: Response, next: NextFunction): void {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      // Make sure a valid IP is present in the request.
      if (typeof ip !== 'string') {
         res
            .status(400)
            .send('Invalid x-forwarded-for header or remote address\n');
         return;
      }
      const counter = this.counters.get(ip)
      const currentWindow = Math.floor(new Date().getTime() / 1000)
      if (counter === undefined || counter.window != currentWindow) {
         this.counters.set(ip, {
            count: 1,
            window: currentWindow
         })
         next()
         return
      }

      //Discard thre request if counter exceeds the threshold
      if (counter.count > this.threshold) {
         res.status(429).send('Too many requests')
         return
      }
      //Increment the counter
      counter.count++
      this.counters.set(ip, counter)
      next()

   }
   cleanup(): void {

   }
}