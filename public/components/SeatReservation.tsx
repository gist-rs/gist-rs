import { FunctionComponent } from 'preact'
import { computed } from '@preact/signals'
import { SeatStatus } from '../models/SeatType'
import Seat from './Seat'
import useSyncReserves from '../hooks/useSyncReserves'
import { useContext, useEffect } from 'preact/hooks'
import AppContext from '../contexts/AppContext'

type Props = {
  ymd: string
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

const SeatReservation: FunctionComponent<Props> = ({ ymd }) => {
  const appContext = useContext(AppContext)
  const { reservations, reserves } = useSyncReserves(ymd)
  // console.log('reservations:', reservations.value)

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

  useEffect(() => {
    appContext.reserves.value = reserves.value
  }, [reserves])

  useEffect(() => {
    appContext.total_price.value = total_price.value
  }, [total_price])

  return (
    <div>
      {computed_reserves.value.map((e, i) => {
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
  )
}

export default SeatReservation
