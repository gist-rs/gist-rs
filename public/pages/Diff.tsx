import { FunctionComponent, createContext, render } from 'preact'
import { useContext, useState } from 'preact/hooks'
import { get_user_session } from '../lib/cf'
import DragButton from '../components/DragButton'
import useSyncReserves from '../hooks/useSyncReserves'
import { SeatStatus } from '../models/SeatType'
import { computed, signal } from '@preact/signals'
import '../diff.css'
import SeatReservation from '../components/SeatReservation'
import AppContext from '../contexts/AppContext'

const Diff = () => {
  const appContext = useContext(AppContext)
  const user_session = get_user_session()
  const [pubkey] = useState(user_session.pubkey)

  // TODO: use /diff/{ymd}
  const today = new Date()
  const today_iso = today.toISOString()
  const today_dates = today_iso.split('T')
  const today_ymd = today_dates[0]

  const handleCheckout = () => {
    // TODO: Call write api reservations
    const request_payload = {
      reserve_seat_ids: appContext.reserves
    }
    console.log('handleCheckout:', request_payload)
  }

  // const reserves = signal([])

  return (
    <AppContext.Provider value={appContext}>
      <div class="diff-container">
        <div>user pubkey: {pubkey}</div>
        <div>
          <DragButton disabled={appContext.total_price.value <= 0} onDragSucceed={handleCheckout}>
            {appContext.total_price.value + ' 🍋'}
          </DragButton>
        </div>
        <div>NOW: {today.toISOString()}</div>
        <SeatReservation ymd={today_ymd} />
      </div>
    </AppContext.Provider>
  )
}

render(<Diff />, document.body)

export default Diff
