const cloudinary=require('../configs/cloudinary')

const upload_to_cloudinary=(file)=>{
  return new Promise((resolve,reject)=>{
    cloudinary.uploader.upload_stream(
      {folder:'issues'},
      (err,result)=>{
        if(err)return reject(err)
        resolve(result.secure_url)
      }
    ).end(file.buffer)
  })
}

module.exports={upload_to_cloudinary}