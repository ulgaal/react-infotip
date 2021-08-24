import { Pin } from '../../src'
import Copy from './Copy'
import Keyboard from './Keyboard'
import { noEvent } from './chartUtils'
import './CurveTipWrapper.css'

const CurveTipWrapper = props => {
  const {
    pinned,
    wrapper: Wrapper,
    onPin,
    onPointerDown,
    children,
    index,
    keyboard,
    onKeyboard,
    onCopy,
    ...rest
  } = props
  return (
    <Wrapper pinned={pinned} {...rest}>
      <div className='curve-tip-wrapper' onPointerDown={onPointerDown}>
        <div className='curve-tip-icons' onMouseMove={noEvent}>
          <div title={pinned ? 'Unpin tip' : 'Pin tip'}>
            <Pin className='curve-tip' pinned={pinned} onPointerDown={onPin} />
          </div>
          <Keyboard onClick={onKeyboard} on={keyboard} />
          <div title='Copy contents to clipboard' onPointerDown={onCopy}>
            <Copy />
          </div>
        </div>
        {children}
      </div>
    </Wrapper>
  )
}

export default CurveTipWrapper
