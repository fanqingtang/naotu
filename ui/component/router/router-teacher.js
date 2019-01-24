import Vue from "vue";  //加载vue
import VueRouter from "vue-router"; //加载vue-router插件

import myClass from "../page/teacher/myClass.vue"; //引入我的班级组件
import myNaotu from "../page/teacher/myNaotu.vue"; //引入我的脑图组件

import chapters from "../page/teacher/chapters.vue";

Vue.use(VueRouter);  //use一下vueRouter

const routes = [
    {
        path: '/class', component: myClass
    },
    { 
       path: '/naotu', component: myNaotu 
    },
    {
        name:'chapters',path:'/chapters',component:chapters
    }
];

const router = new VueRouter({
    mode:'hash',
    routes,
    linkActiveClass: "class_active"  //激活时的别名
});

export default router;

