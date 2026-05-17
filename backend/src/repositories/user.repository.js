const prisma=require('../configs/db')

const find_user_by_email=async(email)=>{
  return await prisma.user.findUnique({where:{email}})
}

const create_user=async(data)=>{
  return await prisma.user.create({data})
}

const update_refresh_token=async(user_id,token)=>{
  return await prisma.user.update({
    where:{id:user_id},
    data:{refreshToken:token}
  })
}

module.exports={find_user_by_email,create_user,update_refresh_token}