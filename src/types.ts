import { Request, Response, NextFunction } from 'express'


/**
 * This is a generic interface that a Rate limiter has to implement.
 *
 * @export
 * @interface RateLimiter
 */
export interface RateLimiter {
   handleRequest(req: Request, res: Response, next: NextFunction): void;
   cleanup(): void;
}

export type TokenBucketArgs = {
   capacity: number,
   timePeriodInMs: number
}

export type FixedWindowCounterArgs = {
   threshold: number
}

export type SlidingWindowLogArgs = {
   logThreshold: number
}

export type SlidingWindowCounterArgs = {
   threshold: number
}

export type RateLimiterArgs = | TokenBucketArgs | FixedWindowCounterArgs | SlidingWindowCounterArgs | SlidingWindowCounterArgs | SlidingWindowLogArgs