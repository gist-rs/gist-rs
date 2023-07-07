import { get_mock_data } from "./reservations.test"

export const fetch_reservations = async (today_ymd: string) => {
  const today_data = get_mock_data(new Date(today_ymd))
  return today_data
}