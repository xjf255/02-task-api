import { ACCEPTED_ORIGINS } from '../util.js'

export const optionsMiddleware = (req, res, next) => {
  const origin = req.headers.origin

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    res.header("Access-Control-Allow-Origin", origin || "*")
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,OPTIONS")
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization")
    return res.sendStatus(200)
  }

  res.status(403).send("Origin not allowed")
}