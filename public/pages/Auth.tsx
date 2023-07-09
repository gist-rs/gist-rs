import { render } from 'preact'
import { useState } from 'preact/hooks'
import { get_user_session } from '../lib/cf'

const Auth = () => {
  const user_session = get_user_session()
  console.log('user_session:', user_session)
  const [pubkey] = useState(user_session.pubkey)
  const [session] = useState(user_session.phantom.session)
  const [data] = useState(user_session.phantom.data)

  return (
    <div>
      <pre>
        <code>2</code>
      </pre>
      <pre>
        <code>{pubkey}</code>
      </pre>
      <pre>
        <code>{session}</code>
      </pre>
      <pre>
        <code>{data}</code>
      </pre>
      <pre>
        <code>import.meta.env.GOOGLE_CLIENT_ID:{import.meta.env.GOOGLE_CLIENT_ID}</code>
      </pre>
      <pre>
        <code>process.env.GOOGLE_CLIENT_ID:{process.env.GOOGLE_CLIENT_ID}</code>
      </pre>
      <pre>
        <code>{JSON.stringify(import.meta.env, null, 2)}</code>
      </pre>
      <pre>
        <code>{JSON.stringify(process.env, null, 2)}</code>
      </pre>
      <script src="https://accounts.google.com/gsi/client" async defer></script>
      <div style={{ width: 'fit-content' }}>
        <div
          id="g_id_onload"
          data-ux_mode="redirect"
          data-client_id={import.meta.env.GOOGLE_CLIENT_ID}
          data-callback={window.location.hostname === 'localhost' ? import.meta.env.GOOGLE_REDIRECT_DEV_URL : import.meta.env.GOOGLE_REDIRECT_PROD_URL}
          data-auto_prompt="false"
        ></div>
        <div class="g_id_signin" data-type="standard" data-size="large" data-theme="outline" data-text="sign_in_with" data-shape="rectangular" data-logo_alignment="left"></div>
      </div>
      <a href={`/u/${pubkey}`}>accept term and continue</a>
    </div>
  )
}

render(<Auth />, document.body)

export default Auth
