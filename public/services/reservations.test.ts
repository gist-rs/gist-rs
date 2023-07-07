
import { SeatStatus } from '../models/SeatType'
import { get_ymd } from '../utils/date'

export const get_mock_data = (date: Date) => {
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
      date,
      hour: (i % 24),
      ymd: date_ymd,
      offered_price: parseFloat((e.base_price + price_impact * Math.sin((Math.PI * i) / 24)).toFixed(2))
    }))

  // Mock used status when older than current hour.
  const current = new Date()
  const current_hour = current.getHours()

  reservations.forEach((e) => {
    e.status = (get_ymd(e.date) <= date_ymd && e.hour < current_hour) ? SeatStatus.USED : e.status
  })

  // mock reserved
  reservations[Math.min(current_hour, 22) + 1].status = SeatStatus.RESERVED

  return reservations
}
