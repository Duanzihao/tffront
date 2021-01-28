import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '../components/HelloWorld'
import TestPage from "../components/TestPage";
import TyphoonMap from "../components/TyphoonMap";

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/HelloWorld',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/Test',
      name: 'TestPage',
      component: TestPage
    },
    {
      path: '/',
      name: 'TyphoonMap',
      component: TyphoonMap
    }
  ]
})
