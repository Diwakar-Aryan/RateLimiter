import express from 'express'
import { RateLimiterType } from './enums'
import { RateLimiter, RateLimiterArgs } from './types'

export const createRateLimiterServer = (
   rateLimiterType: RateLimiterType,
   args: RateLimiterArgs,
   port: number = 8080,
   debug: boolean = false
) => {
   const app = express()
   app.use(express.json())
   app.use(express.text())

   const rateLimiter = getRateLimiter(rateLimiterType, args)

   app.use('/limited', (req, res, next) => {
      rateLimiter.handleRequest(req, res, next)
   })
   app.get('/limited', (req, res, next) => {
      res.send('Limited Api Endpoint\n')
   })
   app.get('/unlimited', (req, res, next) => {
      res.send('Unlimited Api Endpoint')
   })
   const server = app.listen(port, () => {
      if (debug) console.log(`Started Server on port ${port}`);

   })
   server.on('close', () => {
      rateLimiter.cleanup()
   })

   return { server, rateLimiter }

}

function getRateLimiter(rateLimiterType:RateLimiterType,args:RateLimiterArgs):any{
   switch (rateLimiterType){
      case RateLimiterType.TOKEN_BUCKET:{
         return 
      }
   }
}