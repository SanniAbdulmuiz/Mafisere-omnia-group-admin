'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import LoadingSpinner from './LoadingSpinner'
import { getActivityData } from '@/lib/fetchActivityData'

const defaultData = [
  { day: 'Mon', gadgets: 0, autos: 0, realEstate: 0 },
  { day: 'Tue', gadgets: 0, autos: 0, realEstate: 0 },
  { day: 'Wed', gadgets: 0, autos: 0, realEstate: 0 },
  { day: 'Thu', gadgets: 0, autos: 0, realEstate: 0 },
  { day: 'Fri', gadgets: 0, autos: 0, realEstate: 0 },
  { day: 'Sat', gadgets: 0, autos: 0, realEstate: 0 },
  { day: 'Sun', gadgets: 0, autos: 0, realEstate: 0 },
]

export default function ActivityChart() {
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const activityData = await getActivityData()
        setData(activityData)
      } catch (error) {
        console.error('Error fetching activity data:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="card" style={{marginBottom: 16}}>
        <LoadingSpinner message="Loading activity data..." />
      </div>
    )
  }

  return (
    <div className="card" style={{marginBottom: 16}}>
      <h3 className="sec-title" style={{marginBottom: 16}}>Inventory Upload Activity (Last 7 Days)</h3>
      <div style={{width: '100%', height: 280}}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{top: 10, right: 20, left: 0, bottom: 0}}>
            <defs>
              <linearGradient id="colorGadgets" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1A4FA0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#1A4FA0" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAutos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2e7d32" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorRealEstate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f57f17" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f57f17" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="day" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Legend iconType="circle" verticalAlign="top" height={30} />

            <Area 
              type="monotone" 
              dataKey="gadgets" 
              stackId="1" 
              stroke="#1A4FA0" 
              fillOpacity={1} 
              fill="url(#colorGadgets)" 
              name="Gadgets"
            />
            <Area 
              type="monotone" 
              dataKey="autos" 
              stackId="1" 
              stroke="#2e7d32" 
              fillOpacity={1} 
              fill="url(#colorAutos)" 
              name="Autos"
            />
            <Area 
              type="monotone" 
              dataKey="realEstate" 
              stackId="1" 
              stroke="#f57f17" 
              fillOpacity={1} 
              fill="url(#colorRealEstate)" 
              name="Real Estate"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}