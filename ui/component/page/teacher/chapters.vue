<template>
  <div id="naotu_chapters_wrapper">
    <div class="naotu_chapters" v-for="(item,index) in chaptersData" :key="index">
      <div class="naotu_img" @click="naotuOpen(item)">
        <img :src="item.img" alt="脑图作业">
        <span class="naotu_mark" v-if="item.is_teacher">师</span>
        <span class="naotu_mark text_ellipsis" v-else>{{item.title}}</span>
      </div>
      <p class="naotu_desc text_ellipsis" :class="[item.is_teacher?'teacher_active':'']">
        <strong v-if="item.is_teacher">{{item.title}}</strong>
        <strong v-else>{{item.stu_name}}</strong>
        <span>{{item.datetime}}</span>
      </p>
      <div class="naotu_drop_down" v-if="item.is_teacher">
        <el-dropdown trigger="click">
          <span class="el-dropdown-link">
            <i class="drop_down_img"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item @click.native="cancelShare(item)">取消分享</el-dropdown-item>
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
    <empty ref="ElEmpty">
      <span>暂无脑图</span>
    </empty>
  </div>
</template>



<script>
import qs from "qs";
import empty from "../../common/empty.vue";
import addClass from "./addClass.vue";
export default {
  data() {
    return {
      chaptersData: [], //章节数据列表
      naotuId: "", //要添加班级脑图的id
      chapterId: "", //章节id
      classId: "" //班级id
    };
  },
  mounted() {
    var clientH =
        document.documentElement.clientHeight || document.body.clientHeight,
      naotuChapterWrapper = document.getElementById("naotu_chapters_wrapper");
    naotuChapterWrapper.style.height = clientH + "px";
  },
  created() {
    var classIdOrltId = this.$route.params;
    this.chapterId = classIdOrltId.ltId.lt_id; //章节id
    this.classId = classIdOrltId.classId; //班级id
    this.naotuChapters(); //获取章节脑图列表
  },
  methods: {
    naotuChapters() {
      //调用获取章节脑图列表接口
      this.$axios
        .post(
          this.$global.serverSrc + "/api/naotu/naotu_mylist",
          qs.stringify({
            auth_cookie: this.$NaotuUser.auth_cookie,
            classId: this.classId,
            lt_id: this.chapterId
          })
        )
        .then(res => {
          let { data: chaptersList } = res,
            code = chaptersList.code,
            desc = chaptersList.desc;
          if (code == 200) {
            this.chaptersData = chaptersList.data.mylist;
            let ElEmpty = this.$refs.ElEmpty.$el;
            if (!this.chaptersData.length) {
              ElEmpty.style.display = "block";
            } else {
              ElEmpty.style.display = "none";
            }
          } else {
            throw new Error(desc);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    naotuOpen(item) {
      //点击展开脑图
      var naotuJson = JSON.parse(item.natujson);
      minder.importJson(naotuJson);
      this.bus.$emit("drawNaotu"); //用事件车绑定一个画新脑图方法
      this.bus.$emit("changeNaotu", item); //用事件车绑定修改脑图方法
    },
    cancelShare(item) {
      //取消分享
      this.$axios
        .post(
          this.$global.serverSrc + "/api/naotu/cancelShare",
          qs.stringify({
            auth_cookie: this.$NaotuUser.auth_cookie,
            id: item.p_id
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
            this.chaptersData = this.chaptersData.filter(
              value => item !== value
            );
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
    "add-class": addClass,
    empty
  }
};
</script>


<style lang="less" scoped>
#naotu_chapters_wrapper {
  padding: 70px 70px 166px;
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  background-color: #f3f3f3;
  overflow: auto;

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

      .naotu_mark {
        font-family: "PingFang-SC";
        font-weight: bold;
        font-size: 14px;
        color: #ffffff;
        max-width: 150px;
        height: 24px;
        padding: 0 5px;
        line-height: 23px;
        border-radius: 2px;
        background-color: #fc8383;
        position: absolute;
        left: 10px;
        top: 10px;
      }
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
      height: 70px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      line-height: 34px;
      font-family: "PingFang-SC";

      strong {
        display: block;
        font-style: normal;
        font-size: 16px;
        color: #333333;
      }

      span {
        display: block;
        font-size: 13px;
        color: #999999;
      }
    }

    .teacher_active {
      background: rgba(252, 131, 131, 1);

      strong,
      span {
        color: #ffffff;
      }
    }
  }

  .naotu_div_empty {
    width: 300px;
    height: 0;
    background: #ffffff;
  }
}

.text_ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>