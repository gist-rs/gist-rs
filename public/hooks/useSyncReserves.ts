import { useSignal, signal } from '@preact/signals'
import { SeatStatus } from '../models/SeatType'

export default function useSyncReserves() {
  const DEFAULT_SEAT = {
    miner_wallet_address: 'miner_WalletAddReSs',
    status: SeatStatus.AVAILABLE,
    base_price: 1
  }

  // TODO: Call read api reservations
  const price_impact = 0.5
  const current_date = signal(new Date())
  const today_iso = current_date.value.toISOString()
  const today_dates = today_iso.split('T')
  const today_date = today_dates[0]
  const current_hour = current_date.value.getHours()

  const reservations = signal(Array(24)
    .fill(DEFAULT_SEAT)
    .map((e, i) => ({
      ...e,
      id: `${today_date}::${i.toString().padStart(2, '0')}::miner_WalletAddReSs`,
      date: today_date,
      hour: i,
      offered_price: parseFloat((e.base_price + price_impact * Math.sin((Math.PI * i) / 24)).toFixed(2))
    })))

  // Already expired?
  reservations.value.forEach((e) => {
    e.status = e.hour < current_hour ? SeatStatus.USED : e.status
  })

  // mock reserved
  reservations.value[0].status = SeatStatus.RESERVED

  let reserves = useSignal([])

  return {
    reservations,
    current_hour,
    current_date,
    reserves,
  }
}