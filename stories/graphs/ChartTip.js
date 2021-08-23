import './ChartTip.css'

const ChartTip = props => {
  const {
    extremum: { ymin, ymax }
  } = props
  return (
    <div className='chart-tip'>
      <div>Extremum:</div>
      <div>min={ymin}</div>
      <div>max={ymax}</div>
    </div>
  )
}

export default ChartTip
