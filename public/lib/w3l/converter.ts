function to_base64(str: string) {
  str = typeof str === 'object' ? JSON.stringify(str) : str
  return btoa(encodeURIComponent(str))
}

function from_base64(str: string) {
  return decodeURIComponent(atob(str))
}

export { to_base64, from_base64 }
