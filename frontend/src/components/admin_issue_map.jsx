import React, {useMemo} from 'react'
import {MapContainer, TileLayer, Marker, Popup, useMap} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const MapViewport = ({markers}) => {
  const map = useMap()
  React.useEffect(() => {
    if (!markers || markers.length === 0) {
      map.setView([20.5937, 78.9629], 5)
      return
    }

    const bounds = L.latLngBounds(markers.map((m) => [m.latitude, m.longitude]))
    map.fitBounds(bounds, {padding: [40, 40], maxZoom: 15})
  }, [markers, map])

  return null
}

const AdminIssueMap = ({issues}) => {
  const markers = useMemo(() => issues
    .map((i) => {
      const lat = Number(i.latitude)
      const lng = Number(i.longitude)
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return {id: i.id, latitude: lat, longitude: lng, issue: i}
      }
      return null
    })
    .filter(Boolean), [issues])

  return (
    <div className='ct-card card-pad'>
      <div className='flex items-center justify-between'>
        <h3 className='ct-h2'>Issue Map</h3>
        <div className='muted text-sm'>Live view of reported issues</div>
      </div>

      <MapContainer className='h-[480px] w-full mt-4 rounded-lg' center={[20.5937,78.9629]} zoom={5}>
        <MapViewport markers={markers} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        {markers.map((m) => (
          <Marker key={m.id} position={[m.latitude, m.longitude]}>
            <Popup>
              <div className='min-w-[200px]'>
                <div className='font-semibold text-black'>{m.issue.title}</div>
                <div className='text-sm text-gray-700'>Type: {m.issue.type}</div>
                <div className='text-sm text-gray-700'>Status: {m.issue.status}</div>
                <div className='text-sm text-gray-700'>Reporter: {m.issue.user?.email || 'Unknown'}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default AdminIssueMap
