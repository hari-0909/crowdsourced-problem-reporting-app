const {find_user_by_email,create_user,update_refresh_token}=require('../repositories/user.repository')
const {hash_password,compare_password}=require('../utils/hash')
const {generate_access_token,generate_refresh_token}=require('../utils/jwt')
const {OAuth2Client}=require('google-auth-library')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const register=async({email,password})=>{
  const existing=await find_user_by_email(email)
  if(existing)throw new Error('User already exists')
  const hashed=await hash_password(password)
  const user=await create_user({email,password:hashed})
  return {id:user.id,email:user.email}
}

const login=async({email,password})=>{
  const user=await find_user_by_email(email)
  if(!user)throw new Error('Invalid credentials')
  const valid=await compare_password(password,user.password)
  if(!valid)throw new Error('Invalid credentials')
  const payload={id:user.id,email:user.email,role:user.role}
  const access_token=generate_access_token(payload)
  const refresh_token=generate_refresh_token(payload)
  await update_refresh_token(user.id,refresh_token)
  return {access_token,refresh_token}
}

const google_login=async(id_token)=>{
  if(!id_token) throw new Error('No id token provided')

  // Verify token with Google's library
  let ticket
  try{
    ticket = await googleClient.verifyIdToken({idToken:id_token,audience:process.env.GOOGLE_CLIENT_ID})
  }catch(err){
    throw new Error('Invalid Google ID token')
  }

  const payload = ticket.getPayload()

  const email = payload.email
  if(!email) throw new Error('Google account has no email')

  // find existing user
  let user = await find_user_by_email(email)

  if(!user){
    // create user. We don't set a password for Google users — set empty string
    user = await create_user({email, password: ''})
  }

  const tokenPayload = {id: user.id, email: user.email, role: user.role}

  const access_token = generate_access_token(tokenPayload)
  const refresh_token = generate_refresh_token(tokenPayload)

  await update_refresh_token(user.id, refresh_token)

  return {access_token, refresh_token}
}

const refresh=async(refresh_token)=>{
  if(!refresh_token)throw new Error('No refresh token')
  const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
  const decoded=require('jsonwebtoken').verify(refresh_token,REFRESH_SECRET)
  const user=await find_user_by_email(decoded.email)
  if(!user || user.refreshToken!==refresh_token){
    throw new Error('Invalid refresh token')
  }
  const payload={id:user.id,email:user.email,role:user.role}
  const new_access_token=generate_access_token(payload)
  return {access_token:new_access_token}
}
const logout=async(user_id)=>{
  await update_refresh_token(user_id,null)
}

module.exports={register,login,refresh,logout,google_login}