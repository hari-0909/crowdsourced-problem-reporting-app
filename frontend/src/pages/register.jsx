
import {useState} from 'react'
import {useEffect, useRef} from 'react'
import {useNavigate,Link} from 'react-router-dom'
import toast from 'react-hot-toast'
import use_auth_store from '../store/auth_store'

const Register=()=>{
  const navigate=useNavigate()
  const register=use_auth_store((state)=>state.register)
  const googleSignIn=use_auth_store((state)=>state.googleSignIn)
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

    if(form_data.password.length<6){
      toast.error('Password must be at least 6 characters')
      return
    }

    const res=await register(form_data)

    if(res.success){
      toast.success('Account created successfully')
      navigate('/login')
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
            const r = await googleSignIn(id_token)
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

  return(
    <div className='flex min-h-[85vh] items-center justify-center px-4'>
      <form
        onSubmit={handle_submit}
        className='w-full max-w-md space-y-6 rounded-2xl bg-gray-900 p-10 shadow-xl'
      >
        <div className='text-center'>
          <h2 className='mb-2 text-4xl font-bold'>Create Account</h2>
          <p className='text-gray-400'>
            Join the civic reporting network.
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
          className='w-full rounded-xl bg-green-600 p-4 text-lg font-semibold transition hover:bg-green-700'
        >
          {loading?'Creating account...':'Register'}
        </button>

        <div className='flex items-center justify-center'>
          <div ref={googleButtonRef}></div>
        </div>

        <p className='text-center text-gray-400'>
          Already registered?{' '}
          <Link to='/login' className='font-medium text-blue-400'>
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register