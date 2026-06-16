const {find_user_by_email,create_user,update_refresh_token}=require('../repositories/user.repository')
const {hash_password,compare_password}=require('../utils/hash')
const {generate_access_token,generate_refresh_token}=require('../utils/jwt')

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

module.exports={register,login,refresh,logout}