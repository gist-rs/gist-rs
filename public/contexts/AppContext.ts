import { Signal, signal } from "@preact/signals";
import { createContext } from "preact";
import { UserInfo, Web3UserInfo } from "../../model/session";
import { get_user_info_from_session } from "../lib/cf";

type AppContextType = {
  web3_user_info: Signal<Web3UserInfo>
  user_info: Signal<UserInfo>
  reserves: Signal<any[]>
  total_price: Signal<number>
}

const user_info = get_user_info_from_session()

const AppContext = createContext({
  web3_user_info: signal({}),
  user_info: signal(user_info),
  reserves: signal([]),
  total_price: signal(0),
} as AppContextType);

export default AppContext