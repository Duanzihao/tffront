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

export default {
  createMap,
  createTileLayer
}
