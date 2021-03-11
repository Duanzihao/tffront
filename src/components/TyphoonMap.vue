<template>
  <div>
    <div>
      <el-container style="height: 100%;border: 1px solid #eee">
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
          <el-menu>
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-message"></i>
                历史台风路径绘制
              </template>
              <div class="block">
                <el-date-picker
                  v-model="yearValue"
                  :picker-options="pickerOptions"
                  @change="getTyphoonNameFromBack"
                  type="year"
                  placeholder="选择年"
                  style="width: auto"
                  value-format="yyyy">
                </el-date-picker>
                <el-select v-model="typhoonName" placeholder="请选择">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
                <el-button type="primary" style="width: 200px" @click.native="drawTyphoonPath">绘制路径动画</el-button>
                <el-button type="danger" style="width: 200px;margin: 0" @click.native="clearCircles">清除路径点</el-button>
              </div>
            </el-submenu>


            <el-submenu index="2">
              <template slot="title">
                <i class="el-icon-menu"></i>手绘台风路径预测
              </template>
              <el-button type="primary" style="width: 200px" @click.native="drawRawPredictTyphoonPath">开始绘图</el-button>
              <el-button type="danger" style="width: 200px;margin: 0" @click.native="clearCircles">结束绘图</el-button>
            </el-submenu>


            <el-submenu index="3">
              <template slot="title"><i class="el-icon-setting"></i>台风路径预测</template>
              <el-menu-item-group>
                <template slot="title">分组一</template>
                <el-menu-item index="3-1">选项1</el-menu-item>
                <el-menu-item index="3-2">选项2</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="分组2">
                <el-menu-item index="3-3">选项3</el-menu-item>
              </el-menu-item-group>
              <el-submenu index="3-4">
                <template slot="title">选项4</template>
                <el-menu-item index="3-4-1">选项4-1</el-menu-item>
              </el-submenu>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-container>
          <el-header style="text-align: left; font-size: 20px">
            <el-dropdown>
              <i class="el-icon-setting" style="margin-right: 0"></i>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>查看</el-dropdown-item>
                <el-dropdown-item>新增</el-dropdown-item>
                <el-dropdown-item>删除</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <span>哈尔滨工业大学（深圳）台风路径预警系统</span>
          </el-header>

          <el-main id="mainMapContainer" style="padding: 0">
            <div class="map-container" id="map-container"></div>
          </el-main>


        </el-container>
      </el-container>
    </div>
  </div>
</template>

<script>
import {postTargetYear, postTargetTyphoonPath, setTyphoonColor} from "../api/api";
import {latLng} from "leaflet";
import L from "leaflet";
import {LMap, LTileLayer, LMarker, LPopup, LTooltip} from 'vue2-leaflet';
import * as emptransfer from "ant-design-vue";

export default {
  name: "tfmap",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LTooltip
  },
  data() {
    return {
      predictFlag: 0,
      clickPointList: [],
      clickLat: 0,
      clickLng: 0,
      pickerOptions: {
        //disabled为函数，返回值为布尔值，
        disabledDate: (time) => {
          let minYear = 1949;
          let maxYear = 2019;
          return time > new Date(JSON.stringify(maxYear)) || time.getTime() < new Date(JSON.stringify(minYear))
        }
      },
      lineArr24: [],
      lineArr48: [],
      zoom: 3,
      center: latLng(39.92, 116.46),
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
      mapOptions: {
        zoomSnap: 0.5
      },
      typhoonName: '',// 台风名字
      yearValue: '',// 台风值
      tfmap: null,
      // 以下是使用mapbox需要输入的参数，但是现在使用OpenStreet的话就不需要再输入密钥了
      OSMUrl: 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
      mapOption: {
        attribution: '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoiZHVhbnppaGFvIiwiYSI6ImNranZkNDZwNjA3dTIycG9hbjR6dGh5c3UifQ.ROEqcBmPSbuqfBW6AQZrYg'
      },
      options: [],
    }
  },
  methods: {
    //得到当前用户输入年份对应的台风名称
    getTyphoonNameFromBack() {
      let targetYear = this.yearValue;
      let result = [];
      let nameArray = [];
      // 获得后端返回的数据
      postTargetYear(targetYear).then(_data => {
        // 后面之所以都要包裹在这个大括号中运行
        // 是因为如果把nameArray放到括号外就不好使了
        // 我估计这个可能又是什么回调函数的问题
        nameArray = [].concat(_data.names);
        for (let i = 0; i < nameArray.length; i++) {
          let tmp = {};
          tmp.value = nameArray[i];
          tmp.label = nameArray[i];
          result.push(tmp);
        }
        this.options = result;
      })
    },

    // 点击画图按钮，绘制台风路径曲线
    drawTyphoonPath() {
      // 这里的指针一定要变换，因为地图是由vue的this指向的，
      // 所以后面的指向地图的指针也得是vue的this
      // 但是到了这些函数里面，
      // this就变成了这些函数自己的this，
      // 所以要在下面先声明一个outerThis备份好外面的this
      // 之后在指向地图的地方使用这个outerThis即可
      let outerThis = this;
      postTargetTyphoonPath(this.yearValue, this.typhoonName).then(_data => {
        let myTyphoonPath = _data.rows;
        let thisTyphoonName = _data.name;
        let pointCount = 0;
        let painter = setInterval(function () {
          // console.log('标点计数:' + pointCount);
          if (pointCount === myTyphoonPath.length) {
            // window.console.log('计时器关闭');
            clearInterval(painter);
          } else {
            let powerColor = setTyphoonColor(myTyphoonPath[pointCount].power);
            L.circle([myTyphoonPath[pointCount].lat, myTyphoonPath[pointCount].lng], 30000, {
              color: powerColor,
              fillColor: powerColor,
              fillOpacity: 0.5,
              radius: 500
            }).addTo(outerThis.tfmap).on("click", function (e) {
              let clickedCircle = e.target;
              let tmpString;
              if (this.power === 9) {
                tmpString = '变性';
              } else tmpString = this.power;
              clickedCircle.bindPopup(
                "<br>台风的信息:</br>"
                + "<br>名称：" + thisTyphoonName + "</br>"
                + '<br>纬度：' + this.lat.toString() + '</br>'
                + '<br>经度：' + this.lng.toString() + '</br>'
                + "<br>时间：" + this.time + "</br>"
                + "<br>强度：" + tmpString + "</br>"
              ).openPopup();
            }, myTyphoonPath[pointCount]);

            // 向地图中画线
            if (pointCount !== 0) {
              L.polygon([
                  [myTyphoonPath[pointCount].lat, myTyphoonPath[pointCount].lng],
                  [myTyphoonPath[pointCount - 1].lat, myTyphoonPath[pointCount - 1].lng]
                ],
                {
                  color: 'white'
                }).addTo(outerThis.tfmap);
            }
            pointCount++;
          }
        }, 300);
        // outerThis.circleGroup = L.layerGroup(outerThis.circleLayer);
        // outerThis.tfmap.addLayer(outerThis.circleGroup);
      })
    },

    // 点击台风预测功能，之后通过手动绘制的点预测台风路径
    drawRawPredictTyphoonPath() {
      // 绘图之前要有提示，确定之后才能进行
      window.alert("请点击地图上的位置，绘制出路径，之后我们会对路径进行预测");
      this.predictFlag = 1;

    },


    // 清除地图上所有的点和线
    clearCircles() {
      let outerThis = this;
      this.tfmap.eachLayer(function (layer) {
        // window.console.log(layer);
        // 底下这个写法是网上剽的，很神奇，按类型去除点
        if (layer instanceof L.Circle) {
          outerThis.tfmap.removeLayer(layer);
        }
        if (layer instanceof L.Polygon) {
          outerThis.tfmap.removeLayer(layer);
        }
      });
    }


  },
  mounted() {
    /***
     * 经度：lng
     * 纬度：lat
     */

    // 使用天地图遥感影像进行显示
    this.tfmap = L.map('map-container',
      {
        crs: L.CRS.EPSG4326,
        zoomControl: true,
        editable: true
      }).setView([20, 125], 3);
    //将图层加载到地图上
    //添加电子地图影像
    L.tileLayer("http://t0.tianditu.com/img_c/wmts?layer=img&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=3685d6669a48a505a86e8faff2ae47e9", {
      tileSize: 256,
      zoomOffset: 1,
      attribution: '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组'
    }).addTo(this.tfmap);
    //添加注记
    L.tileLayer("http://t1.tianditu.com/cva_c/wmts?layer=cva&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=3685d6669a48a505a86e8faff2ae47e9", {
      tileSize: 256,
      zoomOffset: 1,
      zIndex: 5,
    }).addTo(this.tfmap);
    this.lineArr24 = [[34, 127], [22, 127], [18, 119], [11, 119], [4.5, 113], [0, 105]];//24小时警戒线坐标集合
    this.lineArr48 = [[34, 132], [15, 132], [0, 120], [0, 105]];//48小时警戒线集合
    L.polyline(this.lineArr24, {color: 'yellow'}).bindTooltip(
      "24小时警戒线", {
        permanent: true,
        direction: "center",
        opacity: 0.5
      }).addTo(this.tfmap);
    L.polyline(this.lineArr48, {color: 'blue'}).addTo(this.tfmap).bindTooltip(
      "48小时警戒线", {
        permanent: true,
        direction: "center",
        opacity: 0.5
      }).addTo(this.tfmap);
    // 使用美国mapbox进行地图显示
    // this.tfmap = L.map('map-container').setView([20, 125], 4);
    // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    //   attribution: '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
    //   id: 'mapbox/satellite-streets-v11',
    //   tileSize: 512,
    //   zoomOffset: -1,
    //   accessToken: 'pk.eyJ1IjoiZHVhbnppaGFvIiwiYSI6ImNranZkNDZwNjA3dTIycG9hbjR6dGh5c3UifQ.ROEqcBmPSbuqfBW6AQZrYg'
    // }).addTo(this.tfmap);

    // 天地图普通2D影像渲染
    // this.tfmap = L.map('map-container', {crs: L.CRS.EPSG4326}).setView([20, 125], 3);
    // L.tileLayer('http://t0.tianditu.com/img_c/wmts?layer=img&style=default&tilematrixset=c&Service=WMTS&Request=GetTile&Version=1.0.0&Format=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}&tk=3685d6669a48a505a86e8faff2ae47e9', {
    //   maxZoom: 20,
    //   tileSize: 256,
    //   zoomOffset: 1
    // }).addTo(this.tfmap);

    // 以下是完全开源不付费的 openstreetmap 地图，如果看上面的不顺眼，可以使用下面的地图
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
    //   id: 'mapbox/streets-v11',
    //   tileSize: 512,
    //   zoomOffset: -1,
    // }).addTo(this.tfmap);

    // 点击任意点，显示经纬度信息
    const mountOuterThis = this;
    this.tfmap.on('click', function (e) {
      let positionPopup = L.popup();
      positionPopup.setLatLng(e.latlng)
        .setContent(
          "<br>你点击在地图的位置为： </br>"
          + '<br>纬度：' + e.latlng.lat.toString() + '</br>'
          + '经度：' + e.latlng.lng.toString()
        )
        .openOn(mountOuterThis.tfmap);
      // 下面这个位置一定要传一个this指针进去，要不然会报错
      mountOuterThis.clickLat = e.latlng.lat;
      mountOuterThis.clickLng = e.latlng.lng;
      // window.console.log(this.clickLat, this.clickLng);
      let tmp = [mountOuterThis.clickLat, mountOuterThis.clickLng];
      if (mountOuterThis.predictFlag === 1) {
        mountOuterThis.clickPointList.push(tmp);
        window.console.log(mountOuterThis.clickPointList);
      }
    }, mountOuterThis);
  }
}
;
</script>
<style scoped>
.map-container {
  box-sizing: border-box;
  padding: 0;
  position: absolute;
  width: 90%;
  height: 90%;
}

.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}

.tb-edit .input-box {
  display: none
}

.tb-edit .current-cell .input-box {
  display: block;
  margin-left: -15px;
}

</style>
