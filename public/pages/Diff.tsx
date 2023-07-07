import { FunctionComponent, render } from 'preact'
import { useState } from 'preact/hooks'
import { get_user_session } from '../lib/cf'
import DragButton from '../components/DragButton'
import useSyncReserves from '../hooks/useSyncReserves'
import { SeatStatus } from '../models/SeatType'
import { computed, signal } from '@preact/signals'
import '../diff.css'

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

const get_total_price = (computed_reserves) =>
  computed(() => {
    let _total_price = 0
    computed_reserves.value.map((computed_reserve) => {
      if (computed_reserve.status === SeatStatus.RESERVE) {
        _total_price = parseFloat((_total_price + computed_reserve.offered_price).toFixed(2))
      }
    })

    return _total_price
  })

const Diff = () => {
  const user_session = get_user_session()
  const [pubkey] = useState(user_session.pubkey)
  const { reservations, reservations_map, today, reserves } = useSyncReserves()
  console.log('reservations:', reservations.value)
  console.log('reservations_map:', reservations_map.value)

  const cancelDrag = () => {
    isDrag = false
  }

  const handleCheckout = () => {
    // TODO: Call write api reservations
    const request_payload = {
      reserve_seat_ids: reserves
    }
    console.log('handleCheckout:', request_payload)
  }

  const handleReserve = (seat_id) => {
    const seat_index = reserves.value.findIndex((id) => id === seat_id)
    if (seat_index >= 0) {
      reserves.value.splice(seat_index, 1)
      reserves.value = [...reserves.value]
      return
    }
    reserves.value = [...reserves.value, seat_id]
  }

  // Aggregate reservations from remote state to local state.
  const computed_reserves = computed(() =>
    reservations.value.map((e) => {
      const computed_reserve = { ...e }
      // Reserve?
      computed_reserve.status = reserves.value.includes(e.id) ? SeatStatus.RESERVE : e.status

      return computed_reserve
    })
  )

  // Calculate total price at local state.
  const total_price = get_total_price(computed_reserves)

  const current_hour = today.getHours()
  const is_before_noon = current_hour < 12

  const today_iso = today.toISOString()
  const today_dates = today_iso.split('T')
  const today_ymd = today_dates[0]
  //&& is_after_noon && e.hour >= 12
  return (
    <div class="diff-container" onMouseUp={cancelDrag} onMouseLeave={cancelDrag}>
      <div>user pubkey: {pubkey}</div>
      <div>
        <DragButton disabled={total_price.value <= 0} onDragSucceed={handleCheckout}>
          {total_price + ' 🍋'}
        </DragButton>
      </div>
      <div>NOW: {today.toISOString()}</div>
      <div>
        {computed_reserves.value.map((e, i) => {
          console.log(e.ymd, today_ymd, current_hour)
          return (
            <>
              {e.hour % 12 === 0 && (
                <>
                  {e.hour % 24 === 0 && (
                    <>
                      <br />
                      <br />
                      <hr />
                      <h2 class="seat-date">{e.date.toISOString().split('T')[0]}</h2>
                    </>
                  )}
                  {e.hour === 0 ? (
                    <h4>
                      {'00'} 🌛 <span style={{ opacity: 0.5 }}>→</span> {e.hour + 12} 🌞
                    </h4>
                  ) : (
                    <h4>
                      {e.hour} 🌞 <span style={{ opacity: 0.5 }}>→</span> {e.hour + 12} 🌛
                    </h4>
                  )}
                </>
              )}
              <Seat variant={'m'} hour={e.hour} seat_id={e.id} status={e.status} offered_price={e.offered_price} onReserve={handleReserve} />
            </>
          )
        })}
      </div>
    </div>
  )
}

render(<Diff />, document.body)

export default Diff
