<template>
  <div class="preview-page">
    <image :src="tempPreviewImgSrc" class="img" mode="aspectFit"></image>
    <div class="wrap">
      <mpvue-echarts lazyLoad :echarts="echarts" :onInit="handleInit" ref="echarts" />
      <ivbp-loading v-if="loading" :loadingPercent="loadingPercent"/>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import * as echarts from '../../../static/echarts.simple.min'
import mpvueEcharts from 'mpvue-echarts'
import ivbpLoading from '../../components/ivbp-loading'

let chart = null
export default {
  components: {
    mpvueEcharts,
    ivbpLoading
  },
  data () {
    return {
      echarts,
      option: null,
      loading: false,
      loadingPercent: 0
    }
  },
  computed: {
    ...mapState(['tempPreviewImgSrc', 'accessToken']),
    ...mapActions(['getToken'])
  },
  mounted () {
    this.loading = true
    console.log('开始上传图片，本地图片地址为', this.tempPreviewImgSrc)
    let _this = this
    // const host = 'http://localhost:8082/car/'
    // const host = 'http://139.199.35.20:8082/car/'
    const host = 'https://car.blogharrison.com/car/'
    const uploadTask = wx.uploadFile({
      url: host + 'upload/complex', // 仅为示例，非真实的接口地址
      filePath: this.tempPreviewImgSrc,
      name: 'file',
      formData: {
        'token': this.accessToken
      },
      success (res) {
        console.log('res', res)
        const data = JSON.parse(res.data)
        _this.initChart(data)
      }
    })
    uploadTask.onProgressUpdate((res) => {
      this.loadingPercent = parseInt(res.progress * 0.99)
      // console.log('上传进度', res.progress)
      // console.log('已经上传的数据长度', res.totalBytesSent)
      // console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    })
  },
  methods: {
    initChart (arr) {
      console.log('arr', arr)
      this.option = this.initOption(arr)
      console.log('this.option', this.option)
      this.$refs.echarts.init()
      this.loadingPercent = 100
      this.loading = false
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
                  fontSize: 10,
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
        console.log(i, a)
        data.push({
          value: a.score,
          name: a.name
        })
      }
      baseOption.series[0].data = data
      return baseOption
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
</style>
