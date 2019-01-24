<template>
  <div id="class_wrapper">
    <ul>
      <li v-for="(item,key,index) in chapters" :key="index" @click="naotuChapters(item)">
        <div class="class_top">
          <img src="public/js/naotu/images/brain.png" alt="脑图">
        </div>
        <span>{{item.tch_name}}</span>
        <div class="title_wrapper">
          <p class="title_chapter text_ellipsis" :title="item.lt_title">{{item.lt_title}}</p>
          <img class="naotu_flag" src="public/js/naotu/images/newNaotu.png" alt="新脑图" v-if="!item.is_read">
        </div>
      </li>

      <!-- 创建几个空标签为了兼容布局 -->
      <li class="naotu_div_empty"></li>
      <li class="naotu_div_empty"></li>
      <li class="naotu_div_empty"></li>
      <li class="naotu_div_empty"></li>
      <li class="naotu_div_empty"></li>
    </ul>

    <empty ref="ElEmpty">
      <span>暂无章节</span>
    </empty>
  </div>
</template>

<script>
  import empty from "../../common/empty.vue";
  import qs from "qs";
  export default {
    data() {
      return {
        chapters: [], //初始化章节列表
        selectId: "" //班级id
      };
    },
    props: ["selectList"],
    watch: {
      selectList(newV, oldV) {
        this.filterChapters(newV);
        this.selectId = newV;
      }
    },
    created() {
      this.selectId = this.selectList;
      if (this.selectId || this.selectId === 0) {
        this.filterChapters(this.selectList);
      }
    },
    mounted() {
      var clientH =
        document.documentElement.clientHeight || document.body.clientHeight,
        classWrapperH = document.getElementById("class_wrapper");
      classWrapperH.style.height = clientH + "px";
    },
    methods: {
      naotuChapters(item) {
        //点击相应的班级进入这个班级的章节页面
        this.$router.push({
          name: "chapters",
          params: { ltId: item, classId: this.selectId }
        }); //跳转到章节
      },
      filterChapters(item) {
        //通过选中班级过滤章节
        this.$axios
          .post(
            this.$global.serverSrc + "/api/naotu/getLiveTimeTable",
            qs.stringify({
              auth_cookie: this.$NaotuUser.auth_cookie,
              classId: item
            })
          )
          .then(res => {
            let { data: chaptersList } = res,
              code = chaptersList.code,
              desc = chaptersList.desc;
            if (code == 200) {
              this.chapters = chaptersList.data;
              let ElEmpty = this.$refs.ElEmpty.$el;
              if (!this.chapters.length) {
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
      }
    },
    components: {
      empty
    }
  };
</script>

<style lang="less" scoped>
  #class_wrapper {
    padding: 70px 70px 166px;
    background-color: #f3f3f3;
    overflow: auto;

    ul {
      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;
      align-items: center;

      li {
        width: 300px;
        height: 300px;
        position: relative;
        cursor: pointer;
        text-align: center;
        margin-bottom: 70px;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 1px 10px 0px rgba(57, 63, 79, 0.05);

        &:hover {
          box-shadow: 0px 1px 10px 2px rgba(57, 63, 79, 0.2);
        }
      }

      .class_top {
        height: 230px;
        line-height: 230px;
        position: relative;
        transition: all 0.3s;

        img {
          display: inline-block;
          vertical-align: middle;
          width: 60px;
          height: 65px;
        }

        &:hover {
          transform: scale(1.2);
        }
      }

      span {
        font-family: "PingFang-SC";
        font-size: 20px;
        color: #fc8383;
        position: absolute;
        right: 20px;
        top: 20px;
      }

      .title_wrapper {
        font-family: "PingFang-SC";
        font-size: 16px;
        color: #333333;
        height: 69px;
        line-height: 69px;
        border-top: 1px solid #e5e5e5;
        position: relative;

        .title_chapter {
          width: 250px;
          height: 100%;
          margin: auto;
        }

        .naotu_flag {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 57px;
          height: 57px;
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