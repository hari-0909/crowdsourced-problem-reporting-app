const createValidationError=(errors)=>{
  const err=new Error('Validation error')
  err.isValidation=true
  err.errors=errors
  return err
}

const isEmail=(s)=>{ 
  if(typeof s!=='string')return false
  // simple email regex
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)
}

const sanitizeEmail=(s)=>{
  if(typeof s!=='string')return s
  return s.trim().toLowerCase().replace(/\s+/g,'')
}

const validateRegister=(body)=>{
  const errors=[]
  const emailRaw = body.email
  const password = body.password

  const email = sanitizeEmail(emailRaw)

  if(!email)errors.push({field:'email',message:'Email is required'})
  else if(!isEmail(email))errors.push({field:'email',message:'Invalid email'})

  if(!password)errors.push({field:'password',message:'Password is required'})
  else if(typeof password!=='string' || password.length < 8 || password.length > 128) {
    errors.push({field:'password',message:'Password must be between 8 and 128 characters'})
  }

  if(errors.length)throw createValidationError(errors)

  return {email,password}
}

const validateLogin=(body)=>{
  const errors=[]
  const email = sanitizeEmail(body.email)
  const password = body.password

  if(!email)errors.push({field:'email',message:'Email is required'})
  if(!password)errors.push({field:'password',message:'Password is required'})

  if(errors.length)throw createValidationError(errors)

  return {email,password}
}

module.exports={validateRegister,validateLogin}
