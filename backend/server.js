require('dotenv').config()
const app=require('./src/app')

const PORT=process.env.PORT||6000

app.listen(PORT,()=>{
  console.log(`server running on port ${PORT}`)
})
const cors=require('cors')
app.use(cors({
  origin:'http://localhost:3000',
  credentials:true
}))