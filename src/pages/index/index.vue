<template>
  <div class="index-page">
    <div class="upload-btn" @click="uploadBtnClick">+ 拍照/选图</div>
    <div class="praise-btn" @click="toParisePage">
      <image src="/static/praise.png" class="praise-icon"/>
      <span class="praise-word">点我，向开发者赞赏</span>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
export default {
  data () {
    return {
    }
  },
  methods: {
    ...mapMutations(['SET_TEMP_PREVIEW_IMG_SRC']),
    ...mapActions(['getToken']),
    uploadBtnClick () {
      wx.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        success: (res) => {
          console.log(res)
          this.SET_TEMP_PREVIEW_IMG_SRC(res.tempFilePaths[0])
          const url = `../preview/main`
          wx.navigateTo({url})
        }
      })
    },
    toParisePage () {
      wx.previewImage({
        urls: ['http://img-1255554167.picsh.myqcloud.com/2.png']
      })
      // const url = `../praise/main`
      // wx.navigateTo({url})
    }
  },
  created () {
    this.getToken()
  }
}
</script>

<style scoped>
  .index-page{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("http://img-1255554167.picsh.myqcloud.com/1.jpg") no-repeat ;
    background-position: 50%;
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .upload-btn{
    width: 463.5rpx;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background:#108ee9;
    color: #fff;
    font-size: 20px;
    height: 120rpx;
  }
  .praise-btn{
    padding-top: 22px;
    display: flex;
  }
  .praise-icon{
    width: 16px;
    height: 16px;
    margin-right: 5px;
    margin-top: 4px;
  }
  .praise-word{
    font-size:14px;
    color: #333;
    border-bottom: 1px solid #333;
  }
</style>
