export function Home() {
  return (
    <div>
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
          <a class="sponsor" href="https://patreon.com/gist_rs" target="_blank" rel="noopener">
            <img src="./img/sponsor.svg" width="16" height="16" alt="sponsor" />
          </a>
        </section>
      </div>
    </div>
  )
}
