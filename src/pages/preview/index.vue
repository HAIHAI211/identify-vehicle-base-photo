<template>
  <div class="preview-page">
    <image :src="tempPreviewImgSrc" class="img" @load="imgload" mode="aspectFit"></image>
    <canvas canvas-id="img-canvas" class="img-canvas" id="img-canvas-dom" :style="{ flex: '0 0 auto', width: autoWidth + 'px',height: autoHeight + 'px' }"></canvas>
    <div class="wrap">
      <mpvue-echarts lazyLoad :echarts="echarts" :onInit="handleInit" ref="echarts" />
      <div class="loadEffect" v-if="loading">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import UPNG from 'upng-js'
import * as echarts from '../../../static/echarts.simple.min'
import mpvueEcharts from 'mpvue-echarts'
import api from '../../api'
// import base64config from './config'
// , width: '100%',height: autoHeight + 'px'
let chart = null
export default {
  components: {
    mpvueEcharts
  },
  data () {
    return {
      echarts,
      option: null,
      autoWidth: 300,
      autoHeight: 400,
      scale: 0,
      loading: true
    }
  },
  computed: {
    ...mapState(['tempPreviewImgSrc', 'accessToken']),
    ...mapActions(['getToken'])
  },
  methods: {
    reverseImgData (res) {
      var w = res.width
      var h = res.height
      let con = 0
      for (let i = 0; i < h / 2; i++) {
        for (let j = 0; j < w * 4; j++) {
          con = res.data[i * w * 4 + j]
          res.data[i * w * 4 + j] = res.data[(h - i - 1) * w * 4 + j]
          res.data[(h - i - 1) * w * 4 + j] = con
        }
      }
      return res
    },
    async imgCanvasInfo (res) {
      const imgCanvasWidth = res.width
      this.autoHeight = parseInt(imgCanvasWidth / this.scale)
      const base64 = await this._getBase64ByCanvas('img-canvas', imgCanvasWidth, this.autoHeight)
      console.log('base64', base64)
    },
    async imgload (e) {
      // console.log('imgload', e.mp.detail)
      // 获取图片的长宽
      const imgWidth = e.mp.detail.width
      const imgHeight = e.mp.detail.height
      this.scale = imgWidth / imgHeight
      console.log('图片真实宽度', imgWidth)
      console.log('图片真实高度', imgHeight)
      console.log('图片真实宽高比例', this.scale)
      const windowWidth = wx.getSystemInfoSync().windowWidth
      console.log('屏幕真实宽度', windowWidth)
      const shouldHeight = windowWidth / this.scale
      console.log('按照scale和屏幕真实宽度，高度应该为', shouldHeight)
      this.autoWidth = windowWidth
      this.autoHeight = shouldHeight
      const base64 = await this._getBase64ByCanvas('img-canvas', this.autoWidth, this.autoHeight)
      const carInfo = await this._getCarInfo(base64)
      console.log('carInfo', carInfo)
      this.initChart(carInfo.result)
      this.loading = false

      // var query = wx.createSelectorQuery()
      // query.select('#img-canvas-dom').boundingClientRect((res) => {
      //   this.imgCanvasInfo(res)
      // }).exec()
      // const base64 = await this._getBase64ByCanvas('img-canvas', imgWidth, imgHeight)
      // console.log('base64', base64)
      // const carInfo = await this._getCarInfo(base64)
      // console.log('carInfo', carInfo)
      // this.initChart(carInfo.result)
    },
    initChart (arr) {
      this.option = this.initOption(arr)
      console.log('this.option', this.option)
      this.$refs.echarts.init()
    },
    handleInit (canvas, width, height) {
      chart = echarts.init(canvas, null, {
        width: width,
        height: height
      })
      canvas.setChart(chart)
      chart.setOption(this.option)
      return chart
    },
    initOption (arr) {
      const baseOption = {
        backgroundColor: '#ffffff',
        series: [{
          name: '车型概率',
          label: {
            normal: {
              formatter: '{b|{b}}\n{hr|}\n{a|{a}: }{per|{d}%}{abg|}',
              backgroundColor: '#eee',
              borderColor: '#aaa',
              borderWidth: 0.5,
              borderRadius: 4,
              // shadowBlur:3,
              // shadowOffsetX: 2,
              // shadowOffsetY: 2,
              // shadowColor: '#999',
              // padding: [0, 7],
              rich: {
                a: {
                  fontSize: 10,
                  color: '#999',
                  lineHeight: 20,
                  align: 'center'
                },
                // abg: {
                //     backgroundColor: '#333',
                //     width: '100%',
                //     align: 'right',
                //     height: 22,
                //     borderRadius: [4, 4, 0, 0]
                // },
                hr: {
                  borderColor: '#aaa',
                  width: '100%',
                  borderWidth: 0.5,
                  height: 0
                },
                b: {
                  fontSize: 9,
                  lineHeight: 22,
                  align: 'center'
                },
                per: {
                  fontSize: 9,
                  color: '#eee',
                  backgroundColor: '#334455',
                  padding: [1, 1.3],
                  borderRadius: 2,
                  align: 'center'
                }
              }
            }
          },
          type: 'pie',
          center: ['50%', '50%'],
          radius: ['0%', '36%'],
          data: [],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 2, 2, 0.3)'
            }
          }
        }]
      }
      const data = []
      for (let i = 0; i < arr.length; i++) {
        let a = arr[i]
        data.push({
          value: a.score,
          name: a.name
        })
      }
      baseOption.series[0].data = data
      return baseOption
    },
    _getBase64ByCanvas (canvasId, imgWidth, imgHeight) {
      const canvas = wx.createCanvasContext(canvasId)
      const platform = wx.getSystemInfoSync().platform
      // 1. 绘制图片至canvas
      canvas.drawImage(this.tempPreviewImgSrc, 0, 0, imgWidth, imgHeight)
      let _this = this
      // 绘制完成后执行回调，API 1.7.0
      return new Promise((resolve, reject) => {
        return canvas.draw(false, () => {
          // 2. 获取图像数据， API 1.9.0
          wx.canvasGetImageData({
            canvasId: canvasId,
            x: 0,
            y: 0,
            width: imgWidth,
            height: imgHeight,
            success (res) {
              if (platform === 'ios') {
                res = _this.reverseImgData(res)
              }
              // 3. png编码
              let pngData = UPNG.encode([res.data.buffer], res.width, res.height)
              // 4. base64编码
              let base64 = wx.arrayBufferToBase64(pngData)
              resolve(base64)
            },
            fail (e) {
              console.log('e', e)
              reject(e)
            }
          })
        })
      })
    },
    async _getCarInfo (base64) {
      let carInfo
      try {
        carInfo = await api.getCarInfo(base64, this.accessToken)
      } catch (e) {
        if (e.error_code === 110) { // token失效
          await this.getToken()
          carInfo = await api.getCarInfo(base64, this.accessToken)
        }
      }
      return carInfo
    }
  },
  async mounted () {
    console.log('preview mounted')
    // const imgWidth = 300
    // const imgHeight = 225
    // const base64 = await this._getBase64ByCanvas('img-canvas', this.autoWidth, this.autoHeight)
    // // const base64 = await api.getBase64(this.tempPreviewImgSrc)
    // console.log('base64', base64)
    // // alert(base64)
    // const carInfo = await this._getCarInfo(base64)
    // console.log('carInfo', carInfo)
    // this.initChart(carInfo.result)

    // const base64 = await api.getBase64(this.tempPreviewImgSrc)
    // console.log('base64', base64)
    // let carInfo
    // console.log('accessToken', this.accessToken)
    // try {
    //   carInfo = await api.getCarInfo(base64, this.accessToken)
    // } catch (e) {
    //   if (e.error_code === 110) { // token失效
    //     await this.getToken()
    //     carInfo = await api.getCarInfo(base64, this.accessToken)
    //   }
    // }
    // console.log('carInfo', carInfo)
    // this.initChart(carInfo.result)
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
    /*display: none;*/
    flex: 0 0 auto;
  }
  .img-canvas{
    position: absolute;
    visibility: hidden;
  }
  .wrap{
    flex: 1;
    width: 100%;
  }
  .loadEffect{
    width: 100px;
    height: 100px;
    position: absolute;
    margin: 0 auto;
    margin-top:100px;
  }
  .loadEffect span{
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: lightgreen;
    position: absolute;
    -webkit-animation: load 1.04s ease infinite;
  }
  @-webkit-keyframes load{
    0%{
      -webkit-transform: scale(1.2);
      opacity: 1;
    }
    100%{
      -webkit-transform: scale(.3);
      opacity: 0.5;
    }
  }
  .loadEffect span:nth-child(1){
    left: 0;
    top: 50%;
    margin-top:-10px;
    -webkit-animation-delay:0.13s;
  }
  .loadEffect span:nth-child(2){
    left: 14px;
    top: 14px;
    -webkit-animation-delay:0.26s;
  }
  .loadEffect span:nth-child(3){
    left: 50%;
    top: 0;
    margin-left: -10px;
    -webkit-animation-delay:0.39s;
  }
  .loadEffect span:nth-child(4){
    top: 14px;
    right:14px;
    -webkit-animation-delay:0.52s;
  }
  .loadEffect span:nth-child(5){
    right: 0;
    top: 50%;
    margin-top:-10px;
    -webkit-animation-delay:0.65s;
  }
  .loadEffect span:nth-child(6){
    right: 14px;
    bottom:14px;
    -webkit-animation-delay:0.78s;
  }
  .loadEffect span:nth-child(7){
    bottom: 0;
    left: 50%;
    margin-left: -10px;
    -webkit-animation-delay:0.91s;
  }
  .loadEffect span:nth-child(8){
    bottom: 14px;
    left: 14px;
    -webkit-animation-delay:1.04s;
  }
</style>
