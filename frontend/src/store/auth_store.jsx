
import {create} from 'zustand'
import api from '../api/axios'

const use_auth_store=create((set,get)=>({
  user:null,
  loading:false,
  auth_initialized:false,

  register:async(data)=>{
    set({loading:true})

    try{
      await api.post('/auth/register',data)

      set({loading:false})

      return {success:true}
    }catch(err){
      set({loading:false})

      return {
        success:false,
        message:err.response?.data?.message||'Registration failed'
      }
    }
  },

  login:async(data)=>{
    set({loading:true})

    try{
      const res=await api.post('/auth/login',data)

      localStorage.setItem('access_token',res.data.data.access_token)
      localStorage.setItem('refresh_token',res.data.data.refresh_token)

      await get().fetch_me()

      set({loading:false})

      return {success:true}
    }catch(err){
      set({loading:false})

      return {
        success:false,
        message:err.response?.data?.message||'Login failed'
      }
    }
  },

  googleSignIn:async(idToken)=>{
    set({loading:true})

    try{
      const res=await api.post('/auth/google',{id_token:idToken})

      localStorage.setItem('access_token',res.data.data.access_token)
      localStorage.setItem('refresh_token',res.data.data.refresh_token)

      await get().fetch_me()

      set({loading:false})

      return {success:true}
    }catch(err){
      set({loading:false})

      return {
        success:false,
        message:err.response?.data?.message||'Google sign in failed'
      }
    }
  },

  fetch_me:async()=>{
    try{
      const res=await api.get('/user/me')

      set({
        user:res.data.user,
        auth_initialized:true
      })
    }catch(err){
      set({
        user:null,
        auth_initialized:true
      })
    }
  },

  initialize_auth:async()=>{
    const token=localStorage.getItem('access_token')

    if(!token){
      set({
        user:null,
        auth_initialized:true
      })
      return
    }

    await get().fetch_me()
  },

  logout:async()=>{
    try{
      await api.post('/auth/logout')
    }catch(err){}

    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')

    set({
      user:null,
      auth_initialized:true
    })

    window.location.href='/login'
  }
}))

export default use_auth_store