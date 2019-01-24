
import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App-student.vue';
import Axios from 'axios';

Vue.use(ElementUI);

import './ui/css/reset.css';

import router from './ui/component/router/router-student.js';

import Global from './ui/component/common/global.vue';

Vue.prototype.$axios = Axios;  //在vue的原型添加一个$axios方法

Vue.prototype.$global = Global;//在vue的原型添加一个$$global方法

Vue.prototype.$NaotuUser = NaotuUser;  //在vue的原型上添加一个$NaotuUser方法
 
Vue.prototype.bus = new Vue;  //在vue的原型上添加一个vue对象

new Vue({
    el:'#app',
    router,
    template:'<App/>',
    components:{App}
})
