
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import {lazy,Suspense} from 'react'
import Home from '../pages/home'
import NotFound from '../pages/not_found'
import MainLayout from '../layouts/main_layout'
import use_auth_store from '../store/auth_store'
import LoadingFallback from '../components/LoadingFallback'

// Lazy-loaded pages (reduce initial bundle)
const Login = lazy(()=>import('../pages/login'))
const Register = lazy(()=>import('../pages/register'))
const Dashboard = lazy(()=>import('../pages/dashboard'))
const ReportIssue = lazy(()=>import('../pages/report_issue'))
const MyIssues = lazy(()=>import('../pages/my_issues'))
const AdminDashboard = lazy(()=>import('../pages/admin_dashboard'))
const Explore = lazy(()=>import('../pages/explore'))

const ProtectedRoute=({children})=>{
  const user=use_auth_store((state)=>state.user)
  const auth_initialized=use_auth_store((state)=>state.auth_initialized)

  if(!auth_initialized){
        return(
          <div className='flex min-h-screen items-center justify-center' style={{background:'var(--page-bg)', color:'var(--text-primary)'}}>
        Loading...
      </div>
    )
  }

  return user?children:<Navigate to='/login'/>
}

const AdminRoute=({children})=>{
  const user=use_auth_store((state)=>state.user)
  const auth_initialized=use_auth_store((state)=>state.auth_initialized)

  if(!auth_initialized){
        return(
          <div className='flex min-h-screen items-center justify-center' style={{background:'var(--page-bg)', color:'var(--text-primary)'}}>
        Loading...
      </div>
    )
  }

  return user?.role==='ADMIN'?children:<Navigate to='/dashboard'/>
}

const AppRoutes=()=>{
  return(
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback/>}>
        <Routes>
          <Route path='/' element={<MainLayout/>}>
            <Route index element={<Home/>}/>
            <Route path='login' element={<Login/>}/>
            <Route path='register' element={<Register/>}/>
            <Route
              path='dashboard'
              element={
                <ProtectedRoute>
                  <Dashboard/>
                </ProtectedRoute>
              }
            />
            <Route
              path='report'
              element={
                <ProtectedRoute>
                  <ReportIssue/>
                </ProtectedRoute>
              }
            />
            <Route
              path='my-issues'
              element={
                <ProtectedRoute>
                  <MyIssues/>
                </ProtectedRoute>
              }
            />
            <Route
              path='explore'
              element={
                <ProtectedRoute>
                  <Explore/>
                </ProtectedRoute>
              }
            />
            <Route
              path='admin'
              element={
                <AdminRoute>
                  <AdminDashboard/>
                </AdminRoute>
              }
            />
            <Route path='*' element={<NotFound/>}/>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default AppRoutes