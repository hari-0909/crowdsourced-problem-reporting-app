const multer=require('multer')

const storage=multer.memoryStorage()
const allowed_image_types=['image/jpeg','image/png','image/webp']

const upload=multer({
  storage,
  limits:{
    fileSize:5*1024*1024
  },
  fileFilter:(req,file,cb)=>{
    if(allowed_image_types.includes(file.mimetype)){
      cb(null,true)
      return
    }

    const err = new Error('Invalid file type.')
    err.status = 400
    cb(err)
  }
})

module.exports=upload
