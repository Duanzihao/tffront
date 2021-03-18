<template>
  <div>
    <div>
      <el-container style="height: 100%;border: 1px solid #eee">
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
          <!--          <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">-->
          <!--            <el-radio-button :label="false">展开</el-radio-button>-->
          <!--            <el-radio-button :label="true">收起</el-radio-button>-->
          <!--          </el-radio-group>-->
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
                <i class="el-icon-menu"></i>模拟台风路径预测
              </template>
              <el-button type="primary" style="width: 200px" @click.native="drawRawPredictTyphoonPath">开始绘图</el-button>
              <el-button type="danger" style="width: 200px;margin: 0" @click.native="endDrawPoint">结束绘图</el-button>
              <el-button type="primary" style="width: 200px;margin: 0" @click.native="clearCircles">清除路径点</el-button>
              <el-button type="success" style="width: 200px;margin: 0" @click.native="receiveTyphoonPredictPoint">开始预测
              </el-button>
            </el-submenu>


            <el-submenu index="3">
              <template slot="title"><i class="el-icon-setting"></i>实时台风路径预测</template>
              <el-button type="primary" style="width: 200px" @click.native="getNewestTyphoonData">获取最新台风信息</el-button>
              <el-select v-model="newestTyphoonList" placeholder="请选择">
                <el-option
                  v-for="item in newestTyphoonList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <el-button type="success" :disabled="ifPredict" style="width: 200px;margin: 0"
                         @click.native="receiveTyphoonPredictPoint">开始预测
              </el-button>
            </el-submenu>


            <el-submenu index="4">
              <template slot="title"><i class="el-icon-setting"></i>测距工具</template>
              <el-button type="primary" style="width: 200px" @click.native="calculateDistanceOfTwoPoint">开始绘图
              </el-button>
              <el-button type="danger" style="width: 200px;margin: 0" @click.native="endDrawPoint">结束绘图</el-button>
              <el-button type="primary" style="width: 200px;margin: 0" @click.native="clearCircles">清除路径点</el-button>
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
import {
  postTargetYear,
  postTargetTyphoonPath,
  setTyphoonColor,
  postTyphoonPredictPint,
  postNewestTyphoonInformation,
} from "../api/api";
import {latLng} from "leaflet";
import L from "leaflet";
import {LMap, LTileLayer, LMarker, LPopup, LTooltip} from 'vue2-leaflet';
import * as emptransfer from "ant-design-vue";
import * as leaflet_measure_path from "../api/leaflet-measure-path";
import * as leaflet_measure_path_css from "../api/leaflet-measure-path.css";

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
      // isCollapse: true,
      existLineOpts: {
        color: "rgba(255, 58, 0, 1)",
        weight: 4,
        opacity: 1,
        // 是否显示量测信息
        showMeasurements: true,
        // 量测信息的属性：
        measurementOptions: {
          minDistance: 30 // 显示 最小的线长度为30m(默认)，小于此长度则不显示
        }
      },
      existPolygonOpts: {
        color: "rgba(0, 58, 255, 0.85)",
        weight: 2,
        opacity: 0.85,
        // 是否显示量测信息
        showMeasurements: true,
        // 量测信息的属性：
        measurementOptions: {
          showOnHover: true // 开始鼠标移动到图形上时显示量测信息
        }
      },
      ifPredict: true,// true 能点击，false 不能点击
      newestTyphoonList: [],
      predictPointCount: 0,
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
    // handleOpen(key, keyPath) {
    //   console.log(key, keyPath);
    // },
    // handleClose(key, keyPath) {
    //   console.log(key, keyPath);
    // },

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
                }).addTo(outerThis.tfmap).showMeasurements();
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
      this.clickPointList = [];
    },

    //点击图中有的点，之后进行测距
    calculateDistanceOfTwoPoint() {
      this.predictFlag = 1;
      this.clickPointList = [];
    },

    // 清除地图上所有的点和线
    clearCircles() {
      this.clickPointList = [];
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
    },

    //结束手绘开始预测
    endDrawPoint() {
      this.predictFlag = 0;
      this.predictPointCount = 0;
    },

    //进行台风路径预测
    receiveTyphoonPredictPoint() {
      let outerThis = this;
      postTyphoonPredictPint(this.clickPointList).then(_data => {
        let predictPoint = _data.predictPoint[0];
        let storePointList = outerThis.clickPointList;
        let lastPoint = storePointList[storePointList.length - 1];
        window.console.log(lastPoint);
        window.console.log(predictPoint);


        L.polygon(
          [
            [lastPoint[0], lastPoint[1]],
            [predictPoint[0], predictPoint[1]]
          ], {
            weight: 6,
            opacity: 1,
            color: 'red'
          }).addTo(outerThis.tfmap).showMeasurements();

        L.circle([predictPoint[0], predictPoint[1]], 30000, {
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.5,
          radius: 500
        }).addTo(outerThis.tfmap).on("click", function (e) {
          let clickedCircle = e.target;
          clickedCircle.bindPopup(
            '<br>纬度：' + predictPoint[0].toString() + '</br>'
            + '<br>经度：' + predictPoint[1].toString() + '</br>'
          ).openPopup();
        });
      }, outerThis);
    },

    //获取最新的台风数据
    getNewestTyphoonData() {
      let outerThis = this;
      let nameArray = [];
      let result = [];
      postNewestTyphoonInformation().then(_data => {
        nameArray = [].concat(_data.GET_result);
        // window.console.log(nameArray);
        if (nameArray.length === 0) {
          alert('当前海面上无新台风');
          outerThis.ifPredict = true;
        } else {
          for (let i = 0; i < nameArray.length; i++) {
            let tmp = {};
            tmp.value = nameArray[i];
            tmp.label = nameArray[i];
            result.push(tmp);
          }
          outerThis.ifPredict = true;
          outerThis.newestTyphoonList = result;
        }
      }, outerThis);
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

      let lat_last_point = mountOuterThis.clickLat;
      let lng_last_point = mountOuterThis.clickLng;
      mountOuterThis.clickLat = e.latlng.lat;
      mountOuterThis.clickLng = e.latlng.lng;
      let lat_point_to_paint = mountOuterThis.clickLat;
      let lng_point_to_paint = mountOuterThis.clickLng;
      // window.console.log(this.clickLat, this.clickLng);


      let tmp = [mountOuterThis.clickLat, mountOuterThis.clickLng];


      if (mountOuterThis.predictFlag === 1) {
        mountOuterThis.clickPointList.push(tmp);
        window.console.log(mountOuterThis.clickPointList);
        //点击到哪里就在哪里绘图
        L.circle([lat_point_to_paint, lng_point_to_paint], 30000, {
          color: "green",
          fillColor: "white",
          fillOpacity: 0.5,
          radius: 500
        }).addTo(mountOuterThis.tfmap);
        mountOuterThis.predictPointCount++;
        if (mountOuterThis.predictPointCount > 1) {
          L.polygon([
              [lat_last_point, lng_last_point],
              [lat_point_to_paint, lng_point_to_paint]
            ],
            {
              color: 'white'
            }).addTo(mountOuterThis.tfmap).showMeasurements();
        }
      } else mountOuterThis.predictPointCount = 0;
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
  width: 89.6%;
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

#register {
  position: absolute;
  text-align: center;
  bottom: 0;
}

.dashLines {
  stroke-dasharray: 10;
  stroke: red;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
