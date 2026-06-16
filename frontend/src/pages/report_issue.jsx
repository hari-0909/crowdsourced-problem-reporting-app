
import {useRef,useState,useEffect} from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { findSimilarIssues, deriveAreaFromCoords, haversineKm } from '../utils/issue_utils'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import '../components/issue_map'

const CATEGORIES = [
  'Road',
  'Electricity',
  'Water Supply',
  'Garbage',
  'Drainage',
  'Street Light',
  'Public Safety',
  'Other'
]

const ReportIssue=()=>{
  const [form_data,set_form_data]=useState({
    title:'',
    description:'',
    type:'',
    latitude:'',
    longitude:''
  })

  const [image,set_image]=useState(null)
  const [imagePreview,set_imagePreview]=useState(null)
  const [loading,set_loading]=useState(false)
  const image_input_ref=useRef(null)
  const [existingIssues,setExistingIssues]=useState([])
  const [similar,setSimilar]=useState([])
  const [nearbySimilar,set_nearbySimilar]=useState(false)
  const [locationText,set_locationText]=useState({area:'',city:'',state:''})
  const [mapCenter,set_mapCenter]=useState(null)

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
        const lat = position.coords.latitude
        const lng = position.coords.longitude

        set_form_data((prev)=>({
          ...prev,
          latitude:lat.toString(),
          longitude:lng.toString()
        }))
        set_mapCenter([lat,lng])
        ;(async ()=>{
          try{
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
            const data = await res.json()

            const area = data.address?.suburb || data.address?.neighbourhood || data.address?.hamlet || data.address?.village || data.address?.town || data.address?.city || ''
            const city = data.address?.city || data.address?.town || data.address?.county || ''
            const state = data.address?.state || data.address?.region || ''

            set_locationText({ area: area || deriveAreaFromCoords(lat,lng), city: city||'Unknown', state: state||'' })
          }catch(e){
            set_locationText({ area: deriveAreaFromCoords(lat,lng), city: 'Unknown', state: '' })
          }
        })()

        toast.success('Location captured')
      },
      ()=>{
        toast.error('Failed to fetch location')
      }
    )
  }

  useEffect(()=>{
    let active = true
    const load = async ()=>{
      try{
        const res = await api.get('/issues')
        if(!active) return
        setExistingIssues(Array.isArray(res.data?.data)?res.data.data:[])
      }catch(e){
      }
    }

    load()
    return ()=>{ active=false }
  },[])
  useEffect(()=>{
    const candidate = {
      title: form_data.title,
      description: form_data.description,
      type: form_data.type,
      latitude: form_data.latitude,
      longitude: form_data.longitude
    }

    if(!candidate.title && !candidate.description) {
      setSimilar([])
      set_nearbySimilar(false)
      return
    }
    const matches = findSimilarIssues(candidate, existingIssues, { scoreThreshold: 0.35, proximityKm: 0.3 })
    setSimilar(matches)
    const candLat = candidate.latitude ? Number(candidate.latitude) : null
    const candLng = candidate.longitude ? Number(candidate.longitude) : null

    if(candLat!=null && candLng!=null){
      const existsNearby = existingIssues.some(i=>{
        try{
          if(!i.type) return false
          if(!candidate.type) return false
          if(i.type.trim().toLowerCase() !== candidate.type.trim().toLowerCase()) return false
          const d = haversineKm(candLat, candLng, Number(i.latitude), Number(i.longitude))
          return d <= 0.3
        }catch(e){ return false }
      })

      set_nearbySimilar(Boolean(existsNearby))
    }else{
      set_nearbySimilar(false)
    }
  },[form_data.title, form_data.description, form_data.type, form_data.latitude, form_data.longitude, existingIssues])

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
      if(imagePreview){
        URL.revokeObjectURL(imagePreview)
        set_imagePreview(null)
      }

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
    <div className='mx-auto max-w-3xl'>
      <h1 className='mb-6 text-4xl font-bold'>Report New Issue</h1>

      <form onSubmit={handle_submit} className='space-y-6'>
        {/* Location Section */}
        <div className='ct-card card-pad overflow-hidden'>
          <div className='ct-sub mb-2 font-semibold' id='location-section'>Location</div>

          <div className='flex flex-col gap-3 md:flex-row md:items-center'>
            <div className='flex-1'>
              <div className='text-sm text-gray-300'>Use your current device location or enter coordinates.</div>
              <div className='mt-3 flex flex-col gap-2 md:flex-row'>
                <input
                  type='text'
                  name='latitude'
                  placeholder='Latitude'
                  value={form_data.latitude}
                  onChange={handle_change}
                  className='rounded-lg bg-gray-900 p-3 md:flex-1'
                  required
                />

                <input
                  type='text'
                  name='longitude'
                  placeholder='Longitude'
                  value={form_data.longitude}
                  onChange={handle_change}
                  className='rounded-lg bg-gray-900 p-3 md:flex-1'
                  required
                />
              </div>
            </div>

            <div className='mt-3 md:mt-0 md:ml-4'>
              <button type='button' onClick={handle_location} className='rounded-lg bg-blue-600 px-4 py-2'>Use Current Location</button>
            </div>
          </div>

          {/* Human readable area/city/state */}
          {(locationText.area||locationText.city||locationText.state||mapCenter) && (
            <div className='mt-4 flex items-start gap-3'>
              <div className='text-xl'>📍</div>
              <div>
                <div className='font-medium text-gray-400'>
                  {locationText.area ? `${locationText.area}, ${locationText.city}` : deriveAreaFromCoords(form_data.latitude, form_data.longitude)}
                </div>
                {locationText.state ? (
                  <div className='text-sm text-gray-400'>{locationText.state}</div>
                ) : null}

                {/* Secondary coordinates line */}
                {form_data.latitude && form_data.longitude && (
                  <div className='mt-1 text-xs text-gray-500'>Lat: {form_data.latitude} • Lng: {form_data.longitude}</div>
                )}
              </div>
            </div>
          )}

          {/* Mini read-only map preview */}
          {mapCenter && (
            <div className='mt-4 overflow-hidden rounded-lg border'>
              <MapContainer
                center={mapCenter}
                zoom={15}
                className='w-full h-[200px] sm:h-[220px] md:h-[260px]'
                dragging={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' attribution='&copy; OpenStreetMap contributors' />
                <Marker position={mapCenter} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Issue Details Section */}
        <div className='ct-card card-pad space-y-3'>
          <div className='ct-sub font-semibold' id='details-section'>Issue Details</div>

          <input
            type='text'
            name='title'
            placeholder='Issue Title'
            value={form_data.title}
            onChange={handle_change}
            className='w-full rounded-lg bg-white p-3 border'
            required
          />

          <select
            name='type'
            value={form_data.type}
            onChange={handle_change}
            className='w-full rounded-lg bg-white p-3 border'
            required
          >
            <option value=''>Select category</option>
            {CATEGORIES.map((c)=> (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <textarea
            name='description'
            placeholder='Detailed Description'
            value={form_data.description}
            onChange={handle_change}
            className='min-h-[140px] w-full rounded-lg bg-white p-3 border'
            required
          />
        </div>

        {/* Evidence section */}
        <div className='ct-card card-pad'>
          <div className='ct-sub font-semibold mb-3' id='evidence-section'>Evidence</div>

          <div className='flex flex-col gap-3'>
            <input
              ref={image_input_ref}
              type='file'
              accept='image/*'
              aria-label='Upload evidence image'
              onChange={(e)=>{
                const f = e.target.files[0]||null
                set_image(f)
                if(f){
                  if(imagePreview) URL.revokeObjectURL(imagePreview)
                  set_imagePreview(URL.createObjectURL(f))
                }else{
                  if(imagePreview) URL.revokeObjectURL(imagePreview)
                  set_imagePreview(null)
                }
              }}
              className='w-full rounded-lg p-3 border'
            />

            {imagePreview && (
              <div className='flex items-center gap-3'>
                <img src={imagePreview} alt='preview' className='h-20 w-20 rounded-md object-cover' />
                <div className='flex-1'>
                  <div className='text-sm text-gray-900'>{image?.name}</div>
                  <div className='text-xs text-gray-500'>Selected image</div>
                </div>
                <div>
                  <button type='button' onClick={()=>{ set_image(null); if(image_input_ref.current) image_input_ref.current.value=''; if(imagePreview){ URL.revokeObjectURL(imagePreview); set_imagePreview(null) } }} className='text-sm text-red-500'>Remove</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar issue advisory (non-blocking) */}
        {nearbySimilar && (
          <div className='rounded-lg border border-yellow-600/40 bg-yellow-600/10 px-4 py-3 text-yellow-100'>
            Similar issue already exists nearby. You may still submit your report.
          </div>
        )}

        {/* Existing lightweight similarity list (advisory) */}
        {similar && similar.length>0 && (
          <div className='rounded-lg border border-yellow-600/40 bg-yellow-600/10 px-4 py-3 text-yellow-100'>
            <div className='font-semibold'>Similar issue may already exist nearby.</div>
            <div className='mt-2 space-y-2'>
              {similar.slice(0,5).map(s=> (
                <div key={s.issue.id} className='flex items-center gap-3'>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>{s.issue.title}</div>
                    <div className='text-xs text-gray-300 line-clamp-2'>{s.issue.description}</div>
                    <div className='text-xs text-gray-400'>Type: {s.issue.type || '—'} • Score: {Math.round(s.score*100)}%</div>
                  </div>
                  <div>
                    <a href={`/issues/${s.issue.id}`} className='text-xs text-blue-300 hover:underline'>View</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-xl bg-green-600 p-4 text-lg font-semibold transition hover:bg-green-700 disabled:opacity-60'
        >
          {loading?'Submitting...':'Submit Issue'}
        </button>
      </form>
    </div>
  )
}

export default ReportIssue
