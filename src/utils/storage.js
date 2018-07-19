export function save (key, value) {
  wx.setStorageSync(key, value)
}

export function read (key) {
  return wx.getStorageSync(key)
}
