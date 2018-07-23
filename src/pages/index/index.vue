<template>
  <div class="index-page">
    <div class="head"></div>
    <div class="upload-btn" @click="uploadBtnClick"><span class="upload-btn-plus">+</span> 选择车辆图片</div>
    <!--<navigator hover-class="none" class="praise-btn" target="miniProgram" open-type="navigate" app-id="wx18a2ac992306a5a4" path="pages/apps/largess/detail?accountId=4185653" extra-data="" version="release">-->
      <!--<image src="/static/praise.png" class="praise-icon"/>-->
      <!--<span class="praise-word">点我，向开发者赞赏</span>-->
    <!--</navigator>-->
    <div class="praise-btn-wrap">
      <praise-btn/>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import praiseBtn from '../../components/ivbp-praise-btn'

export default {
  components: {
    praiseBtn
  },
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
    box-sizing: border-box;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background:#108ee9;
    color: #fff;
    font-size: 22px;
    height: 120rpx;
  }
  .upload-btn-plus{
    font-size: 40px;
    padding-right: 10px;
    padding-bottom: 5px;
  }
  .praise-btn-wrap{
    padding-top: 30rpx;
  }
</style>
