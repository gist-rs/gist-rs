import { FunctionComponent, render } from 'preact'
import { useState } from 'preact/hooks'
import { get_user_session } from '../lib/cf'
import { signal } from '@preact/signals'

enum SeatStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVE = 'RESERVE',
  RESERVED = 'RESERVED',
  USING = 'USING',
  USED = 'USED',
  RATED = 'RATED',
  DONE = 'DONE',
  MAINTENANCE = 'MAINTENANCE'
}

function get_color_from_seat_status(status: SeatStatus): string | number {
  return { AVAILABLE: 'green', RESERVE: 'yellow' }[status]
}

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
      {hour.toString().padStart(2, '0') + ':00-' + (hour + 1).toString().padStart(2, '0') + ':00'}
      <hr />

      <small>{offered_price} 🍋</small>
    </button>
  )
}

const DEFAULT_SEAT = {
  miner_wallet_address: 'miner_WalletAddReSs',
  status: SeatStatus.AVAILABLE,
  base_price: 1
}

// TODO: Call read api reservations
const price_impact = 0.5
const today_iso = new Date().toISOString()
const today_dates = today_iso.split('T')
const today_date = today_dates[0]
const reservations = Array(24)
  .fill(DEFAULT_SEAT)
  .map((e, i) => ({
    ...e,
    id: `${today_date}::${i.toString().padStart(2, '0')}::miner_WalletAddReSs`,
    date: today_date,
    hour: i,
    offered_price: (e.base_price + price_impact * Math.sin((Math.PI * i) / 24)).toFixed(2)
  }))

// mock reserved
reservations[0].status = SeatStatus.RESERVED

const reserves = signal([])

const Diff = () => {
  const user_session = get_user_session()
  const [pubkey] = useState(user_session.pubkey)

  const handleMouseUp = (_e) => {
    isDrag = false
  }

  const handleCheckout = () => {
    // TODO: Call write api reservations
    const request_payload = {
      reserve_seat_ids: reserves.value
    }
    console.log(request_payload)
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

  const computed_reserves = reservations.map((e) => {
    const computed_reserve = { ...e }
    computed_reserve.status = reserves.value.includes(e.id) ? SeatStatus.RESERVE : e.status
    return computed_reserve
  })

  return (
    <div onMouseUp={handleMouseUp}>
      <div>user pubkey: {pubkey}</div>
      <div>
        {computed_reserves.map((e, i) => {
          return (
            <>
              <Seat hour={e.hour} seat_id={e.id} status={e.status} offered_price={e.offered_price} onReserve={handleReserve} />
              {(i + 1) % 12 === 0 ? <br /> : ''}
            </>
          )
        })}
      </div>
      <button onClick={handleCheckout}>check out</button>
    </div>
  )
}

render(<Diff />, document.body)

export default Diff
