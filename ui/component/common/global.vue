<script>
const serverSrc = "https://pangu.lexue100.com";
const elMessage = {  //消息提示信息
  message(message,type,duration,that) {
    that.$message({
      message,
      type,
      duration
    });
  }
};

export default {
  serverSrc, //服务器地址
  elMessage
};
</script>

