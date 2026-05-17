const express=require('express')
const router=express.Router()

const {verify_token,allow_roles}=require('../middlewares/auth.middleware')
const {get_issue_stats_controller}=require('../controllers/issue.controller')
router.get('/stats',verify_token,allow_roles('ADMIN'),get_issue_stats_controller)

module.exports=router