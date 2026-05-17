const express=require('express')
const router=express.Router()

const {register_controller,login_controller}=require('../controllers/auth.controller')
const {refresh_controller,logout_controller}=require('../controllers/auth.controller')
const {verify_token}=require('../middlewares/auth.middleware')

router.post('/logout',verify_token,logout_controller)
router.post('/refresh',refresh_controller)
router.post('/register',register_controller)
router.post('/login',login_controller)

module.exports=router