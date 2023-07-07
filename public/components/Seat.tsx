import { FunctionComponent } from 'preact'
import { SeatStatus } from '../models/SeatType'

// TODO use styled component?
function get_button_class_by_status(status: SeatStatus) {
  return `clickable seat seat-${status.toLowerCase()}`
}

type Props = {
  seat_id: string
  status: SeatStatus
  offered_price: number
  onReserve: Function
  hour: number
  variant: 's' | 'm'
}

let isDrag = false

const Seat: FunctionComponent<Props> = (props: Props) => {
  const { seat_id, status, offered_price, onReserve, hour, variant } = props
  const disabled = status !== SeatStatus.AVAILABLE && status !== SeatStatus.RESERVE

  const window_handleSeatMouseUp = (e) => handleSeatMouseUp(e, seat_id)

  const handleSeatMouseDown = (_e, seat_id) => {
    if (disabled) return

    isDrag = true
    window.document.addEventListener('mouseup', window_handleSeatMouseUp)

    onReserve(seat_id)
  }

  const handleSeatMouseUp = (_e, _seat_id) => {
    isDrag = false
    window.document.removeEventListener('mouseup', window_handleSeatMouseUp)
  }

  const handleSeatMouseEnter = (_e, seat_id) => {
    if (disabled) return
    if (!isDrag) return

    onReserve(seat_id)
  }

  const handleMouseOver = (_e, _seat_id) => {
    // TODO
  }

  const handleMouseLeave = (_e, _seat_id) => {
    // TODO
  }

  return variant === 's' ? (
    <div disabled={disabled} class={get_button_class_by_status(status)}>
      {hour.toString().padStart(2, '0')}
    </div>
  ) : (
    <div
      disabled={disabled}
      class={get_button_class_by_status(status)}
      onMouseDown={(e) => {
        handleSeatMouseDown(e, seat_id)
      }}
      onMouseUp={(e) => handleSeatMouseUp(e, seat_id)}
      onMouseEnter={(e) => handleSeatMouseEnter(e, seat_id)}
      onMouseOver={(e) => handleMouseOver(e, seat_id)}
      onMouseLeave={(e) => handleMouseLeave(e, seat_id)}
    >
      <div>
        <div>
          {hour.toString().padStart(2, '0')}:00 <span style={{ opacity: 0.5 }}>→</span> {hour.toString().padStart(2, '0')}:59
        </div>
        <hr />
        <div class="price">{offered_price} 🍋</div>
      </div>
    </div>
  )
}

export default Seat
