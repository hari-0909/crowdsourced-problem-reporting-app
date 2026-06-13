
import {useEffect,useState} from 'react'
import {Link} from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Dashboard=()=>{
  const [stats,set_stats]=useState({
    total:0,
    reported:0,
    in_progress:0,
    resolved:0
  })

  const [my_issues_count,set_my_issues_count]=useState(0)
  const [loading,set_loading]=useState(true)

  useEffect(()=>{
    fetch_dashboard_data()
  },[])

  const fetch_dashboard_data=async()=>{
    try{
      const my_issues_res=await api.get('/issues/my')

      set_my_issues_count(my_issues_res.data.data.length)

      const issue_list=my_issues_res.data.data

      const reported=issue_list.filter(issue=>issue.status==='REPORTED').length
      const in_progress=issue_list.filter(issue=>issue.status==='IN_PROGRESS').length
      const resolved=issue_list.filter(issue=>issue.status==='RESOLVED').length

      set_stats({
        total:issue_list.length,
        reported,
        in_progress,
        resolved
      })
    }catch(err){
      toast.error('Failed to load dashboard')
    }finally{
      set_loading(false)
    }
  }

  if(loading){
    return(
      <div className='flex min-h-[60vh] items-center justify-center text-xl'>
        Loading dashboard...
      </div>
    )
  }

  return(
    <div className='space-y-8'>
      <div>
        <h1 className='mb-2 text-4xl font-bold'>Dashboard</h1>
        <p className='text-gray-400'>
          Track your {my_issues_count} civic {my_issues_count===1?'report':'reports'} and issue progress.
        </p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-lg text-gray-400'>Total Issues</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.total}</p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-lg text-gray-400'>Reported</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.reported}</p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-lg text-gray-400'>In Progress</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.in_progress}</p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-6'>
          <h2 className='text-lg text-gray-400'>Resolved</h2>
          <p className='mt-2 text-4xl font-bold'>{stats.resolved}</p>
        </div>
      </div>

      <div className='rounded-2xl bg-gray-900 p-8'>
        <h2 className='mb-4 text-2xl font-bold'>Quick Actions</h2>

        <div className='flex flex-wrap gap-4'>
          <Link
            to='/report'
            className='rounded-lg bg-green-600 px-6 py-3 font-medium hover:bg-green-700'
          >
            Report New Issue
          </Link>

          <Link
            to='/my-issues'
            className='rounded-lg bg-blue-600 px-6 py-3 font-medium hover:bg-blue-700'
          >
            View My Issues
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
