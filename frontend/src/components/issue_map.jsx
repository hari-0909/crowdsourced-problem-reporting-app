import {MapContainer,TileLayer,Marker,Popup,useMap} from 'react-leaflet'
import {useEffect,useMemo} from 'react'
import L from 'leaflet'
import IssuePopup from './issue_popup'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const DEFAULT_CENTER=[20.5937,78.9629]
const DEFAULT_ZOOM=5
const DUPLICATE_OFFSET_METERS=24

const to_number=(value)=>Number(value)

const is_valid_coordinate=(latitude,longitude)=>(
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude>=-90 &&
  latitude<=90 &&
  longitude>=-180 &&
  longitude<=180
)

const offset_coordinate=([latitude,longitude],index,total)=>{
  if(total===1){
    return [latitude,longitude]
  }

  const angle=(2*Math.PI*index)/total
  const radius=total===2?DUPLICATE_OFFSET_METERS:DUPLICATE_OFFSET_METERS+(total*2)
  const lat_offset=(Math.sin(angle)*radius)/111320
  const lng_offset=(Math.cos(angle)*radius)/(111320*Math.cos(latitude*Math.PI/180))

  return [latitude+lat_offset,longitude+lng_offset]
}

const build_marker_data=(issues)=>{
  const valid_issues=issues
    .map((issue,index)=>{
      const latitude=to_number(issue.latitude)
      const longitude=to_number(issue.longitude)

      if(!is_valid_coordinate(latitude,longitude)){
        return null
      }

      return {
        issue,
        source_index:index,
        original_position:[latitude,longitude],
        coordinate_key:`${latitude.toFixed(7)},${longitude.toFixed(7)}`
      }
    })
    .filter(Boolean)

  const groups=valid_issues.reduce((result,item)=>{
    result[item.coordinate_key] ||= []
    result[item.coordinate_key].push(item)
    return result
  },{})

  return valid_issues.map((item)=>{
    const group=groups[item.coordinate_key]
    const group_index=group.findIndex((group_item)=>group_item.source_index===item.source_index)

    return {
      ...item,
      position:offset_coordinate(item.original_position,group_index,group.length),
      duplicate_count:group.length
    }
  })
}

const MapViewport=({center,markers})=>{
  const map=useMap()

  useEffect(()=>{
    if(markers.length>1){
      const bounds=L.latLngBounds(markers.map((marker)=>marker.position))
      map.fitBounds(bounds,{padding:[44,44],maxZoom:15})
      return
    }

    if(markers.length===1){
      map.setView(markers[0].position,15)
      return
    }

    if(center){
      map.setView(center,13)
      return
    }

    map.setView(DEFAULT_CENTER,DEFAULT_ZOOM)
  },[center,map,markers])

  return null
}

const IssueMap=({issues,center})=>{
  const markers=useMemo(()=>build_marker_data(issues),[issues])

  return(
    <MapContainer
      center={center||DEFAULT_CENTER}
      zoom={center?13:DEFAULT_ZOOM}
      className='h-[700px] w-full rounded-lg'
    >
      <MapViewport center={center} markers={markers}/>

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />

      {markers.map((marker)=>(
        <Marker
          key={marker.issue.id||marker.source_index}
          position={marker.position}
        >
          <Popup>
            <IssuePopup
              issue={marker.issue}
              duplicateCount={marker.duplicate_count}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default IssueMap
