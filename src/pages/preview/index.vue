<template>
  <div class="preview-page">
    <image :src="tempPreviewImgSrc" class="img" mode="aspectFit" @click="preview"></image>
    <div class="wrap">
      <div class="result" v-if="arr.length">
        <div class="row" v-for="item in arr" :key="index">
          <span class="index">{{ index + 1 }}</span>
          <div class="title">
            <span class="name">{{ item.name }}<span class="year">{{ item.year }}</span></span>
            <div class="pc">
              <div class="percent" :style="{ width: item.percent,background: percentBg }"></div>
              <span class="percent-value">{{ item.percent }}</span>
            </div>
          </div>
        </div>
      </div>
      <ivbp-loading v-if="loading" :loadingPercent="loadingPercent"/>
      <ivbp-error v-if="error" :value="errorMsg"/>
    </div>
    <div class="praise-btn-wrap">
      <praise-btn/>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import ivbpLoading from '../../components/ivbp-loading'
import praiseBtn from '../../components/ivbp-praise-btn'
import ivbpError from '../../components/ivbp-error'

import wxPromisify from '../../utils/promise'
const uploadFile = wxPromisify(wx.uploadFile)
export default {
  components: {
    ivbpLoading,
    praiseBtn,
    ivbpError
  },
  data () {
    return {
      option: null,
      loading: false,
      loadingPercent: 0,
      error: false,
      errorMsg: '遇到了小问题 请重试',
      arr: [],
      percentBg: 'linear-gradient(to right, #8e9eab, #eef2f3);',
      wrapBg: '#fff'
    }
  },
  watch: {
    loading (v) {
      if (v) {
        this.error = false
      }
    },
    error (v) {
      if (v) {
        this.loading = false
      }
    }
  },
  computed: {
    ...mapState(['tempPreviewImgSrc', 'accessToken']),
    ...mapActions(['getToken'])
  },
  async mounted () {
    this.arr = []
    this.loading = true
    this.loadingPercent = 0
    this.error = false
    this.percentBg = 'linear-gradient(to right, #8e9eab, #eef2f3);'
    console.log('开始上传图片，本地图片地址为', this.tempPreviewImgSrc)
    this._uploadFile()
  },
  methods: {
    preview () {
      wx.previewImage({
        urls: [this.tempPreviewImgSrc]
      })
    },
    _getPercentTotal (arr) {
      let result = 0
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        result += item.score
      }
      return result
    },
    _dealArr (arr) {
      const percentTotal = this._getPercentTotal(arr)
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i]
        item.percent = `${(item.score / percentTotal * 100).toFixed(2)}%`
        item.width = 100
      }
      return arr
    },
    _getPercentBg (colorName) {
      if (colorName === '蓝色') {
        this.percentBg = 'linear-gradient(to right, #0575e6, #021b79);'
      } else if (colorName === '红色') {
        this.percentBg = 'linear-gradient(to right, #e52d27, #b31217);'
      } else if (colorName === '橙色') {
        this.percentBg = 'linear-gradient(to right, #fe8c00, #f83600);'
      } else if (colorName === '黑色') {
        this.percentBg = 'linear-gradient(to right, #000000, #434343);'
      } else if (colorName === '绿色') {
        this.percentBg = 'linear-gradient(to right, #6a9113, #141517);'
      } else if (colorName === '棕色') {
        this.percentBg = 'linear-gradient(to right, #804000, #555555);'
      } else if (colorName === '白色') {
        // this.percentBg = 'linear-gradient(to right, #ece9e6, #ffffff);'
      } else if (colorName === '黄色') {
        this.percentBg = 'linear-gradient(to right, #ffe000, #799f0c);'
      }
    },
    async _uploadFile () {
      // const host = 'http://localhost:8082/car/'
      // const host = 'http://139.199.35.20:8082/car/'
      const host = 'https://car.blogharrison.com/car/'
      try {
        const res = await uploadFile({
          url: host + 'upload/complex', // 仅为示例，非真实的接口地址
          filePath: this.tempPreviewImgSrc,
          name: 'file',
          formData: {
            'token': this.accessToken,
            'num': 3
          }
        }, (uploadTask) => {
          uploadTask.onProgressUpdate((res) => {
            this.loadingPercent = parseInt(res.progress * 0.99)
          })
        })
        console.log('res', res)
        const data = JSON.parse(res.data)
        const arr = data.result
        const color = data.color_result
        console.log('data', data)
        this.loadingPercent = 100
        this.loading = false

        const d1 = arr[0]
        if (d1.name === '非车类') {
          this.errorMsg = '我也很无奈啊 没在图里找到汽车'
          this.error = true
        } else {
          this._getPercentBg(color)
          this.arr = this._dealArr(arr)
        }
      } catch (e) {
        this.errorMsg = '遇到了小问题 请重试'
        this.error = true
        console.log('e', e)
      }
    }
  },
  onShareAppMessage (res) {
    return {
      title: '鉴图识车，如你所见',
      path: '/pages/index/main',
      imageUrl: ''
    }
  }
}
</script>

<style scoped>
  .preview-page{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .img{
    flex: 0 0 auto;
  }
  .wrap{
    flex: 1;
    width: 100%;
    position: relative;
  }
  .row{
    height: 160rpx;
    box-sizing: border-box;
    border-bottom: 1px solid #efefef;
    display: flex;
    align-items: center;
    padding: 0 30rpx 0 40rpx;
  }
  .title{
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .name{
    font-size: 20px;
    color: #333;
  }
  .index{
    flex: 0 0 auto;
    font-size: 16px;
    font-weight: bold;
    color: #adadad;
    margin-right: 60rpx;
  }
  .year{
    font-size: 11px;
  }
  .pc{
    display: flex;
    align-items: center;
  }
  .percent{
    flex: 0 1 auto;
    height: 20rpx;
    border-radius: 10rpx;
    margin-right: 10rpx;
  }
  .percent-value{
    flex: 0 0 auto;
    font-size: 15px;
    color: darkgray;
  }

  .praise-btn-wrap{
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 10rpx;
  }

</style>
