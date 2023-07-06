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

  let total_price = 0

  const computed_reserves = computed(() =>
    reservations.value.map((e) => {
      const computed_reserve = { ...e }
      // Reserve?
      computed_reserve.status = reserves.value.includes(e.id) ? SeatStatus.RESERVE : e.status

      // Calculate total price at client.
      if (computed_reserve.status === SeatStatus.RESERVE) {
        total_price = parseFloat((total_price + e.offered_price).toFixed(2))
      }

      return computed_reserve
    })
  )

  return (
    <div class="diff-container" onMouseUp={cancelDrag} onMouseLeave={cancelDrag}>
      <div>user pubkey: {pubkey}</div>
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
          let content = <></>
          if (e.hour < 12) {
            // before noon
            content = current_hour > 12 ? <button class="button">{e.offered_price + ' 🍋'}</button> : <Seat hour={e.hour} seat_id={e.id} status={e.status} offered_price={e.offered_price} onReserve={handleReserve} />
          } else {
            // after noon
            content = current_hour < 12 ? <>TODO</> : <Seat hour={e.hour} seat_id={e.id} status={e.status} offered_price={e.offered_price} onReserve={handleReserve} />
          }

          // Action
          let action = <></>
          if (i === 11 || i === 23) {
            const drag_button = (
              <DragButton disabled={total_price <= 0} onDragSucceed={handleCheckout}>
                {total_price + ' 🍋'}
              </DragButton>
            )

            const before_noon_button = i === 11 && current_hour < 12 ? drag_button : <></>
            const after_noon_button = i === 23 && current_hour > 12 ? drag_button : <></>
            action = before_noon_button || after_noon_button
          }

          return (
            <>
              {header}
              {content}
              {action}
            </>
          )
        })}
      </div>
    </div>
  )
}

render(<Diff />, document.body)

export default Diff
