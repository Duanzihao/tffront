<template>
  <div id="app">
    <router-view/>
    <div id="register">
      <p style="text-align: center">
        <a href="http://beian.miit.gov.cn">粤ICP备2021023332号-1</a>
      </p>

    </div>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#register {
  position: fixed;
  text-align: center;
  bottom: 0;
  left: 50%;
  display:inline-block;
}
</style>
