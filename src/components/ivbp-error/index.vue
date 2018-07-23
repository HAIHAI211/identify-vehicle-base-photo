<template>
  <div class="error">
    <image src="/static/error.jpg" class="error-img"/>
    <div class="error-word">{{ value }}</div>
  </div>
</template>
<script>
  export default {
    props: {
      value: {
        type: String,
        default: '遇到了小问题 请重试'
      }
    }
  }
</script>
<style scoped>
  .error{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .error-img{
    width: 200rpx;
    height: 200rpx;
  }
  .error-word{
    padding-top: 5px;
    font-size: 13px;
    color: #333;
  }
</style>
