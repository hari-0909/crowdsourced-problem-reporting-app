
import {Outlet,Link,useLocation} from 'react-router-dom'
import {useEffect} from 'react'
import use_auth_store from '../store/auth_store'

const MainLayout=()=>{
  const user=use_auth_store((state)=>state.user)
  const logout=use_auth_store((state)=>state.logout)
  const initialize_auth=use_auth_store((state)=>state.initialize_auth)

  const location=useLocation()

  useEffect(()=>{
    initialize_auth()
  },[])

  const nav_link_class=(path)=>{
    return location.pathname===path
      ?'text-blue-400 font-semibold'
      :'text-gray-300 hover:text-white transition'
  }

  return(
    <div className='min-h-screen bg-gray-950 text-white'>
      <nav className='sticky top-0 z-50 border-b border-gray-800 bg-gray-950/95 backdrop-blur'>
        <div className='mx-auto flex max-w-7xl items-center justify-between px-6 py-4'>
          <Link
            to='/'
            className='text-2xl font-extrabold tracking-tight'
          >
            CivicTrack
          </Link>

          <div className='flex flex-wrap items-center gap-6 text-sm md:text-base'>
            <Link to='/' className={nav_link_class('/')}>
              Home
            </Link>

            {user&&(
              <>
                <Link to='/dashboard' className={nav_link_class('/dashboard')}>
                  Dashboard
                </Link>

                <Link to='/report' className={nav_link_class('/report')}>
                  Report Issue
                </Link>

                <Link to='/my-issues' className={nav_link_class('/my-issues')}>
                  My Issues
                </Link>
              </>
            )}

            {user?.role==='ADMIN'&&(
              <Link to='/admin' className={nav_link_class('/admin')}>
                Admin
              </Link>
            )}

            {!user&&(
              <>
                <Link to='/login' className={nav_link_class('/login')}>
                  Login
                </Link>

                <Link to='/register' className='rounded-lg bg-green-600 px-4 py-2 font-medium transition hover:bg-green-700'>
                  Register
                </Link>
              </>
            )}

            {user&&(
              <button
                onClick={logout}
                className='rounded-lg bg-red-600 px-4 py-2 font-medium transition hover:bg-red-700'
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className='mx-auto max-w-7xl px-4 py-8 md:px-6'>
        <Outlet/>
      </main>
    </div>
  )
}

export default MainLayout