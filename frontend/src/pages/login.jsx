
import {useState} from 'react'
import {useEffect, useRef} from 'react'
import {useNavigate,Link} from 'react-router-dom'
import toast from 'react-hot-toast'
import use_auth_store from '../store/auth_store'

const Login=()=>{
  const navigate=useNavigate()
  const login=use_auth_store((state)=>state.login)
  const loading=use_auth_store((state)=>state.loading)

  const [form_data,set_form_data]=useState({
    email:'',
    password:''
  })

  const handle_change=(e)=>{
    set_form_data({
      ...form_data,
      [e.target.name]:e.target.value
    })
  }

  const handle_submit=async(e)=>{
    e.preventDefault()

    if(!form_data.email||!form_data.password){
      toast.error('All fields are required')
      return
    }

    const res=await login(form_data)

    if(res.success){
      toast.success('Welcome back')
      navigate('/dashboard')
    }else{
      toast.error(res.message)
    }
  }

  const googleButtonRef = useRef()

  useEffect(()=>{
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if(!clientId) return

    const win = window
    const load = () => {
      if(!win.google) return
      try{
        win.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res) => {
            const id_token = res.credential
            const r = await loginWithGoogle(id_token)
            if(r.success){
              toast.success('Signed in with Google')
              navigate('/dashboard')
            }else{
              toast.error(r.message)
            }
          }
        })
        win.google.accounts.id.renderButton(
          googleButtonRef.current,
          {theme:'outline',size:'large',text:'continue_with'}
        )
      }catch(err){
        // ignore
      }
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = load
    document.body.appendChild(script)

    return ()=>{
      document.body.removeChild(script)
    }
  },[navigate])

  const loginWithGoogle = async (idToken) => {
    const res = await use_auth_store.getState().googleSignIn(idToken)
    return res
  }

  return(
    <div className='flex min-h-[85vh] items-center justify-center px-4'>
      <form
        onSubmit={handle_submit}
        className='w-full max-w-md space-y-6 rounded-2xl bg-gray-900 p-10 shadow-xl'
      >
        <div className='text-center'>
          <h2 className='mb-2 text-4xl font-bold'>Welcome Back</h2>
          <p className='text-gray-400'>
            Login to continue improving your community.
          </p>
        </div>

        <input
          type='email'
          name='email'
          placeholder='Email Address'
          value={form_data.email}
          onChange={handle_change}
          className='w-full rounded-xl bg-gray-800 p-4'
        />

        <input
          type='password'
          name='password'
          placeholder='Password'
          value={form_data.password}
          onChange={handle_change}
          className='w-full rounded-xl bg-gray-800 p-4'
        />

        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-xl bg-blue-600 p-4 text-lg font-semibold transition hover:bg-blue-700'
        >
          {loading?'Signing in...':'Login'}
        </button>

        <div className='flex items-center justify-center'>
          <div ref={googleButtonRef}></div>
        </div>

        <p className='text-center text-gray-400'>
          New here?{' '}
          <Link to='/register' className='font-medium text-blue-400'>
            Create account
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login