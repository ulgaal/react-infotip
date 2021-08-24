import './Keyboard.css'

const Keyboard = props => {
  const { on, onClick } = props
  return (
    <div
      onPointerDown={onClick}
      className={`keyboard-icon-${on ? 'on' : 'off'}`}
      title={on ? 'Keyboard off' : 'Keyboard on'}
    >
      <svg version='1.1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'>
        {
          on
            ? (
              <path d='M3,1 h14 a 2 2 90 0 1 2 2 v 14 a 2 2 90 0 1 -2 2 h-14 a 2 2 90 0 1 -2 -2 v-14 a 2 2 90 0 1 2 -2 M6,12 h4 v3 l5,-5 l-5,-5 v3 h-4 v-4 z' />
              )
            : (
              <g>
                <path d='M3,1 h14 a 2 2 90 0 1 2 2 v 14 a 2 2 90 0 1 -2 2 h-14 a 2 2 90 0 1 -2 -2 v-14 a 2 2 90 0 1 2 -2 z' />
                <path d='M6,8 h4 v-3 l5,5 l-5,5 v-3 h-4 v-4 z' />
              </g>
              )
        }
      </svg>
    </div>
  )
}

export default Keyboard
