
import {useEffect,useState} from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const MyIssues=()=>{
  const [issues,set_issues]=useState([])
  const [loading,set_loading]=useState(true)

  useEffect(()=>{
    fetch_my_issues()
  },[])

  const fetch_my_issues=async()=>{
    try{
      const res=await api.get('/issues/my')
      set_issues(res.data.data)
    }catch(err){
      toast.error('Failed to load your issues')
    }finally{
      set_loading(false)
    }
  }

  if(loading){
    return(
      <div className='flex min-h-[60vh] items-center justify-center text-xl'>
        Loading your issues...
      </div>
    )
  }

  return(
    <div>
      <div className='mb-8'>
        <h1 className='mb-2 text-4xl font-bold'>My Reported Issues</h1>
        <p className='text-gray-400'>
          Monitor all issues you’ve submitted.
        </p>
      </div>

      {issues.length===0?(
        <div className='rounded-2xl bg-gray-900 p-8 text-center text-gray-400'>
          No issues reported yet.
        </div>
      ):(
        <div className='grid gap-6'>
          {issues.map((issue)=>(
            <div
              key={issue.id}
              className='rounded-2xl bg-gray-900 p-6 shadow-md'
            >
              <div className='mb-3 flex items-center justify-between'>
                <h2 className='text-2xl font-bold'>{issue.title}</h2>

                <span className='rounded-full bg-gray-800 px-4 py-1 text-sm'>
                  {issue.status}
                </span>
              </div>

              <p className='mb-4 text-gray-300'>
                {issue.description}
              </p>

              <div className='grid grid-cols-1 gap-2 text-sm text-gray-400 md:grid-cols-2'>
                <p><strong>Type:</strong> {issue.type}</p>
                <p><strong>Latitude:</strong> {issue.latitude}</p>
                <p><strong>Longitude:</strong> {issue.longitude}</p>
                <p><strong>Created:</strong> {new Date(issue.createdAt).toLocaleString()}</p>
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
      )}
    </div>
  )
}

export default MyIssues