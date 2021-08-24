import { noEvent } from './chartUtils'
import './CurveTip.css'

const CurveTip = props => {
  const { point } = props
  if (point) {
    const { x, y } = point
    return (
      <div className='curve-tip' onMouseMove={noEvent}>
        <div>Coordinates:</div>
        <div>x={x}</div>
        <div>y={y}</div>
      </div>
    )
  }
  return null
}

export default CurveTip
