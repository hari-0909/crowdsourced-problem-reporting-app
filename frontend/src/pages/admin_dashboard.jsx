
import {useEffect,useState} from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AdminDashboard=()=>{
  const default_stats={
    total:0,
    reported:0,
    in_progress:0,
    resolved:0
  }

  const [stats,set_stats]=useState({
    total:0,
    reported:0,
    in_progress:0,
    resolved:0
  })

  const [issues,set_issues]=useState([])
  const [loading,set_loading]=useState(true)

  useEffect(()=>{
    fetch_admin_data()
  },[])

  const fetch_admin_data=async()=>{
    try{
      const [stats_result,issues_result]=await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/issues')
      ])

      if(stats_result.status==='fulfilled'){
        set_stats(stats_result.value.data.data)
      }else{
        set_stats(default_stats)
        toast.error('Failed to load issue stats')
      }

      if(issues_result.status==='fulfilled'){
        set_issues(issues_result.value.data.data)
      }else{
        set_issues([])
        toast.error('Failed to load issues')
      }
    }finally{
      set_loading(false)
    }
  }

  const update_status=async(issue_id,status)=>{
    try{
      await api.patch(`/issues/${issue_id}/status`,{status})

      toast.success('Issue status updated')

      fetch_admin_data()
    }catch(err){
      toast.error('Failed to update status')
    }
  }

  if(loading){
    return(
      <div className='flex min-h-[60vh] items-center justify-center text-xl'>
        Loading admin dashboard...
      </div>
    )
  }

  return(
    <div className='space-y-10'>
      <div>
        <h1 className='mb-2 text-4xl font-bold'>Admin Dashboard</h1>
        <p className='text-gray-400'>
          Manage all reported issues across the platform.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-gray-400'>Total</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.total}</p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-gray-400'>Reported</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.reported}</p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-gray-400'>In Progress</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.in_progress}</p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-gray-400'>Resolved</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.resolved}</p>
        </div>
      </div>

      <div className='space-y-6'>
        {issues.map((issue)=>(
          <div
            key={issue.id}
            className='rounded-2xl bg-gray-900 p-6'
          >
            <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
              <h2 className='text-2xl font-bold'>{issue.title}</h2>

              <span className='rounded-full bg-gray-800 px-4 py-1'>
                {issue.status}
              </span>
            </div>

            <p className='mb-4 text-gray-300'>
              {issue.description}
            </p>

            <div className='mb-5 text-sm text-gray-400'>
              <p>Type: {issue.type}</p>
              <p>User: {issue.user?.email||'Unknown'}</p>
            </div>

            <div className='flex flex-wrap gap-3'>
              <button
                onClick={()=>update_status(issue.id,'REPORTED')}
                className='rounded-lg bg-yellow-600 px-4 py-2'
              >
                Reported
              </button>

              <button
                onClick={()=>update_status(issue.id,'IN_PROGRESS')}
                className='rounded-lg bg-blue-600 px-4 py-2'
              >
                In Progress
              </button>

              <button
                onClick={()=>update_status(issue.id,'RESOLVED')}
                className='rounded-lg bg-green-600 px-4 py-2'
              >
                Resolved
              </button>
            </div>

            {issue.imageUrl&&(
              <img
                src={issue.imageUrl}
                alt='Issue'
                className='mt-5 max-h-80 w-full rounded-xl object-cover'
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
