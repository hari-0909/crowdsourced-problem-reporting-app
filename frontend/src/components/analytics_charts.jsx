import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'

const AnalyticsCharts=({issues})=>{
  const status_data=[
    {
      name:'Reported',
      value:issues.filter(i=>i.status==='REPORTED').length
    },
    {
      name:'In Progress',
      value:issues.filter(i=>i.status==='IN_PROGRESS').length
    },
    {
      name:'Resolved',
      value:issues.filter(i=>i.status==='RESOLVED').length
    }
  ]

  const type_map={}

  issues.forEach(issue=>{
    type_map[issue.type]=(type_map[issue.type]||0)+1
  })

  const type_data=Object.entries(type_map).map(
    ([name,value])=>({name,value})
  )

  const colors=[
    '#eab308',
    '#3b82f6',
    '#22c55e'
  ]

  return(
    <div className='mb-8 grid gap-6 lg:grid-cols-2'>
      <div className='ct-card card-pad'>
        <div className='flex items-center justify-between'>
          <h2 className='ct-h2'>Issues By Status</h2>
          <div className='flex gap-3'>
            <div className='flex items-center gap-2'><span className='w-3 h-3 rounded-full' style={{background:colors[0]}}></span><span className='muted text-sm'>Reported</span></div>
            <div className='flex items-center gap-2'><span className='w-3 h-3 rounded-full' style={{background:colors[1]}}></span><span className='muted text-sm'>In Progress</span></div>
            <div className='flex items-center gap-2'><span className='w-3 h-3 rounded-full' style={{background:colors[2]}}></span><span className='muted text-sm'>Resolved</span></div>
          </div>
        </div>

        <div style={{height:300}} className='mt-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={status_data}
                dataKey='value'
                outerRadius={100}
                innerRadius={48}
                paddingAngle={4}
              >
                {status_data.map((entry,index)=>(
                  <Cell key={index} fill={colors[index]} />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className='ct-card card-pad'>
        <div className='flex items-center justify-between'>
          <h2 className='ct-h2'>Issues By Type</h2>
        </div>

        <div style={{height:300}} className='mt-4'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={type_data} margin={{left:0,right:20}}>
              <CartesianGrid strokeDasharray='6 6' stroke='rgba(255,255,255,0.03)' />
              <XAxis dataKey='name' tick={{fill:'#aab6c6'}} />
              <YAxis tick={{fill:'#aab6c6'}} />
              <Tooltip />
              <Bar dataKey='value' fill={colors[1]} radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsCharts