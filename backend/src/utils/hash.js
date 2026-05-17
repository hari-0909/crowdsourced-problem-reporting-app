const bcrypt=require('bcrypt')

const hash_password=async(password)=>{
  return await bcrypt.hash(password,10)
}

const compare_password=async(password,hash)=>{
  return await bcrypt.compare(password,hash)
}

module.exports={hash_password,compare_password}