import { Signal, signal } from "@preact/signals";
import { createContext } from "preact";

type AppContextType = {
  reserves: Signal<any[]>
  total_price: Signal<number>
}

const AppContext = createContext({ reserves: signal([]), total_price: signal(0) } as AppContextType);
export default AppContext