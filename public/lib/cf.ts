import { UserInfo } from '../../model/session'

export const get_user_info_from_session = (): UserInfo => {
  // // @ts-ignore
  // const session = window.__SESSION__ ? window.__SESSION__ : {
  //   pubkey: 'cat9ZgXRQA3yCRCNaFyswDqZhQuDsJEvVnfzWfdWNdX',
  //   phantom:
  //   {
  //     data: { app_url: 'https://gist.rs', timestamp: 1670600698494, chain: 'solana', cluster: 'mainnet-beta' },
  //     session: 'mock_67qiYTcmK7deQ2Y4MTc31X6gwxM1w5HzufyH2KvZ3DTjXibwNyHgQi8m2ZAVxx2ios15c8Zq13dNrSZ1qcFQ2GsPpZCmkAKuW3VPSdxSDcw38XS6YD5ve2FqNxTHXRrpwTApWXP8vXjpvCSMBughKpz6JsZPKH127yXXdduF9ADurL29G3xwmrKdA92qbeYdBQFBa24jE31XvfiQmN2ScYubcrAx'
  //   },
  // }

  // mock
  if (window.location.port === '8080') {
    // @ts-ignore
    window.__SESSION__ = {
      user_info: {
        "exp": 1689175499,
        "email": "katopz@gmail.com",
        "name": "Todsaporn Banjerdkit",
        "picture": "/img/kat.png",
        "iat": 1689089099
      }
    }
  }

  // @ts-ignore
  const session = window.__SESSION__

  console.log('session:', session)

  return session?.user_info
}
