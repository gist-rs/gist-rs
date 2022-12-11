// import { ErrorBoundary, Router, LocationProvider, hydrate, prerender as ssr, lazy } from 'preact-iso'
// import { useEffect, useState } from 'preact/hooks'
// import { render } from 'preact'

// export function AuthRoot() {
//   return (
//     <LocationProvider>
//       <ErrorBoundary>
//         {/* <Router>
//           <Auth path="/auth/:provider">Hello</Auth>
//           <></>
//         </Router> */}
//         Hello!!
//         <>{}</>
//       </ErrorBoundary>
//     </LocationProvider>
//   )
// }

// hydrate(<AuthRoot />)

// export async function prerender(data) {
//   console.log('data:', data)
//   return await ssr(<AuthRoot {...data} />)
// }

// export default function Auth() {
//   return <div>Hellooooo</div>
// }

import { render } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { get_user_data } from '../lib/cf'

const Auth = () => {
  const [pubkey] = useState(get_user_data().server_session.pubkey)
  return (
    <div>
      <pre>
        <code>{pubkey}</code>
      </pre>
      <p>Do you agree to the statement: "Preact is awesome"?</p>
    </div>
  )
}

render(<Auth />, document.body)

export default Auth
