export const get_qr = (url: string, size = 256) => {
  return `https://chart.googleapis.com/chart?cht=qr&chld=M|2&chl=${url}&chs=${size}x${size}`
}