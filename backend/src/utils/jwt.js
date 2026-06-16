const jwt=require('jsonwebtoken')
const ACCESS_SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

const generate_access_token=(payload)=>{
  return jwt.sign(payload,ACCESS_SECRET,{expiresIn:'15m'})
}

const generate_refresh_token=(payload)=>{
  return jwt.sign(payload,REFRESH_SECRET,{expiresIn:'7d'})
}

module.exports={generate_access_token,generate_refresh_token}