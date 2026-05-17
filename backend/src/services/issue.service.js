const {create_issue,get_all_issues,get_issues_by_user}=require('../repositories/issue.repository')
const {validate_issue}=require('../validations/issue.validation')
const prisma=require('../configs/db')
const {upload_to_cloudinary}=require('../utils/cloudinary_upload')

const createIssue=async(user_id,data,file)=>{
  const validated=validate_issue(data)

  let image_url=null

  if(file){
    image_url=await upload_to_cloudinary(file)
  }

  return await create_issue({
    ...validated,
    imageUrl:image_url,
    createdBy:user_id
  })
}

const getAllIssues=async()=>{
  return await get_all_issues()
}

const getMyIssues=async(user_id)=>{
  return await get_issues_by_user(user_id)
}

const updateIssueStatus=async(issue_id,status)=>{
  return await prisma.issue.update({
    where:{id:issue_id},
    data:{status}
  })
}

const getNearbyIssues=async(lat,lng,radius)=>{
  const latitude=parseFloat(lat)
  const longitude=parseFloat(lng)
  const r=parseFloat(radius)

  if(isNaN(latitude)||isNaN(longitude)||isNaN(r)){
    throw new Error('Invalid query params')
  }

  const latRange=r/111
  const lngRange=r/(111*Math.cos(latitude*Math.PI/180))

  const minLat=latitude-latRange
  const maxLat=latitude+latRange
  const minLng=longitude-lngRange
  const maxLng=longitude+lngRange

  return await require('../repositories/issue.repository')
    .get_nearby_issues(minLat,maxLat,minLng,maxLng)
}

const getFilteredIssues=async(status)=>{
  return await require('../repositories/issue.repository')
    .get_issues_with_filter(status)
}

const getIssueStats=async()=>{
  return await require('../repositories/issue.repository')
    .get_issue_stats()
}

module.exports={createIssue,getAllIssues,getMyIssues,updateIssueStatus,getNearbyIssues,getFilteredIssues,getIssueStats}