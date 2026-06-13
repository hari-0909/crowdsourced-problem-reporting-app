
import {useRef,useState} from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const ReportIssue=()=>{
  const [form_data,set_form_data]=useState({
    title:'',
    description:'',
    type:'',
    latitude:'',
    longitude:''
  })

  const [image,set_image]=useState(null)
  const [loading,set_loading]=useState(false)
  const image_input_ref=useRef(null)

  const handle_change=(e)=>{
    set_form_data({
      ...form_data,
      [e.target.name]:e.target.value
    })
  }

  const handle_location=()=>{
    if(!navigator.geolocation){
      toast.error('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position)=>{
        set_form_data((prev)=>({
          ...prev,
          latitude:position.coords.latitude.toString(),
          longitude:position.coords.longitude.toString()
        }))
        toast.success('Location captured')
      },
      ()=>{
        toast.error('Failed to fetch location')
      }
    )
  }

  const handle_submit=async(e)=>{
    e.preventDefault()

    const payload=new FormData()

    Object.entries(form_data).forEach(([key,value])=>{
      payload.append(key,value)
    })

    if(image){
      payload.append('image',image)
    }

    try{
      set_loading(true)

      await api.post('/issues',payload,{
        headers:{
          'Content-Type':'multipart/form-data'
        }
      })

      toast.success('Issue reported successfully')

      set_form_data({
        title:'',
        description:'',
        type:'',
        latitude:'',
        longitude:''
      })

      set_image(null)

      if(image_input_ref.current){
        image_input_ref.current.value=''
      }
    }catch(err){
      toast.error(err.response?.data?.message||'Failed to report issue')
    }finally{
      set_loading(false)
    }
  }

  return(
    <div className='mx-auto max-w-3xl rounded-2xl bg-gray-900 p-8 shadow-lg'>
      <h1 className='mb-6 text-4xl font-bold'>Report New Issue</h1>

      <form onSubmit={handle_submit} className='space-y-5'>
        <input
          type='text'
          name='title'
          placeholder='Issue Title'
          value={form_data.title}
          onChange={handle_change}
          className='w-full rounded-lg bg-gray-800 p-4'
          required
        />

        <textarea
          name='description'
          placeholder='Detailed Description'
          value={form_data.description}
          onChange={handle_change}
          className='min-h-[140px] w-full rounded-lg bg-gray-800 p-4'
          required
        />

        <input
          type='text'
          name='type'
          placeholder='Issue Type (Road, Water, Electricity...)'
          value={form_data.type}
          onChange={handle_change}
          className='w-full rounded-lg bg-gray-800 p-4'
          required
        />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <input
            type='text'
            name='latitude'
            placeholder='Latitude'
            value={form_data.latitude}
            onChange={handle_change}
            className='rounded-lg bg-gray-800 p-4'
            required
          />

          <input
            type='text'
            name='longitude'
            placeholder='Longitude'
            value={form_data.longitude}
            onChange={handle_change}
            className='rounded-lg bg-gray-800 p-4'
            required
          />
        </div>

        <button
          type='button'
          onClick={handle_location}
          className='rounded-lg bg-blue-600 px-5 py-3'
        >
          Use Current Location
        </button>

        <input
          ref={image_input_ref}
          type='file'
          accept='image/*'
          onChange={(e)=>set_image(e.target.files[0]||null)}
          className='w-full rounded-lg bg-gray-800 p-3'
        />

        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-xl bg-green-600 p-4 text-lg font-semibold transition hover:bg-green-700'
        >
          {loading?'Submitting...':'Submit Issue'}
        </button>
      </form>
    </div>
  )
}

export default ReportIssue
