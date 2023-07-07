import { useSignal, signal } from '@preact/signals'
import { SeatStatus } from '../models/SeatType'
const get_mock_data = (today: Date) => {
  const DEFAULT_SEAT = {
    miner_wallet_address: 'miner_WalletAddReSs',
    status: SeatStatus.AVAILABLE,
    base_price: 1
  }

  const price_impact = 0.5

  const today_iso = today.toISOString()
  const today_dates = today_iso.split('T')
  const today_ymd = today_dates[0]

  const reservations = Array(24)
    .fill(DEFAULT_SEAT)
    .map((e, i) => ({
      ...e,
      id: `${today_ymd}::${i.toString().padStart(2, '0')}::miner_WalletAddReSs`,
      date: today,
      hour: (i % 24),
      ymd: today_ymd,
      offered_price: parseFloat((e.base_price + price_impact * Math.sin((Math.PI * i) / 24)).toFixed(2))
    }))

  return reservations
}

export default function useSyncReserves() {
  // TODO: Call read api reservations
  const today = new Date()
  const today_iso = today.toISOString()
  const today_dates = today_iso.split('T')
  const today_ymd = today_dates[0]
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1)

  const reservations = signal(get_mock_data(today).concat(get_mock_data(tomorrow)))

  // Already expired?
  const current_hour = today.getHours()
  reservations.value.forEach((e) => {
    e.status = (e.date.toISOString().split('T')[0] <= today_ymd && e.hour < current_hour) ? SeatStatus.USED : e.status
  })

  // mock reserved
  reservations.value[Math.min(current_hour, 23) + 1].status = SeatStatus.RESERVED

  let reserves = useSignal([])

  return {
    reservations,
    today,
    reserves,
  }
}