import { useSignal } from '@preact/signals'
import { get_ymd } from '../utils/date'
import { useEffect } from 'preact/hooks'
import { fetch_reservations } from '../services/reservations'

export default function useSyncReserves(date_ymd: string) {
  const reservations = useSignal([])

  useEffect(() => {
    const today = new Date(date_ymd)
    const today_ymd = get_ymd(today)

    const fire = async () => {
      const result = await fetch_reservations(today_ymd)
      reservations.value = Object.values(result).flat()
    }
    fire()
  }, [date_ymd])

  let reserves = useSignal([])

  return {
    reservations,
    reserves,
  }
}