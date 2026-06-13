const express=require('express')
const cors=require('cors')
const multer=require('multer')
const user_routes=require('./routes/user.routes')
const auth_routes=require('./routes/auth.routes')
const issue_routes=require('./routes/issue.routes')
const admin_routes=require('./routes/admin.routes')

const app=express()

app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}))
app.use(express.json())
app.use((req,res,next)=>{
  console.log("REQUEST HIT:",req.method,req.url)
  next()
})

app.get('/health',(req,res)=>{
  res.status(200).json({message:'server is running'})
})

app.use('/api/issues',issue_routes)
app.use('/api/auth',auth_routes)
app.use('/api/user',user_routes)
app.use('/api/admin',admin_routes)

app.use((err,req,res,next)=>{
  if(err instanceof multer.MulterError){
    return res.status(400).json({success:false,message:err.message})
  }

  if(err){
    return res.status(400).json({success:false,message:err.message})
  }

  next()
})

module.exports=app
