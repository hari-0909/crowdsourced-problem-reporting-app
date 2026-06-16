const {createIssue,getAllIssues,getMyIssues,updateIssueStatus,getNearbyIssues,getFilteredIssues,getIssueStats}=require('../services/issue.service')
const {validate_issue,validate_status,validate_nearby_params,validate_filter_status}=require('../validations/issue.validation')

const create_issue_controller=async(req,res)=>{
  try{
    const validated = validate_issue(req.body)
    const issue=await createIssue(req.user.id,validated,req.file)
    res.status(201).json({success:true,data:issue})
  }catch(err){
    if(err.isValidation){
      return res.status(400).json({success:false,message:'Validation error',errors:err.errors})
    }
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
    // validate status
    try{
      validate_status(status)
    }catch(e){
      if(e.isValidation) return res.status(400).json({success:false,message:'Validation error',errors:e.errors})
      throw e
    }

    const updated=await updateIssueStatus(id,status)

    res.status(200).json({success:true,data:updated})
  }catch(err){
    res.status(400).json({success:false,message:err.message})
  }
}

const get_nearby_issues_controller=async(req,res)=>{
  try{
    const {lat,lng,radius}=req.query
    try{
      const validated = validate_nearby_params(req.query)
      const data=await getNearbyIssues(validated.lat,validated.lng,validated.radius)
      res.status(200).json({success:true,data})
    }catch(e){
      if(e.isValidation) return res.status(400).json({success:false,message:'Validation error',errors:e.errors})
      throw e
    }
  }catch(err){
    res.status(400).json({success:false,message:err.message})
  }
}

const get_filtered_issues_controller=async(req,res)=>{
  try{
    const {status}=req.query
    try{
      validate_filter_status(status)
    }catch(e){
      if(e.isValidation) return res.status(400).json({success:false,message:'Validation error',errors:e.errors})
      throw e
    }
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
