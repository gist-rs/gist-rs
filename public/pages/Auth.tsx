import { render } from 'preact'
import { useState } from 'preact/hooks'
import { get_user_data } from '../lib/cf'

const Auth = () => {
  const user_data = get_user_data()
  const [pubkey] = useState(user_data.pubkey)
  const [session] = useState(user_data.session)
  return (
    <div>
      <pre>
        <code>{pubkey}</code>
      </pre>
      <pre>
        <code>{session}</code>
      </pre>
      <a href={`/u/${pubkey}`}>accept term and continue</a>
    </div>
  )
}

render(<Auth />, document.body)

export default Auth
