<template>
  <div id="naotu_wrapper">
    <div class="naotu_header" v-show="headerFlag">
      <button class="select_all" @click="naotuSelectAll">全选</button>
    </div>
    <div class="naotu_header" v-show="!headerFlag">
      <input type="checkbox" v-model="checked" id="naotu_check_all">
      <label for="naotu_check_all" class="naotu_check_text">全选</label>
      <span class="naotu_select_num">已选<em class="naotu_num">{{checkedAll.length}}</em>张</span>
      <button class="naotu_delete" @click="naotuDelete(1)">删除</button>
      <button class="naotu_signout_select" @click="cancelSelect">退出选择</button>
    </div>

    <div class="naotu_chapters_wrapper">
      <div class="naotu_chapters" @click="drawNaotu">
        <div class="add_center">
          <img src="public/js/naotu/images/t_add.png" alt="画个新脑图">
          <p class="text_ellipsis">画个新脑图</p>
        </div>
      </div>

      <div class="naotu_chapters" v-for="(item , index) in naotuListData" :key="index">
        <div class="naotu_img" @click="naotuOpen(item)">
          <img :src="item.img" alt="脑图作业">
          <div class="naotu_mask" @click.stop="naotuMaskIsSelect(item)" v-show="!headerFlag"></div>
        </div>
        <p class="naotu_desc text_ellipsis">
          <strong class="text_ellipsis" :title="item.title">{{item.title}}</strong>
          <span class="text_ellipsis">{{item.datetime}}</span>
        </p>
        <input type="checkbox" v-model="checkedAll" class="naotu_mark" :value="item.id" v-show="!headerFlag">
        <span class="naotu_share" v-show="item.is_share" :title="item.s_className+'-'+item.s_lt_title" ref="shareAttribute">分享中</span>
        <div class="naotu_drop_down">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              <i class="drop_down_img"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="naotuAddClass(item)" v-if="!item.is_share">分享班级</el-dropdown-item>
              <el-dropdown-item @click.native="cancelShare(item)" v-else>取消分享</el-dropdown-item>
              <el-dropdown-item @click.native="naotuRename(item)">重命名</el-dropdown-item>
              <el-dropdown-item @click.native="naotuSingleDelete(item)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <!-- 创建几个空标签为了兼容布局 -->
      <div class="naotu_div_empty"></div>
      <div class="naotu_div_empty"></div>
      <div class="naotu_div_empty"></div>
      <div class="naotu_div_empty"></div>
      <div class="naotu_div_empty"></div>
    </div>

    <transition name="fadeAddClass">
      <div class="naotu_addClass_wrapper" v-show="addClassFlag">
        <add-class @naotuCancelDialog="naotuCancelDialog" @naotuCorrectRefresh="naotuCorrectRefresh" :naotuId="naotuId"></add-class>
      </div>
    </transition>
  </div>
</template>

<script>
  import qs from "qs";
  import addClass from "./addClass.vue";
  export default {
    data() {
      return {
        naotuListData: "", //脑图列表数据
        checkedAll: [], //存储循环单选框id集合
        addClassFlag: false, //添加班级弹出层是否显示标识
        naotuId: "", //要添加班级脑图的id
        headerFlag: true, //头部操作隐藏显示切换标识
        getShareEle: "" //全局保存分享中的span元素
      };
    },
    computed: {
      checked: {
        get() {
          return this.checkedAll.length == this.naotuListData.length;
        },
        set(val) {
          return (this.checkedAll = val
            ? this.naotuListData.map(item => item.id)
            : []);
        }
      }
    },
    mounted() {
      var clientH =
        document.documentElement.clientHeight || document.body.clientHeight,
        naotuWrapper = document.getElementById("naotu_wrapper");
      naotuWrapper.style.height = clientH + "px";
    },
    created() {
      this.naotuList(); //获取脑图列表数据
    },
    methods: {
      drawNaotu() {
        //点击画脑图执行的方法子类调用父类的方法;
        var naotuJson = JSON.parse(
          '{"root":{"data":{"id":"4d79d6569b9d","created":1541569126,"text":"新建脑图"},"children":[]},"template":"default","theme":"fresh-blue","version":"1.4.43"}'
        ),
          drawNewNaotu = {
            classId: 0,
            lt_id: 0,
            title: "新建脑图",
            id: false,
            drawFlag: "flag"
          };
        minder.importJson(naotuJson);
        this.bus.$emit("drawNaotu");
        this.bus.$emit("changeNaotu", drawNewNaotu); //用事件车绑定修改脑图方法
      },
      naotuList() {
        //获取脑图列表数据
        this.$axios
          .post(
            this.$global.serverSrc + "/api/naotu/naotu_mylist",
            qs.stringify({
              auth_cookie: this.$NaotuUser.auth_cookie
            })
          )
          .then(res => {
            let { data: naotuData } = res,
              code = naotuData.code,
              desc = naotuData.desc;
            if (code == 200) {
              this.naotuListData = naotuData.data.mylist;
            } else {
              throw new Error(desc);
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      cancelSelect() {
        //退出选择
        this.checkedAll = [];
        this.headerFlag = true;
        if (this.getShareEle) {
          this.getShareEle.forEach(item => (item.style.left = "10px"));
        }
      },
      naotuDelete(flag) {
        //删除脑图列表方法;
        if (!this.checkedAll.length) {
          this.$global.elMessage.message(
            "请选择要删除的数据!",
            "warning",
            1000,
            this
          );
          return;
        }
        var tipTitle =
          flag === 1
            ? "确定全部取消分享并删除脑图吗？删除后不可恢复！"
            : "确定取消分享并删除脑图吗？删除后不可恢复！";
        this.$confirm(tipTitle, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
          .then(() => {
            this.$axios
              .post(
                this.$global.serverSrc + "/api/naotu/del_naotu",
                qs.stringify({
                  auth_cookie: this.$NaotuUser.auth_cookie,
                  id: this.checkedAll
                })
              )
              .then(res => {
                let { data: naotuDeleteList } = res,
                  code = naotuDeleteList.code,
                  desc = naotuDeleteList.desc;
                if (code == 200) {
                  this.$global.elMessage.message(
                    "删除成功!",
                    "success",
                    1000,
                    this
                  );
                  this.naotuListData = this.naotuListData.filter(item => {
                    if (!this.checkedAll.includes(item.id)) {
                      return item;
                    }
                  });
                  if (!this.naotuListData.length) {
                    this.headerFlag = true;
                  }
                  this.bus.$emit("IsUpdateOrCreate", this.checkedAll); //删除脑图之后再次回到脑图界面点击保存判断是删除还是更新
                  this.checkedAll = [];
                } else {
                  throw new Error(desc);
                }
              })
              .catch(error => {
                console.log(error);
              });
          })
          .catch(() => {
            this.$global.elMessage.message("已取消删除!", "info", 1000, this);
            this.checkedAll = [];
          });
      },
      naotuAddClass(item) {
        //添加班级执行的方法
        this.addClassFlag = true;
        this.naotuId = item.id;
      },
      naotuCancelDialog(flag) {
        //添加班级弹窗点击取消执行的方法，子传父
        this.addClassFlag = flag;
      },
      naotuCorrectRefresh(flag) {
        //添加班级弹窗点击确定刷新父页面的数据，子传父
        this.addClassFlag = flag;
        this.naotuList();
      },
      naotuOpen(item) {
        //点击展开脑图
        var naotuJson = JSON.parse(item.natujson);
        minder.importJson(naotuJson);
        this.bus.$emit("drawNaotu"); //用事件车绑定一个画新脑图方法
        this.bus.$emit("changeNaotu", item); //用事件车绑定修改脑图方法
      },
      naotuRename(item) {
        //脑图重命名
        var naotuId = item.id;
        this.$prompt("我的脑图名字是？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        })
          .then(({ value }) => {
            if (value) {
              this.$axios
                .post(
                  this.$global.serverSrc + "/api/naotu/update_naotu",
                  qs.stringify({
                    auth_cookie: this.$NaotuUser.auth_cookie,
                    id: naotuId,
                    title: value
                  })
                )
                .then(res => {
                  let { data: naotuRenameData } = res,
                    code = naotuRenameData.code,
                    desc = naotuRenameData.desc;
                  if (code == 200) {
                    this.$global.elMessage.message(
                      "重命名成功",
                      "success",
                      1000,
                      this
                    );
                    item.title = value;
                  } else {
                    throw new Error(desc);
                  }
                })
                .catch(error => {
                  console.log(error);
                });
            } else {
              this.$global.elMessage.message(
                "文件名不能为空!",
                "warning",
                1000,
                this
              );
            }
          })
          .catch(() => {
            this.$global.elMessage.message("已取消重命名!", "info", 1000, this);
          });
      },
      naotuSingleDelete(item) {
        //脑图删除自身
        var naotuId = item.id;
        this.checkedAll.push(naotuId);
        this.naotuDelete(2);
      },
      naotuSelectAll() {
        //全选
        this.headerFlag = false;
        this.getShareEle = this.$refs.shareAttribute;
        if (this.getShareEle) {
          this.getShareEle.forEach(item => (item.style.left = "40px"));
        }
      },
      naotuMaskIsSelect(item) {
        //图层控制复选框是否选择
        var id = item.id,
          index = this.checkedAll.indexOf(id);
        if (index !== -1) {
          this.checkedAll.splice(index, 1);
        } else {
          this.checkedAll.push(id);
        }
      },
      cancelShare(item) {
        //取消分享
        this.$axios
          .post(
            this.$global.serverSrc + "/api/naotu/cancelShare ",
            qs.stringify({
              auth_cookie: this.$NaotuUser.auth_cookie,
              id: item.id
            })
          )
          .then(res => {
            let { data: shareData } = res,
              code = shareData.code,
              desc = shareData.desc;
            if (code == 200) {
              this.$global.elMessage.message(
                "取消分享成功!",
                "success",
                1000,
                this
              );
              item.is_share = false;
            } else {
              throw new Error(desc);
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    },
    components: {
      "add-class": addClass
    }
  };
</script>

<style lang="less" scoped>
  #naotu_wrapper {
    padding: 0 70px 166px;
    overflow: auto;
    background-color: #f3f3f3;

    .naotu_header {
      font-family: "PingFang-SC";
      font-size: 0;
      height: 70px;
      line-height: 70px;

      #naotu_check_all {
        width: 24px;
        height: 24px;
        margin: 0 10px 0 0;
        vertical-align: -6px;
        cursor: pointer;
      }

      .naotu_select_num,
      .naotu_check_text {
        margin-right: 50px;
        color: #333333;
        font-size: 16px;
      }

      .naotu_num {
        font-style: normal;
        color: #fc8383;
        font-size: 16px;
      }

      button {
        line-height: 29px;
        text-align: center;
        background: rgba(255, 255, 255, 1);
        border-radius: 16px;
        border: 1px solid #e5e5e5;
        color: #333333;
        outline: none;
        font-size: 16px;

        &:hover {
          border: 1px solid #fc8383;
          color: #fc8383;
        }
      }

      .select_all {
        width: 70px;
        height: 30px;
        background: rgba(255, 255, 255, 1);
        border-radius: 16px;
        border: 1px solid #e5e5e5;
      }

      .naotu_delete {
        width: 70px;
        height: 30px;
        margin-right: 20px;
      }

      .naotu_signout_select {
        width: 102px;
        height: 30px;
      }
    }

    .naotu_chapters_wrapper {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      align-items: center;

      .naotu_chapters {
        width: 300px;
        height: 300px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 1px 10px 0px rgba(57, 63, 79, 0.05);
        margin-bottom: 70px;
        position: relative;
        cursor: pointer;

        &:hover {
          box-shadow: 0px 1px 10px 2px rgba(57, 63, 79, 0.2);
        }

        .add_center {
          width: 80px;
          height: 122px;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;

          img {
            display: inline-block;
            width: 80px;
            height: 80px;
            vertical-align: center;
          }

          p {
            font-family: "PingFang-SC";
            font-size: 16px;
            color: #fc8383;
            margin-top: 20px;
            text-align: center;
          }
        }

        .naotu_img {
          position: relative;
          width: 300px;
          height: 230px;
          text-align: center;
          overflow: hidden;

          img {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            max-width: 100%;
            max-height: 100%;
            margin: auto;
            transition: all 0.3s;

            &:hover {
              transform: scale(1.2);
            }
          }

          .naotu_mask {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }

        .naotu_mark {
          width: 24px;
          height: 24px;
          margin: 0;
          position: absolute;
          left: 10px;
          top: 10px;
          cursor: pointer;
        }

        .naotu_share {
          font-family: "PingFang-SC";
          font-weight: bold;
          color: #ffffff;
          text-align: center;
          width: 52px;
          height: 24px;
          line-height: 23px;
          background: rgba(252, 131, 131, 1);
          border-radius: 2px;
          position: absolute;
          left: 10px;
          top: 10px;
          transition: left 0.5s;
        }

        .naotu_drop_down {
          position: absolute;
          right: 10px;
          top: 10px;

          .drop_down_img {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: url("../../../images/open.png") no-repeat 0 0;
            background-size: 24px 24px;
          }
        }

        .naotu_desc {
          width: 300px;
          height: 69px;
          border-top: 1px solid #e5e5e5;
          text-align: center;
          line-height: 34px;
          font-family: "PingFang-SC";

          strong {
            display: block;
            padding: 0 50px;
            font-style: normal;
            font-size: 16px;
            color: #333333;
          }

          span {
            display: block;
            padding: 0 50px;
            font-size: 13px;
            color: #999999;
          }
        }
      }
    }

    .fadeAddClass-enter,
    .fadeAddClass-leave-to {
      opacity: 0;
    }

    .fadeAddClass-enter-active,
    .fadeAddClass-leave-active {
      transition: opacity 0.5s;
    }

    .naotu_div_empty {
      width: 300px;
      height: 0;
      background: #ffffff;
    }

    .naotu_addClass_wrapper {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1;
      background: rgba(0, 0, 0, 0.5);
    }

    .text_ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>