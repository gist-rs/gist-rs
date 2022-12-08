import { LocationProvider, hydrate, prerender as ssr } from 'preact-iso'
import { useEffect, useState } from 'preact/hooks'
import { render } from 'preact'

export function Bar() {
  // @ts-ignore
  const cached_data = window.__STATE__ ? window.__STATE__ : {}
  console.log(cached_data)
  const [data] = useState(cached_data)

  return (
    <div>
      <button>{data.pubkey}</button>
    </div>
  )
}

export function App() {
  useEffect(() => {
    // TODO: https://gist.github.com/developit/f4c67a2ede71dc2fab7f357f39cff28c
    let bar = document.getElementById('bar')
    render(<Bar />, bar, bar)
  })

  return (
    <LocationProvider>
      <div id="bar" />
      <div class="app">
        <img src="./img/gist-logo-dark.svg" width="264" height="103" alt="gist.rs" />
        <br />
        <br />
        <section class="hero">
          <div>Let's learn 🦀 Rust together ✨</div>
          <div class="line">/</div>
          <div class="speaker">
            <img alt="kat" src="./img/kat.png" width="64" height="64" />
            <img alt="duck" src="./img/duck.png" width="16" height="16" />
            <small class="heart">❤</small>
          </div>
        </section>
        <br />
        <a class="button" href="https://book.gist.rs">
          START ➠
        </a>
        <br />
        <hr />
        <section class="footer">
          <a href="https://github.com/gist-rs">
            <img src="./img/github-logo.svg" width="16" height="16" alt="github" />
          </a>
        </section>
      </div>
    </LocationProvider>
  )
}

hydrate(<App />)

export async function prerender(data) {
  return await ssr(<App {...data} />)
}
