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
        <code>3</code>
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
      <script src="https://accounts.google.com/gsi/client" async defer></script>
      <div style={{ width: 'fit-content' }}>
        <div
          id="g_id_onload"
          data-ux_mode="redirect"
          data-client_id={import.meta.env.GOOGLE_CLIENT_ID || process.env.WMR_GOOGLE_CLIENT_ID}
          data-login_uri={import.meta.env.GOOGLE_REDIRECT_URL || process.env.WMR_GOOGLE_REDIRECT_URL}
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
