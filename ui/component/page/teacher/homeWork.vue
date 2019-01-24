<template>
  <div class="naotuRoom_wrapper" id="homeWork">
    <el-row class="naotuRoom_header">
      <el-col :span="6" class="header_left">
        <img src="public/js/naotu/images/t_back.png" alt="返回" @click="naotuBack" v-if="titleFlag">
        <img src="public/js/naotu/images/t_back.png" alt="返回" @click="naotuChaptersBack" v-else>
      </el-col>
      <el-col :span="12" class="header_middle">
        <div v-if="titleFlag">
          <router-link to="/naotu" tag="a">我的脑图</router-link>
          <router-link :to="classLink" tag="a">我的班级</router-link>
        </div>
        <div v-else>
          <h4 class="text_ellipsis">{{charpterTitle}}</h4>
        </div>
      </el-col>
      <el-col :span="6" class="header_right" v-show="selectFlag">
        <el-select v-model="select" placeholder="请选择" @change="filterChapters">
          <el-option v-for="(item,index) in options" :key="index" :label="item.cs_name" :value="item.cs_id"></el-option>
        </el-select>
      </el-col>
    </el-row>
    <!-- 脑图标题end -->
    <!-- tab切换内容start -->
    <router-view :selectList="selectList"></router-view>
    <!-- tab切换内容end -->
  </div>
</template>


<script>
  import qs from "qs";
  export default {
    data() {
      return {
        options: "", //班级下拉列表初始值
        select: "", //默认下拉班级输入框显示默认值
        classLink: "/class", //默认进入我的脑图路由后面加上/class
        selectList: "", //初始化章节为空
        titleFlag: true, //头部标题切换
        selectFlag: true //班级选择框标识隐藏
      };
    },
    watch: {
      "$route.path"(newVal) {
        if (newVal === "/class") {
          this.selectFlag = true;
        }
        if (newVal === "/naotu") {
          this.titleFlag = true;
          this.selectFlag = false;
        }
        if (newVal === "/chapters") {
          this.titleFlag = false;
        }
      }
    },
    computed: {
      charpterTitle() {
        //章节标题
        if (Object.keys(this.$route.params).length) {
          this.selectFlag = false;
          return this.$route.params.ltId.lt_title; //章节的标题
        }
      }
    },
    created() {
      this.selectFlag = false; //隐藏我的脑图是没有下拉选择班级的
      this.naotuClassList(); //调用添加班级接口,获取班级数据。
      this.routerLink(); //一进来给路由加上class
    },
    methods: {
      naotuClassList() {
        //获取班级数据
        this.$axios
          .post(
            this.$global.serverSrc + "/api/naotu/naotu_info",
            qs.stringify({
              auth_cookie: this.$NaotuUser.auth_cookie
            })
          )
          .then(res => {
            let { data: classList } = res,
              code = classList.code;
            if (code == 200) {
              this.options = classList.data.dataClass;
              if (this.options.length) {
                this.select = this.options[0].cs_name; //一进来设置输入框显示默认值
                this.selectId = this.options[0].cs_id; // 获取输入框第一行id
                this.selectList = this.selectId;
              }
            } else {
              throw new Error("没有获取到数据!");
            }
          })
          .catch(error => {
            console.log(error);
          });
      },
      routerLink() {
        //一进来默认选中我的班级
        this.$router.push({ path: "/naotu" });
      },
      naotuChaptersBack() {
        //章节返回上一级方法；
        this.$router.go(-1);
        this.titleFlag = true;
      },
      naotuBack() {
        //返回到脑图界面
        this.bus.$emit("drawNaotu");
      },
      filterChapters(item) {
        //班级筛选方法
        this.selectList = item;
      }
    }
  };
</script>


<style lang="less" scoped>
  .naotuRoom_wrapper {
    height: 100%;

    .naotuRoom_header {
      height: 80px;
      background-color: #393f4f;

      .header_left {
        height: 80px;
        line-height: 80px;
        padding-left: 20px;
        cursor: pointer;

        img {
          display: inline-block;
          width: 44px;
          height: 44px;
          vertical-align: middle;
        }
      }

      .header_middle {
        height: 80px;
        line-height: 80px;
        text-align: center;

        a {
          font-family: "PingFang-SC";
          font-weight: bold;
          font-size: 20px;
          color: #ffffff;
          display: inline-block;
          height: 80px;
          width: 150px;
          text-align: center;
          text-decoration: none;
        }

        .class_active {
          color: #fc8383;
          border-bottom: 4px solid #fc8383;
        }

        h4 {
          height: 100%;
          line-height: 80px;
          text-align: center;
          font-family: "PingFang-SC";
          font-weight: bold;
          font-size: 20px;
          color: #ffffff;
        }
      }

      .header_right {
        height: 80px;
        line-height: 80px;

        .el-select {
          height: 40px;
          width: 285px;
          border-radius: 100px;
        }
      }
    }
  }

  .text_ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>