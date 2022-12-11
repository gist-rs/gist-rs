import * as Cookie from 'cookie'

const get_user_from_cookie_phantom = () => {
  const cookies_map = Cookie.parse(window.document.cookie)
  console.log('cookies_map:', cookies_map)
  const cookie_session = cookies_map["phantom::session"]
  const [device, pubkey, session] = cookie_session.split('::')
  return {
    device, pubkey, session
  }
}

export const get_user_data = () => {
  // @ts-ignore
  const server_session = window.__STATE__ ? window.__SESSION__ : {}
  const cookie_session = get_user_from_cookie_phantom()

  // @ts-ignore
  // window.__SESSION__ = {
  //   pubkey: 'cat9ZgXRQA3yCRCNaFyswDqZhQuDsJEvVnfzWfdWNdX',
  //   signature: '67qiYTcmK7deQ2Y4MTc31X6gwxM1w5HzufyH2KvZ3DTjXibwNyHgQi8m2ZAVxx2i',
  //   payload: { app_url: 'https://gist.rs', timestamp: 1670600698494, chain: 'solana', cluster: 'mainnet-beta' },
  //   session: '67qiYTcmK7deQ2Y4MTc31X6gwxM1w5HzufyH2KvZ3DTjXibwNyHgQi8m2ZAVxx2ios15c8Zq13dNrSZ1qcFQ2GsPpZCmkAKuW3VPSdxSDcw38XS6YD5ve2FqNxTHXRrpwTApWXP8vXjpvCSMBughKpz6JsZPKH127yXXdduF9ADurL29G3xwmrKdA92qbeYdBQFBa24jE31XvfiQmN2ScYubcrAx'
  // }

  console.log('server_session:', server_session)
  console.log('cookie_data:', cookie_session)

  return { server_session, cookie_session }
}
