
import axios from 'axios'

const API_BASE_URL=import.meta.env.VITE_API_URL||'http://localhost:8080/api'

const api=axios.create({
  baseURL:API_BASE_URL,
  withCredentials:true
})

api.interceptors.request.use((config)=>{
  const token=localStorage.getItem('access_token')

  if(token){
    config.headers.Authorization=`Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response)=>response,
  async(error)=>{
    const original_request=error.config

    if(!original_request){
      return Promise.reject(error)
    }

    if(
      error.response?.status===401 &&
      !original_request._retry &&
      localStorage.getItem('refresh_token')
    ){
      original_request._retry=true

      try{
        const res=await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {
            refresh_token:localStorage.getItem('refresh_token')
          }
        )

        const new_access_token=res.data.data.access_token

        localStorage.setItem('access_token',new_access_token)

        original_request.headers.Authorization=`Bearer ${new_access_token}`

        return api(original_request)
      }catch(err){
        localStorage.clear()
        window.location.href='/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
