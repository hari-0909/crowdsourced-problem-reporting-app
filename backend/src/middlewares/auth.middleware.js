const jwt=require('jsonwebtoken')

const verify_token=(req,res,next)=>{
  try{
    const auth_header=req.headers.authorization
    if(!auth_header)return res.status(401).json({success:false,message:'No token provided'})

    const token=auth_header.split(' ')[1]
    if(!token)return res.status(401).json({success:false,message:'Invalid token format'})

    const decoded=jwt.verify(token,process.env.JWT_ACCESS_SECRET)

    req.user=decoded
    next()
  }catch(err){
    return res.status(401).json({success:false,message:'Unauthorized'})
  }
}

const allow_roles=(...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.user.role)){
      return res.status(403).json({success:false,message:'Forbidden'})
    }
    next()
  }
}

module.exports={verify_token,allow_roles}