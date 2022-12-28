import { render } from 'preact'
import { useState } from 'preact/hooks'
import { get_user_session } from '../lib/cf'

const Auth = () => {
  const user_session = get_user_session()
  const [pubkey] = useState(user_session.pubkey)
  const [session] = useState(user_session.phantom.session)
  const [data] = useState(user_session.phantom.data)

  return (
    <div>
      <pre>
        <code>{pubkey}</code>
      </pre>
      <pre>
        <code>{session}</code>
      </pre>
      <pre>
        <code>{data}</code>
      </pre>
      <a href={`/u/${pubkey}`}>accept term and continue</a>
    </div>
  )
}

render(<Auth />, document.body)

export default Auth
