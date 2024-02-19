import { Request, Response, NextFunction } from "express";
import { RateLimiter, SlidingWindowLogArgs } from "../types";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

const MAX_LOG_THRESHOLD = 100
const MIN_LOG_THRESHOLD = 1

export class SlidingWindowLogRateLimiter implements RateLimiter {
   logs: Map<string, Date[]>
   logThreshold: number;

   constructor({ logThreshold }: SlidingWindowLogArgs) {
      this.logs = new Map<string, Date[]>()

      //validate logThreshold value
      if (logThreshold >= MIN_LOG_THRESHOLD && logThreshold <= MAX_LOG_THRESHOLD) {
         this.logThreshold = logThreshold
      }
      else {
         throw new Error(`logThreshold should be between ${MIN_LOG_THRESHOLD} and  ${MAX_LOG_THRESHOLD}`)
      }

   }
   handleRequest(req: Request, res: Response, next: NextFunction): void {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

      //Make sure valid IP
      if (typeof ip !== 'string') {
         res.status(400).send('Invalid ip address')
         return
      }
      const date = new Date()
      const log = this.logs.get(ip)
      if (log === undefined) {
         this.logs.set(ip, [date])
         next()
         return
      }

      //Request before timeWindowFront will be discarded
      const timeWindowFront = date.getTime() - 1000;
      const newLog = log.filter((value) => value.getTime() > timeWindowFront)

      //check if new Log is greater than the specified threshold
      if (newLog.length >= this.logThreshold) {
         res.status(429).send('Too many requests')
         return
      }

      //Add a new log entry for this request
      newLog.push(date)

      //update the log for this ip
      this.logs.set(ip, newLog)
      next()

   }
   cleanup(): void {

   }
}