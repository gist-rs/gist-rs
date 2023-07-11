import { useContext } from 'preact/hooks'
import AppContext from '../contexts/AppContext'

const NavBar = () => {
  const appContext = useContext(AppContext)
  const { user_info } = appContext

  return (
    <div class="navbar">
      {!user_info.value ? (
        <a href="/auth">sign in</a>
      ) : (
        <div>
          <div class="avatar" style={`background-image:url(${user_info.value?.picture})`}></div> <a href="/auth">sign out</a>
        </div>
      )}
    </div>
  )
}

export default NavBar
