const {createIssue,getAllIssues,getMyIssues,updateIssueStatus,getNearbyIssues,getFilteredIssues,getIssueStats}=require('../services/issue.service')

const create_issue_controller=async(req,res)=>{
  try{
    const issue=await createIssue(req.user.id,req.body,req.file)
    res.status(201).json({success:true,data:issue})
  }catch(err){
    res.status(400).json({success:false,message:err.message})
  }
}

const get_all_issues_controller=async(req,res)=>{
  try{
    const issues=await getAllIssues()
    res.status(200).json({success:true,data:issues})
  }catch(err){
    res.status(500).json({success:false,message:err.message})
  }
}

const get_my_issues_controller=async(req,res)=>{
  try{
    const issues=await getMyIssues(req.user.id)
    res.status(200).json({success:true,data:issues})
  }catch(err){
    res.status(500).json({success:false,message:err.message})
  }
}

const update_issue_status_controller=async(req,res)=>{
  try{
    const {id}=req.params
    const {status}=req.body

    const updated=await updateIssueStatus(id,status)

    res.status(200).json({success:true,data:updated})
  }catch(err){
    res.status(400).json({success:false,message:err.message})
  }
}

const get_nearby_issues_controller=async(req,res)=>{
  try{
    const {lat,lng,radius}=req.query

    const data=await getNearbyIssues(lat,lng,radius)

    res.status(200).json({success:true,data})
  }catch(err){
    res.status(400).json({success:false,message:err.message})
  }
}

const get_filtered_issues_controller=async(req,res)=>{
  try{
    const {status}=req.query
    const data=await getFilteredIssues(status)
    res.status(200).json({success:true,data})
  }catch(err){
    res.status(400).json({success:false,message:err.message})
  }
}

const get_issue_stats_controller=async(req,res)=>{
  try{
    const data=await getIssueStats()
    res.status(200).json({success:true,data})
  }catch(err){
    res.status(500).json({success:false,message:err.message})
  }
}

module.exports={
  create_issue_controller,
  get_all_issues_controller,
  get_my_issues_controller,
  update_issue_status_controller,
  get_nearby_issues_controller,
  get_filtered_issues_controller,
  get_issue_stats_controller
}
