export default function wxPromisify (fn) {
  return (obj = {}, task) => {
    return new Promise((resolve, reject) => {
      obj.success = (res) => {
        if (res && typeof res.statusCode === 'number' && res.statusCode !== 200) {
          reject(res)
        } else {
          resolve(res)
        }
      }
      obj.fail = (res) => {
        reject(res)
      }
      const result = fn(obj)
      if (task && typeof task === 'function') {
        task(result)
      }
    })
  }
}
