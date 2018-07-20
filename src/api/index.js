const request = obj => new Promise((resolve, reject) => {
  wx.request({
    url: obj.url,
    data: obj.data,
    header: obj.header,
    method: obj.method,
    responseType: obj.responseType,
    success (res) {
      // resolve(res)
      if (res.data.error_code === 110) { // token 失效
        reject(res.data)
      } else {
        resolve(res.data)
      }
    },
    fail (e) {
      console.log(e)
      reject(e)
    }
  })
})

const api = {
  async getToken () {
    const grantType = 'client_credentials'
    const clientId = 'HwUmTiulN6fQUdfvOPfhPlrl'
    const clientSecret = '2bLDCDpZGfbmNz5TnuEH7GxXr6RfAB7d'
    try {
      const response = await request({
        url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=${grantType}&client_id=${clientId}&client_secret=${clientSecret}`,
        method: 'POST'
      })
      return response
    } catch (e) {
      console.log('error', e)
    }
  }
}

export default api
