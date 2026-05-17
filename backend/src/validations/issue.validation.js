const validate_issue=(data)=>{
  const title=data.title?.trim()
  const description=data.description?.trim()
  const type=data.type?.trim()

  if(!title||!description||!type){
    throw new Error('Missing required fields')
  }

  const latitude=parseFloat(data.latitude)
  const longitude=parseFloat(data.longitude)

  if(isNaN(latitude)||isNaN(longitude)){
    throw new Error('Invalid coordinates')
  }

  return {
    title,
    description,
    type,
    latitude,
    longitude
  }
}

module.exports={validate_issue}