const BASE64_MAPPING = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
  'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
  'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
  'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z', '0', '1', '2', '3',
  '4', '5', '6', '7', '8', '9', '+', '/'
]
const util = {
  /**
   *ascii convert to binary
   */
  _toBinary (ascii) {
    let binary = []
    while (ascii > 0) {
      var b = ascii % 2
      ascii = Math.floor(ascii / 2)
      binary.push(b)
    }
    binary.reverse()
    return binary
  },
  /**
   *binary convert to decimal
   */
  _toDecimal (binary) {
    let dec = 0
    let p = 0
    for (let i = binary.length - 1; i >= 0; --i) {
      let b = binary[i]
      if (b === 1) {
        dec += Math.pow(2, p)
      }
      ++p
    }
    return dec
  },
  /**
   *unicode convert to utf-8
   */
  _toUTF8Binary (c, binaryArray) {
    let mustLen = (8 - (c + 1)) + ((c - 1) * 6)
    let fatLen = binaryArray.length
    let diff = mustLen - fatLen
    while (--diff >= 0) {
      binaryArray.unshift(0)
    }
    let binary = []
    let _c = c
    while (--_c >= 0) {
      binary.push(1)
    }
    binary.push(0)
    let i = 0
    let len = 8 - (c + 1)
    for (; i < len; ++i) {
      binary.push(binaryArray[i])
    }

    for (let j = 0; j < c - 1; ++j) {
      binary.push(1)
      binary.push(0)
      let sum = 6
      while (--sum >= 0) {
        binary.push(binaryArray[i++])
      }
    }
    return binary
  }
}

const CusBASE64 = {
  /**
   *BASE64 Encode
   */
  encoder (str) {
    console.log('kiss me')
    var base64Index = []
    var binaryArray = []
    for (var i = 0, len = str.length; i < len; ++i) {
      var unicode = str.charCodeAt(i)
      var _tmpBinary = util._toBinary(unicode)
      if (unicode < 0x80) {
        var _tmpdiff = 8 - _tmpBinary.length
        while (--_tmpdiff >= 0) {
          _tmpBinary.unshift(0)
        }
        binaryArray = binaryArray.concat(_tmpBinary)
      } else if (unicode >= 0x80 && unicode <= 0x7FF) {
        binaryArray = binaryArray.concat(util._toUTF8Binary(2, _tmpBinary))
      } else if (unicode >= 0x800 && unicode <= 0xFFFF) { // UTF-8 3byte
        binaryArray = binaryArray.concat(util._toUTF8Binary(3, _tmpBinary))
      } else if (unicode >= 0x10000 && unicode <= 0x1FFFFF) { // UTF-8 4byte
        binaryArray = binaryArray.concat(util._toUTF8Binary(4, _tmpBinary))
      } else if (unicode >= 0x200000 && unicode <= 0x3FFFFFF) { // UTF-8 5byte
        binaryArray = binaryArray.concat(util._toUTF8Binary(5, _tmpBinary))
      } else if (unicode >= 4000000 && unicode <= 0x7FFFFFFF) { // UTF-8 6byte
        binaryArray = binaryArray.concat(util._toUTF8Binary(6, _tmpBinary))
      }
    }

    var extraZeroCount = 0
    for (let i = 0, len = binaryArray.length; i < len; i += 6) {
      var diff = (i + 6) - len
      if (diff === 2) {
        extraZeroCount = 2
      } else if (diff === 4) {
        extraZeroCount = 4
      }
      var tmpExtraZeroCount = extraZeroCount
      while (--tmpExtraZeroCount >= 0) {
        binaryArray.push(0)
      }
      base64Index.push(util._toDecimal(binaryArray.slice(i, i + 6)))
    }

    var base64 = ''
    for (let i = 0, len = base64Index.length; i < len; ++i) {
      base64 += BASE64_MAPPING[base64Index[i]]
    }

    for (let i = 0, len = extraZeroCount / 2; i < len; ++i) {
      base64 += '='
    }
    return base64
  },
  /**
   *BASE64 Decode for UTF-8
   */
  decoder (_base64Str) {
    var _len = _base64Str.length
    var extraZeroCount = 0
    /**
     * 计算在进行Base64编码的时候补了几个0
     */
    if (_base64Str.charAt(_len - 1) === '=') {
      if (_base64Str.charAt(_len - 2) === '=') { // 两个等号说明补了4个0
        extraZeroCount = 4
        _base64Str = _base64Str.substring(0, _len - 2)
      } else { // 一个等号说明补了2个0
        extraZeroCount = 2
        _base64Str = _base64Str.substring(0, _len - 1)
      }
    }

    var binaryArray = []
    for (var i = 0, len = _base64Str.length; i < len; ++i) {
      var c = _base64Str.charAt(i)
      for (var j = 0, size = BASE64_MAPPING.length; j < size; ++j) {
        if (c === BASE64_MAPPING[j]) {
          var _tmp = util._toBinary(j)
          // 不足六位的补0
          var _tmpLen = _tmp.length
          if (6 - _tmpLen > 0) {
            for (var k = 6 - _tmpLen; k > 0; --k) {
              _tmp.unshift(0)
            }
          }
          binaryArray = binaryArray.concat(_tmp)
          break
        }
      }
    }

    if (extraZeroCount > 0) {
      binaryArray = binaryArray.slice(0, binaryArray.length - extraZeroCount)
    }

    var unicode = []
    var unicodeBinary = []
    for (let i = 0, len = binaryArray.length; i < len;) {
      if (binaryArray[i] === 0) {
        unicode = unicode.concat(util._toDecimal(binaryArray.slice(i, i + 8)))
        i += 8
      } else {
        var sum = 0
        while (i < len) {
          if (binaryArray[i] === 1) {
            ++sum
          } else {
            break
          }
          ++i
        }
        unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 1, i + 8 - sum))
        i += 8 - sum
        while (sum > 1) {
          unicodeBinary = unicodeBinary.concat(binaryArray.slice(i + 2, i + 8))
          i += 8
          --sum
        }
        unicode = unicode.concat(util._toDecimal(unicodeBinary))
        unicodeBinary = []
      }
    }
    return unicode
  }
}

export default CusBASE64
