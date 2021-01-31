import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const createMap = (divId, options) => {
  return L.map(divId, options)
}
//添加创建地图的函数
const createTileLayer = (map, url, options) => {
  let tileLayer = L.tileLayer(url, options)
  tileLayer.addTo(map)
  return tileLayer
}

//向地图添加随意点经纬度提示
const freeLagLngTip = (myMap) => {
  const positionPopup = L.popup();
  myMap.on('click', function (e) {
    positionPopup.setLatLng(e.latlng)
      .setContent("你点击在了地图的 " + e.latlng.toString())
      .openOn(myMap);
  });
}

// 添加弹窗
const addPopup = () => {
  return L.popup();
}

export default {
  createMap,
  createTileLayer,
  addPopup
}
