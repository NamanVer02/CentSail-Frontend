'use client'

interface RadarChartProps {
  data: {
    label: string
    value: number
    icon: string
  }[]
}

export default function RadarChart({ data }: RadarChartProps) {
  const maxValue = 100
  const centerX = 150
  const centerY = 150
  const radius = 100
  const angleStep = (2 * Math.PI) / data.length

  // Calculate polygon points
  const polygonPoints = data
    .map((item, index) => {
      const angle = angleStep * index - Math.PI / 2
      const distance = (item.value / maxValue) * radius
      const x = centerX + distance * Math.cos(angle)
      const y = centerY + distance * Math.sin(angle)
      return `${x},${y}`
    })
    .join(' ')

  // Calculate label positions
  const labelPositions = data.map((item, index) => {
    const angle = angleStep * index - Math.PI / 2
    const x = centerX + (radius + 40) * Math.cos(angle)
    const y = centerY + (radius + 40) * Math.sin(angle)
    return { x, y, label: item.label, value: item.value, icon: item.icon }
  })

  return (
    <div className="relative w-full aspect-square max-w-[300px] mx-auto">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        {/* Background hexagon grid */}
        {[100, 75, 50, 25].map((percent) => {
          const points = Array.from({ length: data.length })
            .map((_, index) => {
              const angle = angleStep * index - Math.PI / 2
              const distance = (percent / 100) * radius
              const x = centerX + distance * Math.cos(angle)
              const y = centerY + distance * Math.sin(angle)
              return `${x},${y}`
            })
            .join(' ')

          return (
            <polygon
              key={percent}
              points={points}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          )
        })}

        {/* Lines from center */}
        {labelPositions.map((pos, index) => {
          const angle = angleStep * index - Math.PI / 2
          const endX = centerX + radius * Math.cos(angle)
          const endY = centerY + radius * Math.sin(angle)
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(255,255,255,0.2)"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const angle = angleStep * index - Math.PI / 2
          const distance = (item.value / maxValue) * radius
          const x = centerX + distance * Math.cos(angle)
          const y = centerY + distance * Math.sin(angle)
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="white"
            />
          )
        })}
      </svg>

      {/* Labels positioned around the chart */}
      {labelPositions.map((pos, index) => (
        <div
          key={index}
          className="absolute text-center text-white/80 text-xs"
          style={{
            left: `${(pos.x / 300) * 100}%`,
            top: `${(pos.y / 300) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: '60px'
          }}
        >
          <div className="text-lg mb-1">{pos.icon}</div>
          <div className="font-medium">{pos.value}%</div>
          <div className="text-[10px]">{pos.label}</div>
        </div>
      ))}
    </div>
  )
}
