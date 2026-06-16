const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {success:false,message:'Too many requests. Please try again later.'}
})

const registerLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {success:false,message:'Too many requests. Please try again later.'}
})

const issueCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {success:false,message:'Too many requests. Please try again later.'}
})

module.exports={loginLimiter,registerLimiter,issueCreationLimiter}
