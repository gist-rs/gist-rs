import { ErrorBoundary, Router, LocationProvider, hydrate, prerender as ssr, lazy } from 'preact-iso'
import { useEffect, useState } from 'preact/hooks'
import { render } from 'preact'
import { Home } from './pages/Home'

export function Bar() {
  // @ts-ignore
  const cached_data = window.__STATE__ ? window.__STATE__ : {}
  const [data] = useState(cached_data)

  // WIP: Not ready yet
  return <></>

  // if (!data?.pubkey) {
  //   return <></>
  // }

  // return (
  //   <div>
  //     <button>{data.pubkey}</button>
  //   </div>
  // )
}

// const Sponsor = lazy(() => import('./pages/Sponsor.js'))
// const Auth = lazy(() => import('./pages/Auth.js'))
const Diff = lazy(() => import('./pages/Diff.js'))

export function App() {
  // useEffect(() => {
  //   // TODO: https://gist.github.com/developit/f4c67a2ede71dc2fab7f357f39cff28c
  //   let bar = document.getElementById('bar')
  //   bar && render(<Bar />, bar, bar)
  // }, [])

  return (
    <LocationProvider>
      <ErrorBoundary>
        <Router>
          <Home path="/" />
          {/* <Auth path="/auth/:provider" /> */}
          {/* <Sponsor path="/sponsor" /> */}
          <Diff path="/diff" />
        </Router>
      </ErrorBoundary>
    </LocationProvider>
  )
}

hydrate(<App />)

export async function prerender(data) {
  return await ssr(<App {...data} />)
}
