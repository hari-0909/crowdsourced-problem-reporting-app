
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom'
import Home from '../pages/home'
import Login from '../pages/login'
import Register from '../pages/register'
import Dashboard from '../pages/dashboard'
import ReportIssue from '../pages/report_issue'
import MyIssues from '../pages/my_issues'
import AdminDashboard from '../pages/admin_dashboard'
import NotFound from '../pages/not_found'
import MainLayout from '../layouts/main_layout'
import use_auth_store from '../store/auth_store'

const ProtectedRoute=({children})=>{
  const user=use_auth_store((state)=>state.user)
  const auth_initialized=use_auth_store((state)=>state.auth_initialized)

  if(!auth_initialized){
    return(
      <div className='flex min-h-screen items-center justify-center bg-gray-950 text-white'>
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
      <div className='flex min-h-screen items-center justify-center bg-gray-950 text-white'>
        Loading...
      </div>
    )
  }

  return user?.role==='ADMIN'?children:<Navigate to='/dashboard'/>
}

const AppRoutes=()=>{
  return(
    <BrowserRouter>
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
    </BrowserRouter>
  )
}

export default AppRoutes