// Utility to apply Cloudinary optimization parameters to Cloudinary URLs only
export const optimizeCloudinary = (url, opts = {}) => {
  if(!url || typeof url !== 'string') return url

  // Quick check for Cloudinary hosted URL patterns
  if(!url.includes('res.cloudinary.com') && !url.includes('/upload/')) return url

  const { width } = opts
  // If URL already contains '/upload/' insert transformations after it
  try{
    const parts = url.split('/upload/')
    if(parts.length<2) return url
    const before = parts[0]
    const after = parts.slice(1).join('/upload/')

    const transforms = ['f_auto','q_auto']
    if(width) transforms.push(`w_${width}`)

    return `${before}/upload/${transforms.join(',')}/${after}`
  }catch(e){
    return url
  }
}
