<template>
  <div class="empty_wrapper">
    <img src="public/js/naotu/images/empty.png" alt="空脑图">
    <slot></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  }
};
</script>


<style lang="less" scoped>
.empty_wrapper {
  display: none;
  width: 160px;
  height: 215px;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;
  img {
    display: block;
    width: 160px;
    height: 160px;
  }
  span {
    display: inline-block;
    font-family: "PingFang-SC";
    font-size: 18px;
    font-weight: 500;
    color: #999999;
    margin-top: 30px;
  }
}
</style>