<template>
  <div>
    <div>
      <el-container style="height: 100%;border: 1px solid #eee">
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
          <el-menu>
            <el-submenu index="1">
              <template slot="title">
                <i class="el-icon-message"></i>
                台风路径选择
              </template>
              <div class="block">
                <el-date-picker
                  v-model="yearValue"
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
              </div>
            </el-submenu>
            <el-submenu index="2">
              <template slot="title"><i class="el-icon-menu"></i>台风路径绘制</template>
              <el-menu-item-group>
                <template slot="title">分组一</template>
                <el-menu-item index="2-1">选项1</el-menu-item>
                <el-menu-item index="2-2">选项2</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="分组2">
                <el-menu-item index="2-3">选项3</el-menu-item>
              </el-menu-item-group>
              <el-submenu index="2-4">
                <template slot="title">选项4</template>
                <el-menu-item index="2-4-1">选项4-1</el-menu-item>
              </el-submenu>
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
        let pointCount = 0;
        let painter = setInterval(function () {
          // console.log('标点计数:' + pointCount);
          if (pointCount === myTyphoonPath.length) {
            console.log('计时器关闭');
            clearInterval(painter);
          }
          let powerColor = setTyphoonColor(myTyphoonPath[pointCount].power);
          let circle = L.circle([myTyphoonPath[pointCount].lat, myTyphoonPath[pointCount].lng], 30000, {
            color: powerColor,
            fillColor: powerColor,
            fillOpacity: 0.5,
            radius: 500
          }).addTo(outerThis.tfmap).on("click", function (e) {
            var clickedCircle = e.target;
            clickedCircle.bindPopup(
              "台风的信息:" + '<br>' +
              "<br>位置：" + e.latlng + "</br>" +
              "<br>时间：" + this.time + "</br>" +
              "<br>强度：" + this.power + "</br>"
            ).openPopup();
          }, myTyphoonPath[pointCount]);
          //向地图中画线
          if (pointCount !== 0) {
            const polygon = L.polygon([
                [myTyphoonPath[pointCount].lat, myTyphoonPath[pointCount].lng],
                [myTyphoonPath[pointCount - 1].lat, myTyphoonPath[pointCount - 1].lng]
              ],
              {
                color: 'black'
              }).addTo(outerThis.tfmap);
          }
          pointCount++;
        }, 300);
      })
    },

    // 显示任意位置的经纬度
    latAndLonTip() {
      let positionPopup = L.popup();
      this.tfmap.on('click', function (e) {
        positionPopup.setLatLng(e.latlng)
          .setContent("你点击在了地图的 " + e.latlng.toString())
          .openOn(this.tfmap);
      });
    }
  },
  mounted() {
    /***
     * 经度：lng
     * 纬度：lat
     */

    this.tfmap = L.map('map-container').setView([39.92, 116.46], 3);
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: 'pk.eyJ1IjoiZHVhbnppaGFvIiwiYSI6ImNranZkNDZwNjA3dTIycG9hbjR6dGh5c3UifQ.ROEqcBmPSbuqfBW6AQZrYg'
    }).addTo(this.tfmap);

    //以下是完全开源不付费的地图，如果看上面的不顺眼，可以使用下面的地图
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //   attribution: '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
    //   id: 'mapbox/streets-v11',
    //   tileSize: 512,
    //   zoomOffset: -1,
    // }).addTo(this.tfmap);

    // 点击任意点，显示经纬度信息
    this.tfmap.on('click', function (e) {
      let positionPopup = L.popup();
      positionPopup.setLatLng(e.latlng)
        .setContent(
          "<br>你点击在地图的位置为： </br>"
          + '<br>纬度：' + e.latlng.lat.toString() + '</br>'
          + '经度：' + e.latlng.lng.toString()
        )
        .openOn(this.tfmap);
      // 下面这个位置一定要传一个this指针进去，要不然会报错
    }, this);
  }
}
;
</script>
<style scoped>
.map-container {
  box-sizing: border-box;
  padding: 0;
  position: absolute;
  width: 84.3%;
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
</style>
