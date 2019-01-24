<template>
  <div class="tab_wrapper">
    <div class="header_wrapper">
      <div class="header_left">
        <ul>
          <li @click="naotuStudyWork" class="naotu_study_work">脑图小屋</li>
          <li @click="naotuSaveNode" class="naotu_save_node">保存</li>
        </ul>
      </div>
      <div class="header_middle">
        <h4 @dblclick="naotuEditorTitle" v-if="naotuTitleSwitch" class="text_ellipsis">{{naotuTitle}}</h4>
        <input v-focus type="text" class="inputBox" v-if="!naotuTitleSwitch" @blur="naotuEditorInput" @keyup.enter="naotuEditorInput"
          v-model="naotuTitle">
      </div>
      <div class="header_right">
        <ul class="header_right_group">
          <li @click="downNaotuImg" class="naotu_down_img">导出</li>
          <li class="avatar_group">
            <img :src="$NaotuUser.avatar" alt="头像">
            <span class="text_ellipsis">{{$NaotuUser.userName}}</span>
          </li>
        </ul>
      </div>
    </div>
    <transition name="studentFade">
      <div id="content_wrapper" v-show="naotuHomeFlag">
        <home-work></home-work>
      </div>
    </transition>
  </div>
</template>


<script>
  import homeWork from "../page/teacher/homeWork.vue";
  import qs from "qs";

  export default {
    data() {
      return {
        naotuTitle: "新建脑图", //脑图标题
        classId: 0, //班级id默认为0,
        lt_id: 0, //章节id默认为0
        naotuTitleSwitch: true, //脑图标题和输入框切换隐藏显示标识
        naotuId: "", //脑图id
        naotuTimer: "", //保存按钮保存的太过频繁时用定时器来节流这个就是保存定时器句柄的
        naotuHomeFlag: false, //标识脑图小屋是否显示
        isStudentFlag: 1 //判断是否是学生脑图
      };
    },
    created() {
      this.bus.$on("changeNaotu", naotu => {
        //监听修改脑图操作
        var drawFlag = naotu.drawFlag;
        if (drawFlag === "flag") {
          this.classId = naotu.classId;
          this.lt_id = naotu.lt_id;
        }
        this.naotuId = naotu.id; //把脑图数据存起来
        this.naotuTitle = naotu.title; //把脑图标题赋值
        this.isStudentFlag = naotu.is_teacher; //判断是否是学生脑图
      });

      //我的脑图调用画新脑图的方法,监听新创建脑图方法,这里用的eventbus
      this.bus.$on("drawNaotu", () => {
        this.naotuHomeFlag = false;
        this.$router.push("/");
      });

      //删除脑图之后执行的方法
      this.bus.$on("IsUpdateOrCreate", naotuArr => {
        if (naotuArr.includes(this.naotuId)) {
          //判断这个刚新建的脑图有么有被删除掉，如果删除掉了就执行新建，否则就是更新
          this.naotuId = false;
        }
      });
    },
    mounted() {
      //每次刷新都重新加载默认脑图
      setTimeout(() => {
        this.naotuReset();
      }, 1000);
    },
    methods: {
      naotuStudyWork() {
        //点击作业的时候显示我的作业小屋窗口
        let oldNaotu =
          '{"root":{"data":{"id":"4d79d6569b9d","created":1541569126,"text":"新建脑图"},"children":[]},"template":"default","theme":"fresh-blue","version":"1.4.43"}',
          newNaotu = JSON.stringify(minder.exportJson());
        if (!this.naotuId && oldNaotu !== newNaotu) {
          this.$confirm("是否需要保存脑图?", "提示", {
            confirmButtonText: "是",
            cancelButtonText: "否",
            type: "warning"
          })
            .then(() => {
              this.naotuSaveNode(1); //如果是第一次编辑没保存就提示是否保存
            })
            .catch(() => {
              this.$global.elMessage.message(
                "保存失败!",
                "warning",
                1000,
                this
              );
              this.naotuHomeFlag = true;
              this.$router.push("/naotu");
            });
        } else {
          this.naotuHomeFlag = true;
          this.$router.push("/naotu");
        }
      },
      naotuSaveNode(flag) {
        clearTimeout(this.naotuTimer);
        if (Number(this.isStudentFlag) === 0) {
          //如果打开的是教师端分享过来的脑图就只有查看功能,不能修改。
          this.$global.elMessage.message(
            "您没有权限修改学生的脑图!",
            "warning",
            1000,
            this
          );
          return;
        }
        this.naotuTimer = setTimeout(() => {
          //节流
          //保存脑图节点信息接口
          var naotujson = JSON.stringify(minder.exportJson()),
            //naotuMiddleTitle = minder.getRoot().data.text; //获取跟节点内容；
            naotuTitle = this.naotuTitle,
            naotuImg = minder.exportData("png").then(res => {
              var naotuId = this.naotuId,
                url,
                param;
              if (naotuId || naotuId === 0) {
                url = this.$global.serverSrc + "/api/naotu/update_naotu";
                param = qs.stringify({
                  auth_cookie: this.$NaotuUser.auth_cookie,
                  id: naotuId,
                  naotujson: naotujson,
                  img: res,
                  title: naotuTitle
                });
              } else {
                url = this.$global.serverSrc + "/api/naotu/create_naotu";
                param = qs.stringify({
                  auth_cookie: this.$NaotuUser.auth_cookie,
                  classId: this.classId,
                  lt_id: this.lt_id,
                  title: naotuTitle,
                  naotujson: naotujson,
                  img: res
                });
              }
              this.$axios
                .post(url, param)
                .then(({ data: saveNodeData }) => {
                  var code = saveNodeData.code,
                    desc = saveNodeData.desc;
                  if (saveNodeData.data.id) {
                    this.naotuId = saveNodeData.data.id;
                  }
                  if (code == 200) {
                    this.$global.elMessage.message(desc, "success", 1000, this);
                    if (flag === 1) {
                      this.naotuHomeFlag = true;
                      this.$router.push("/naotu");
                    }
                  } else {
                    this.$message({
                      message: desc,
                      type: "error",
                      duration: 1000
                    });
                    this.$global.elMessage.message(desc, "error", 1000, this);
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            });
        }, 200);
      },
      downNaotuImg() {
        minder.exportData("png").then(data => {
          var $a = document.createElement("a");
          $a.setAttribute("href", data);
          $a.setAttribute("download", "");
          var evObj = document.createEvent("MouseEvents");
          evObj.initMouseEvent(
            "click",
            true,
            true,
            window,
            0,
            0,
            0,
            0,
            0,
            false,
            false,
            true,
            false,
            0,
            null
          );
          $a.dispatchEvent(evObj);
        });
      },
      naotuEditorTitle() {
        //脑图标题编辑方法
        this.naotuTitleSwitch = false;
      },
      naotuEditorInput(val) {
        //脑图标题输入框触发方法
        this.naotuTitleSwitch = true;
      },
      naotuReset() {
        //脑图重置
        var naotuJson = JSON.parse(
          '{"root":{"data":{"id":"4d79d6569b9d","created":1541569126,"text":"新建脑图"},"children":[]},"template":"default","theme":"fresh-blue","version":"1.4.43"}'
        );
        minder.importJson(naotuJson);
      }
    },
    directives: {
      // 自定义指令是为了编辑标题输入框的时候自动获取焦点
      focus: {
        inserted: function (el) {
          el.focus();
        }
      }
    },
    components: {
      //引入组件
      "home-work": homeWork
    }
  };
</script>

<style lang="less" scoped>
  .tab_wrapper {
    height: 40px;
    background: #393f4f;

    .header_wrapper {
      height: 40px;
      position: relative;
    }

    ul {
      height: 40px;
      font-size: 0;
      margin-right: -1px;

      li {
        display: inline-block;
        font-family: "PingFang-SC";
        height: 40px;
        line-height: 40px;
        vertical-align: top;
        color: #ffffff;
        font-size: 14px;
        font-weight: bold;
        border-right: 1px solid #ffffff;
        padding-left: 35px;
        cursor: pointer;
      }
    }

    .header_left {
      width: 186px;
      height: 40px;
      background: #fc8383;
      position: absolute;
      left: 0;
      top: 0;

      .naotu_study_work {
        width: 106px;
        background: url("../../images/home.png") no-repeat 16px center;
        background-size: 16px 16px;
      }

      .naotu_save_node {
        width: 80px;
        background: url("../../images/save.png") no-repeat 16px center;
        background-size: 14px 14px;
        border-right: none;
      }
    }

    .header_right {
      width: 214px;
      height: 40px;
      position: absolute;
      right: 0;
      top: 0;

      .naotu_down_img {
        width: 80px;
        background: #fc8383 url("../../images/export.png") no-repeat 16px center;
        background-size: 14px 14px;
        border-right: 0;
      }

      .avatar_group {
        width: 134px;
        padding-left: 0;
        border-right: none;
        text-align: center;
        font-size: 0;

        img {
          display: inline-block;
          width: 30px;
          height: 30px;
          line-height: 30px;
          border-radius: 50%;
          vertical-align: middle;
        }

        span {
          display: inline-block;
          font-size: 14px;
          width: 50px;
          vertical-align: middle;
        }
      }
    }

    .header_middle {
      height: 40px;
      width: 300px;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      text-align: center;

      h4 {
        height: 40px;
        width: 300px;
        line-height: 40px;
        font-family: "PingFang-SC";
        font-weight: bold;
        font-size: 14px;
        color: #ffffff;
      }

      .inputBox {
        border: none;
        margin: 3px 5px;
        padding: 5px;
        height: 34px;
        line-height: 24px;
        outline: 0;
        font-size: 14px;
        min-width: 200px;
        color: #000;
      }
    }

    #content_wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      z-index: 99;
      background: #f3f3f3;
    }
  }

  .studentFade-enter-active,
  .studentFade-leave-active {
    transition: opacity 0.5s;
  }

  .studentFade-enter,
  .studentFade-leave-to {
    opacity: 0;
  }

  .text_ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>