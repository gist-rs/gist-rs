import { useSignal, signal } from '@preact/signals'
import { SeatStatus } from '../models/SeatType'
import { get_ymd } from '../utils/date'
import { useEffect } from 'preact/hooks'

const get_mock_data = (date: Date) => {
  const DEFAULT_SEAT = {
    miner_wallet_address: 'miner_WalletAddReSs',
    status: SeatStatus.AVAILABLE,
    base_price: 1
  }

  const price_impact = 0.5

  const date_iso = date.toISOString()
  const date_dates = date_iso.split('T')
  const date_ymd = date_dates[0]

  const reservations = Array(24)
    .fill(DEFAULT_SEAT)
    .map((e, i) => ({
      ...e,
      id: `${date_ymd}::${i.toString().padStart(2, '0')}::miner_WalletAddReSs`,
      date: date,
      hour: (i % 24),
      ymd: date_ymd,
      offered_price: parseFloat((e.base_price + price_impact * Math.sin((Math.PI * i) / 24)).toFixed(2))
    }))

  // Mock used status when older than current hour.
  const current_hour = date.getHours()
  reservations.forEach((e) => {
    e.status = (get_ymd(e.date) <= date_ymd && e.hour < current_hour) ? SeatStatus.USED : e.status
  })

  // mock reserved
  reservations[Math.min(current_hour, 23) + 1].status = SeatStatus.RESERVED

  return reservations
}

export const fetch_reservations = async (query: string[]) => {
  const [today_ymd, tomorrow_ymd] = query
  const today_data = get_mock_data(new Date(today_ymd))
  const tomorrow_data = get_mock_data(new Date(tomorrow_ymd))

  return {
    [`${today_ymd}`]: today_data,
    [`${tomorrow_ymd}`]: tomorrow_data
  }
}

export default function useSyncReserves() {

  const today = new Date()
  const reservations = useSignal([])
  const reservations_map = useSignal({} as { [x: string]: any[] })

  useEffect(() => {
    // TODO: Call read api reservations
    const today_ymd = get_ymd(today)
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1)
    const tomorrow_ymd = get_ymd(tomorrow)

    const fire = async () => {
      const result = await fetch_reservations([today_ymd, tomorrow_ymd])
      console.log('result:', result)
      reservations_map.value = result
      reservations.value = Object.values(result).flat()
    }
    fire()
  }, [])

  let reserves = useSignal([])

  return {
    reservations,
    reservations_map,
    today,
    reserves,
  }
}