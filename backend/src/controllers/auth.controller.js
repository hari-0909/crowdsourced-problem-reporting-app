const {register,login,refresh,logout}=require('../services/auth.service')
const {validateRegister,validateLogin}=require('../validations/auth.validation')

const register_controller=async(req,res)=>{
  try{
    const validated = validateRegister(req.body)
    const data=await register(validated)
    res.status(201).json({success:true,data})
  }catch(err){
    if(err.isValidation){
      return res.status(400).json({success:false,message:'Validation error',errors:err.errors})
    }
    console.error("register error:", err.message)
    res.status(400).json({success:false,message:err.message})
  }
}

const login_controller=async(req,res)=>{
  try{
    const validated = validateLogin(req.body)
    const data=await login(validated)
    res.status(200).json({success:true,data})
  }catch(err){
    if(err.isValidation){
      return res.status(400).json({success:false,message:'Validation error',errors:err.errors})
    }
    console.error("login error:", err.message)
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