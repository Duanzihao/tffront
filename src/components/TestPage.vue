<template>
  <h1>测试界面</h1>
<!--  <div id="map"></div>-->
</template>

<script>
// import{L} from "leaflet"
export default {
  name: "TestPage",
  methods: {
    initMap() {
      let map = L.map("map", {
        minZoom: 3,
        maxZoom: 14,
        center: [39.550339, 116.114129],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        crs: L.CRS.EPSG3857
      });
      this.map = map;　　　　//data上需要挂载
      window.map = map;
      L.tileLayer(
        "http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
      ).addTo(map);
    },
  }
}
</script>

<style scoped>

</style>
