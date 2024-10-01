import { Express } from 'express'
import { bodyParser, cors, contenType } from '@/main/config/middleware/'

export default (app: Express): void => {
  app.use(bodyParser)
  app.use(cors)
  app.use(contenType)
}
