<template>
  <div class="index-page">
    <div class="upload-btn" @click="uploadBtnClick">+ 拍照/选图</div>
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
        success: (res) => {
          console.log(res)
          this.SET_TEMP_PREVIEW_IMG_SRC(res.tempFilePaths[0])
          const url = `../preview/main`
          wx.navigateTo({url})
        }
      })
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
    background: url("http://www.ciweipdf.com/static/media/hero.99c69e64.jpg") no-repeat ;
    background-position: 50%;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .upload-btn{
    width: 400rpx;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background:#108ee9;
    color: #fff;
    font-size: 20px;
    height: 120rpx;
  }
</style>
