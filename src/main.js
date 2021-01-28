// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import "leaflet/dist/leaflet.css";
import utils from './utils'
import { Button } from 'ant-design-vue'

Vue.use(Button);
Vue.config.productionTip = false
Vue.prototype.$utils = utils
/* eslint-disable no-new */

new Vue({
  el: '#app',
  router,
  components: {App},
  template: '<App/>'
})