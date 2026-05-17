const express=require('express')
const cors=require('cors')
const user_routes=require('./routes/user.routes')
const auth_routes=require('./routes/auth.routes')
const issue_routes=require('./routes/issue.routes')

const app=express()
app.use(express.json())
app.use('/api/issues',issue_routes)
app.use(cors())
app.use('/api/auth',auth_routes)
app.use('/api/user',user_routes)
app.use((req,res,next)=>{
  console.log("REQUEST HIT:",req.method,req.url)
  next()
})
app.get('/health',(req,res)=>{
  res.status(200).json({message:'server is running'})
})
const admin_routes=require('./routes/admin.routes')
app.use('/api/admin',admin_routes)

module.exports=app