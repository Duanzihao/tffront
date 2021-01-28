<template>
  <div class="map-container" id="map-container"></div>
</template>

<script>
export default {
  name: "map",
  components: {},
  data() {
    return {
      map: null,
      OSMUrl: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      mapOption: {
        attribution: '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZHVhbnppaGFvIiwiYSI6ImNranZkNDZwNjA3dTIycG9hbjR6dGh5c3UifQ.ROEqcBmPSbuqfBW6AQZrYg'
      },
    }
  },
  mounted() {
    this.map = this.$utils.map.createMap("map-container");
    // 设施地图视图 中心位置
    this.map.setView([39.92, 116.46], 3);
    // 加载 open street map和mapbox 图层服务
    this.$utils.map.createTileLayer(this.map, this.OSMUrl, this.mapOption);
    window.onload = function () {
      //设置年份的选择
      var myDate = new Date();
      var startYear = myDate.getFullYear() - 50;//起始年份
      var endYear = myDate.getFullYear() + 50;//结束年份
      var obj = document.getElementById('targetYear')
      for (var i = startYear; i <= endYear; i++) {
        obj.options.add(new Option(i, i));
      }
      obj.options[obj.options.length - 51].selected = 1;
    }
  }
}
;
</script>
<style scoped>
.map-container {
  position: absolute;
  width: 100%;
  height: 100%;
}
</style>
