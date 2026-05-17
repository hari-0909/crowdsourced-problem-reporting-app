const express=require('express')
const router=express.Router()

const {verify_token}=require('../middlewares/auth.middleware')

router.get('/me',verify_token,(req,res)=>{
  res.status(200).json({
    success:true,
    user:req.user
  })
})

module.exports=router