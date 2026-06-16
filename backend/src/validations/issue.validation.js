// validators and sanitizers for issue data
const createValidationError=(errors)=>{
  const err=new Error('Validation error')
  err.isValidation=true
  err.errors=errors
  return err
}

const sanitizeString=(v)=>{
  if(typeof v!=='string')return v
  // trim and collapse multiple spaces
  let s=v.trim().replace(/\s+/g,' ')
  // remove script tags
  s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,'')
  // remove on* event handlers e.g., onerror="..."
  s = s.replace(/on\w+\s*=\s*(?:\".*?\"|'.*?'|[^\s>]+)/gi,'')
  // remove javascript: in href/src
  s = s.replace(/javascript:\s*/gi,'')
  return s
}

const ALLOWED_STATUSES=['REPORTED','IN_PROGRESS','RESOLVED']

const validate_issue=(data)=>{
  const errors=[]

  const titleRaw = data.title
  const descriptionRaw = data.description
  const typeRaw = data.type

  const title = sanitizeString(typeof titleRaw==='string'?titleRaw:'')
  const description = sanitizeString(typeof descriptionRaw==='string'?descriptionRaw:'')
  const type = sanitizeString(typeof typeRaw==='string'?typeRaw:'')

  if(!title)errors.push({field:'title',message:'Title is required'})
  if(!description)errors.push({field:'description',message:'Description is required'})
  if(!type)errors.push({field:'type',message:'Type is required'})

  if(title && (title.length<3 || title.length>120)){
    errors.push({field:'title',message:'Title must be between 3 and 120 characters'})
  }

  if(description && (description.length<10 || description.length>2000)){
    errors.push({field:'description',message:'Description must be between 10 and 2000 characters'})
  }

  if(type && type.length>50){
    errors.push({field:'type',message:'Type must be at most 50 characters'})
  }

  const latitude = parseFloat(data.latitude)
  const longitude = parseFloat(data.longitude)

  if(isNaN(latitude) || isNaN(longitude)){
    errors.push({field:'coordinates',message:'Latitude and longitude must be numeric'})
  }else{
    if(latitude < -90 || latitude > 90) errors.push({field:'latitude',message:'Latitude out of range'})
    if(longitude < -180 || longitude > 180) errors.push({field:'longitude',message:'Longitude out of range'})
  }

  if(errors.length)throw createValidationError(errors)

  return {title,description,type,latitude,longitude}
}

const validate_status=(status)=>{
  if(!ALLOWED_STATUSES.includes(status)){
    throw createValidationError([{field:'status',message:'Invalid status'}])
  }
  return status
}

const validate_nearby_params=(q)=>{
  const errors=[]
  const lat = parseFloat(q.lat)
  const lng = parseFloat(q.lng)
  const radius = parseFloat(q.radius)

  if(isNaN(lat))errors.push({field:'lat',message:'lat must be numeric'})
  if(isNaN(lng))errors.push({field:'lng',message:'lng must be numeric'})
  if(isNaN(radius))errors.push({field:'radius',message:'radius must be numeric'})

  if(!isNaN(radius)){
    if(radius <= 0) errors.push({field:'radius',message:'radius must be > 0'})
    if(radius > 50) errors.push({field:'radius',message:'radius must be <= 50'})
  }

  if(errors.length)throw createValidationError(errors)

  return {lat,lng,radius}
}

const validate_filter_status=(status)=>{
  if(!ALLOWED_STATUSES.includes(status)){
    throw createValidationError([{field:'status',message:'Invalid status'}])
  }
  return status
}

module.exports={validate_issue,validate_status,validate_nearby_params,validate_filter_status,sanitizeString}