const express=require('express')
const router=express.Router()

const {verify_token,allow_roles}=require('../middlewares/auth.middleware')
const upload=require('../middlewares/upload.middleware')

const {
  create_issue_controller,
  get_all_issues_controller,
  get_my_issues_controller,
  update_issue_status_controller,
  get_nearby_issues_controller,
  get_filtered_issues_controller
}=require('../controllers/issue.controller')

router.post('/',verify_token,upload.single('image'),create_issue_controller)
router.get('/',get_all_issues_controller)
router.get('/my',verify_token,get_my_issues_controller)
router.get('/nearby',get_nearby_issues_controller)
router.patch('/:id/status',verify_token,allow_roles('ADMIN'),update_issue_status_controller)
router.get('/filter',get_filtered_issues_controller)
module.exports=router