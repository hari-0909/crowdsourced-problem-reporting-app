import {useEffect,useState} from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import IssueMap from '../components/issue_map'

const Explore=()=>{
  const [issues,set_issues]=useState([])
  const [loading,set_loading]=useState(false)
  const [initial_loading,set_initial_loading]=useState(true)
  const [error,set_error]=useState('')

  const [radius,set_radius]=useState(5)

  const [center,set_center]=useState(null)

  const get_issue_list=(response)=>{
    const data=response?.data?.data
    return Array.isArray(data)?data:[]
  }

  const fetch_all_issues=async()=>{
    set_loading(true)
    set_error('')

    try{
      const res=await api.get('/issues')
      const issue_list=get_issue_list(res)

      set_issues(issue_list)
      set_center(null)
    }catch(err){
      set_issues([])
      set_error(err.response?.data?.message||'Failed to load issues')
      toast.error('Failed to load issues')
    }finally{
      set_loading(false)
      set_initial_loading(false)
    }
  }

  const fetch_nearby_issues=()=>{
    if(!navigator.geolocation){
      toast.error('Geolocation not supported')
      return
    }

    set_loading(true)
    set_error('')

    navigator.geolocation.getCurrentPosition(
      async(position)=>{
        try{
          const lat=position.coords.latitude
          const lng=position.coords.longitude

          set_center([lat,lng])

          const res=await api.get('/issues/nearby',{
            params:{
              lat,
              lng,
              radius
            }
          })

          const issue_list=get_issue_list(res)

          set_issues(issue_list)

          toast.success(`Found ${issue_list.length} nearby issues`)
        }catch(err){
          set_issues([])
          set_error(err.response?.data?.message||'Failed to fetch nearby issues')
          toast.error('Failed to fetch nearby issues')
        }finally{
          set_loading(false)
        }
      },
      ()=>{
        set_loading(false)
        set_error('Failed to get location')
        toast.error('Failed to get location')
      }
    )
  }

  useEffect(()=>{
    let active=true

    const load_initial_issues=async()=>{
      try{
        const res=await api.get('/issues')
        const issue_list=get_issue_list(res)

        if(!active){
          return
        }

        set_issues(issue_list)
        set_center(null)
      }catch(err){
        if(!active){
          return
        }

        set_issues([])
        set_error(err.response?.data?.message||'Failed to load issues')
        toast.error('Failed to load issues')
      }finally{
        if(active){
          set_initial_loading(false)
        }
      }
    }

    load_initial_issues()

    return ()=>{
      active=false
    }
  },[])

  if(initial_loading){
    return(
      <div className='flex min-h-[70vh] items-center justify-center text-xl'>
        Loading map...
      </div>
    )
  }

  return(
    <div className='space-y-6'>
      <div>
        <h1 className='text-4xl font-bold'>
          Explore Issues
        </h1>

        <p className='mt-2 text-gray-400'>
          View civic issues across locations.
        </p>
      </div>

      <div className='flex flex-wrap gap-4'>
        <select
          value={radius}
          onChange={(e)=>set_radius(Number(e.target.value))}
          className='rounded-lg bg-gray-900 px-4 py-3'
        >
          <option value={1}>1 KM</option>
          <option value={5}>5 KM</option>
          <option value={10}>10 KM</option>
          <option value={25}>25 KM</option>
        </select>

        <button
          onClick={fetch_nearby_issues}
          disabled={loading}
          className='rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          {loading?'Loading...':'Use My Location'}
        </button>

        <button
          onClick={fetch_all_issues}
          disabled={loading}
          className='rounded-lg bg-green-600 px-5 py-3 font-medium hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60'
        >
          Show All Issues
        </button>
      </div>

      {error&&(
        <div className='rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200'>
          {error}
        </div>
      )}

      {!loading&&!error&&issues.length===0&&(
        <div className='rounded-lg border border-gray-700 bg-gray-900 px-4 py-6 text-gray-300'>
          No issues found.
        </div>
      )}

      <IssueMap
        issues={issues}
        center={center}
      />
    </div>
  )
}

export default Explore
