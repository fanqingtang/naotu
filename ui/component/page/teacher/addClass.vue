<template>
  <div class="class_wrapper">
    <div class="class_header">
      <h4>添加班级</h4>
    </div>
    <div class="class_content">
      <div class="class_left">
        <ul class="class_left_box">
          <li
            class="text_ellipsis"
            v-for="(item,index) in naotuClassData"
            :class="[index==classActive?'class_active':'']"
            :key="index"
            :title="item.cs_name"
            @click="eventClassList(item.cs_id,index)"
          >{{item.cs_name}}</li>
        </ul>
      </div>
      <div class="class_right">
        <ul class="class_right_box">
          <li v-for="(item , index) in chapters" :key="index">
            <label class="text_ellipsis" :for="item.lt_id">{{item.lt_title}}</label>
            <input
              type="radio"
              :id="item.lt_id"
              :value="item.lt_id"
              class="naotu_checkbox"
              v-model="selectChapers"
            >
          </li>
        </ul>
      </div>
    </div>
    <div class="class_footer">
      <button class="class_cancel" @click="naotuCancelDialog">取消</button>
      <button class="class_correct" @click="naotuCorrectDialog">确定</button>
    </div>
  </div>
</template>


<script>
import qs from "qs";
export default {
  data() {
    return {
      naotuClassData: "", //脑图班级列表数据初始值
      classActive: 0, //给班级列表点击添加class_active样式
      chapters: "", //章节列表数据初始值
      selectChapers: "", //选择章节默认的单选框
      classId: "" //存储默认班级id
    };
  },
  props: ["naotuId"],
  created() {
    this.naotuClassList();
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
            this.naotuClassData = classList.data.dataClass;
            this.selectId = this.naotuClassData[0].cs_id; // 获取输入框第一行id
            if (this.selectId || this.selectId === 0) {
              this.eventClassList(this.selectId);
            }
          } else {
            throw new Error("没有获取到数据!");
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    naotuCancelDialog() {
      //点击取消添加班级按钮执行的方法
      this.$global.elMessage.message("取消成功!", "info", 1000, this);
      this.$emit("naotuCancelDialog", false);
    },

    eventClassList(key, index = 0) {
      //点击班级列表执行的方法
      this.classActive = index;
      this.classId = key;
      this.$axios
        .post(
          this.$global.serverSrc + "/api/naotu/getLiveTimeTable",
          qs.stringify({
            auth_cookie: this.$NaotuUser.auth_cookie,
            classId: key
          })
        )
        .then(res => {
          let { data: chaptersList } = res,
            code = chaptersList.code,
            desc = chaptersList.desc;
          if (code == 200) {
            this.chapters = chaptersList.data;
          } else {
            throw new Error(desc);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    naotuCorrectDialog() {
      //添加班级弹窗点击确定执行的方法
      if (!this.selectChapers) {
        this.$global.elMessage.message(
          "请选择要添加的章节!",
          "info",
          1000,
          this
        );
        return;
      }
      this.$axios
        .post(
          this.$global.serverSrc + "/api/naotu/share_naotu",
          qs.stringify({
            auth_cookie: this.$NaotuUser.auth_cookie,
            classId: this.classId,
            id: this.naotuId,
            lt_id: this.selectChapers
          })
        )
        .then(res => {
          let { data: updateData } = res,
            code = updateData.code,
            desc = updateData.desc;
          if (code == 200) {
            this.$global.elMessage.message(
              "已添加，前去“我的班级”查看!",
              "success",
              1000,
              this
            );
            this.naotuCorrectRefresh();
          } else {
            throw new Error(desc);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    naotuCorrectRefresh() {
      this.$emit("naotuCorrectRefresh", false);
    }
  }
};
</script>


<style lang="less" scoped>
.class_wrapper {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 360px;
  padding: 20px 30px 20px 0px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px 1px 10px 0px rgba(0, 0, 0, 0.3);
}
.class_header {
  text-align: left;
  padding-left: 30px;
  h4 {
    font-family: "PingFang-SC";
    font-weight: bold;
    font-size: 18px;
    color: #333333;
  }
}
.class_content {
  height: 194px;
  margin: 40px 0;
  overflow: hidden;
  position: relative;
  .class_left {
    float: left;
    height: 100%;
    width: 180px;
    border-right: 1px solid #e5e5e5;
  }
  .class_left_box,
  .class_right_box {
    height: 100%;
    width: 100%;
    overflow: auto;
    li {
      height: 100%;
      width: 100%;
      padding-left: 30px;
      font-family: "PingFang-SC";
      font-weight: bold;
      font-size: 16px;
      color: #666666;
      height: 22px;
      line-height: 22px;
      text-align: left;
      margin-bottom: 20px;
      cursor: pointer;
    }
    li:last-child {
      margin-bottom: 0;
    }
    .naotu_checkbox {
      width: 24px;
      height: 24px;
      margin: 0;
      vertical-align: top;
    }
    .class_active {
      color: #fc8383;
      border-left: 4px solid #fc8383;
    }
  }

  .class_right {
    height: 100%;
    width: 390px;
    overflow: hidden;
    label {
      display: inline-block;
      height: 100%;
      width: 310px;
      cursor: pointer;
    }
    input[type="radio"] {
      width: 20px;
      height: 20px;
      margin: 0;
      cursor: pointer;
    }
  }
}
.class_footer {
  font-family: "PingFang-SC";
  font-weight: bold;
  font-size: 0;
  color: #999999;
  text-align: right;
  button {
    width: 36px;
    height: 25px;
    font-size: 18px;
    line-height: 25px;
    text-align: center;
    border: none;
    background: none;
    outline: none;
    &:hover {
      color: #fc8383;
    }
  }
  .class_correct {
    margin-left: 50px;
  }
}
.text_ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
