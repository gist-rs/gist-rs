import { FunctionComponent, render } from 'preact'
import { useState } from 'preact/hooks'
import { get_user_session } from '../lib/cf'
import DragButton from '../components/DragButton'
import useSyncReserves from '../hooks/useSyncReserves'
import { SeatStatus } from '../models/SeatType'
import { computed } from '@preact/signals'

function get_button_class_by_status(status: SeatStatus): string {
  return `clickable seat seat-${status.toLowerCase()}`
}

type Props = {
  seat_id: string
  status: SeatStatus
  offered_price: number
  onReserve: Function
  hour: number
}

let isDrag = false

const Seat: FunctionComponent<Props> = (props: Props) => {
  const { seat_id, status, offered_price, onReserve, hour } = props

  const handleSeatMouseDown = (seat_id) => {
    isDrag = true
    onReserve(seat_id)
  }

  const handleSeatMouseUp = (_e) => {
    isDrag = false
  }

  const handleSeatMouseEnter = (seat_id) => {
    isDrag && onReserve(seat_id)
  }

  return (
    <button disabled={status === SeatStatus.RESERVED} class={get_button_class_by_status(status)} onMouseDown={() => handleSeatMouseDown(seat_id)} onMouseUp={() => handleSeatMouseUp(seat_id)} onMouseEnter={() => handleSeatMouseEnter(seat_id)}>
      {hour.toString().padStart(2, '0') + ':00 ➜ ' + hour.toString().padStart(2, '0') + ':59'}
      <hr />

      <small>{offered_price} 🍋</small>
    </button>
  )
}

const Diff = () => {
  const user_session = get_user_session()
  const [pubkey] = useState(user_session.pubkey)
  const { reservations, current_date, current_hour, reserves } = useSyncReserves()

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
  const total_price = computed(() => {
    let _total_price = 0
    computed_reserves.value.map((computed_reserve) => {
      if (computed_reserve.status === SeatStatus.RESERVE) {
        _total_price = parseFloat((_total_price + computed_reserve.offered_price).toFixed(2))
      }
    })

    return _total_price
  })

  return (
    <div class="diff-container" onMouseUp={cancelDrag} onMouseLeave={cancelDrag}>
      <div>user pubkey: {pubkey}</div>
      <div>
        <DragButton disabled={total_price.value <= 0} onDragSucceed={handleCheckout}>
          {total_price + ' 🍋'}
        </DragButton>
      </div>
      <div>TODAY: {current_date.value.toISOString()}</div>
      <div>
        {computed_reserves.value.map((e, i) => {
          // Header
          const header = (
            <>
              {i === 0 ? <h4>00:00🌛 ➡︎ 12:00 🌞</h4> : <></>}
              {i === 12 ? <h4>12:00 🌞 ➡︎ 24:00 🌛</h4> : <></>}
            </>
          )

          // Content
          let content = <Seat hour={e.hour} seat_id={e.id} status={e.status} offered_price={e.offered_price} onReserve={handleReserve} />

          return (
            <>
              {header}
              {content}
            </>
          )
        })}
      </div>
    </div>
  )
}

render(<Diff />, document.body)

export default Diff
