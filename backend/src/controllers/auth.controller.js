const {register,login,refresh,logout}=require('../services/auth.service')

const register_controller=async(req,res)=>{
  try{
    const data=await register(req.body)
    res.status(201).json({success:true,data})
  }catch(err){
    console.log("ERROR:",err)
    res.status(400).json({success:false,message:err.message})
  }
}

const login_controller=async(req,res)=>{
  try{
    const data=await login(req.body)
    res.status(200).json({success:true,data})
  }catch(err){
    console.log("ERROR:",err)
    res.status(401).json({success:false,message:err.message})
  }
}

const refresh_controller=async(req,res)=>{
  try{
    const {refresh_token}=req.body
    const data=await refresh(refresh_token)
    res.status(200).json({success:true,data})
  }catch(err){
    res.status(401).json({success:false,message:err.message})
  }
}
const logout_controller=async(req,res)=>{
  try{
    await logout(req.user.id)
    res.status(200).json({success:true,message:'Logged out'})
  }catch(err){
    res.status(500).json({success:false,message:err.message})
  }
}

module.exports={register_controller,login_controller,refresh_controller,logout_controller}