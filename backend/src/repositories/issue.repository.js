const prisma=require('../configs/db')

const create_issue=async(data)=>{
  return await prisma.issue.create({data})
}

const get_all_issues=async()=>{
  return await prisma.issue.findMany({
    include:{
      user:{
        select:{
          id:true,
          email:true,
          role:true,
          createdAt:true
        }
      }
    },
    orderBy:{createdAt:'desc'}
  })
}

const get_issues_by_user=async(user_id)=>{
  return await prisma.issue.findMany({
    where:{createdBy:user_id},
    orderBy:{createdAt:'desc'}
  })
}

const get_nearby_issues=async(minLat,maxLat,minLng,maxLng)=>{
  return await prisma.issue.findMany({
    where:{
      latitude:{gte:minLat,lte:maxLat},
      longitude:{gte:minLng,lte:maxLng}
    },
    orderBy:{createdAt:'desc'}
  })
}

const get_issues_with_filter=async(status)=>{
  return await prisma.issue.findMany({
    where: status?{status}:undefined,
    orderBy:{createdAt:'desc'}
  })
}

const get_issue_stats=async()=>{
  const total=await prisma.issue.count()
  const reported=await prisma.issue.count({where:{status:'REPORTED'}})
  const in_progress=await prisma.issue.count({where:{status:'IN_PROGRESS'}})
  const resolved=await prisma.issue.count({where:{status:'RESOLVED'}})

  return {total,reported,in_progress,resolved}
}

module.exports={create_issue,get_all_issues,get_issues_by_user,get_nearby_issues,get_issues_with_filter,get_issue_stats}
