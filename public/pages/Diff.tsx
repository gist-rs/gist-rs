import { render } from 'preact'
import { useContext } from 'preact/hooks'
import DragButton from '../components/DragButton'
import SeatReservation from '../components/SeatReservation'
import AppContext from '../contexts/AppContext'
import NavBar from '../components/NavBar'
import '../diff.css'

const Diff = () => {
  const appContext = useContext(AppContext)

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
        <NavBar />
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
