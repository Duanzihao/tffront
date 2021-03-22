<template>
  <div>
    <div>
      <el-container>
        <!--        头部-->
        <el-header style="
        text-align: center;
        /*text-opacity: 1;*/
        font-size: 50px;
        filter:alpha(Opacity=85);
        -moz-opacity:0.85;
        opacity: 0.95;">
          <!--          <div class="note" :style="note"></div>-->
          <el-dropdown>
            <i class="el-icon-setting" style="margin-right: 0;background-image: url(../assets/logo.png)"></i>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>
                <p style="text-align: center">
                  <a class="a" href="http://cs.hitsz.edu.cn/">关于我们</a>
                </p>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <span style="text-align: center; font-size: 30px;opacity: 1;">台风路径预警系统</span>
        </el-header>

        <!--        中间主要部分的容器-->
        <el-container style="height: 100%;border: 1px solid #eee">
          <!--          侧边菜单-->
          <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
            <el-menu>
              <el-submenu index="1">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  历史台风路径绘制
                </template>
                <div class="block">
                  <el-date-picker
                    v-model="yearValue"
                    :picker-options="pickerOptions"
                    @change="getTyphoonNameFromBack(yearValue,0)"
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
                  <el-button type="primary" style="width: 200px" @click.native="drawTyphoonPath(yearValue,typhoonName)">
                    绘制路径动画
                  </el-button>
                  <el-button type="danger" style="width: 200px;margin: 0" @click.native="clearCircles">清除路径点</el-button>
                </div>
              </el-submenu>

              <el-submenu index="2">
                <template slot="title">
                  <i class="el-icon-menu"></i>模拟台风路径预测
                </template>
                <el-button type="primary" style="width: 200px" @click.native="drawRawPredictTyphoonPath">开始绘图
                </el-button>
                <el-button type="danger" style="width: 200px;margin: 0" @click.native="endDrawPoint">结束绘图</el-button>
                <el-button type="primary" style="width: 200px;margin: 0" @click.native="clearCircles">清除路径点</el-button>
                <el-button type="success" style="width: 200px;margin: 0" @click.native="receiveTyphoonPredictPoint">开始预测
                </el-button>
              </el-submenu>

              <el-submenu index="3">
                <template slot="title"><i class="el-icon-menu"></i>实时台风路径预测</template>
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
                <template slot="title"><i class="el-icon-menu"></i>测距工具</template>
                <el-button type="primary" style="width: 200px" @click.native="calculateDistanceOfTwoPoint">开始绘图
                </el-button>
                <el-button type="danger" style="width: 200px;margin: 0" @click.native="endDrawPoint">结束绘图</el-button>
                <el-button type="primary" style="width: 200px;margin: 0" @click.native="clearCircles">清除路径点</el-button>
              </el-submenu>
            </el-menu>
          </el-aside>

          <el-container>
            <el-main id="mainMapContainer" style="padding: 0">
              <div class="map-tool-measure">
                <ul class="lb_ul">
                  <li class="lb_li">
                    <el-switch
                      v-model="ifDisplayLatLngTip"
                      active-text="显示鼠标点击处经纬度提示窗"
                      inactive-text="">
                    </el-switch>
                  </li>
                  <el-popover placement="bottom"
                              width="auto"
                              trigger="click">
                    <div class="block">
                      <template>
                        <el-tabs>
                          <el-tab-pane label="历史-历史比较" name="first">
                            <li>请选择一条历史台风</li>
                            <el-date-picker
                              v-model="yearValue1"
                              :picker-options="pickerOptions"
                              @change="getTyphoonNameFromBack(yearValue1,1)"
                              type="year"
                              placeholder="选择年"
                              style="width: 250px"
                              value-format="yyyy">
                            </el-date-picker>
                            <el-select v-model="typhoonName1" placeholder="请选择" style="width: 250px">
                              <el-option
                                v-for="item in options1"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                            <el-button type="primary" style="width: auto"
                                       @click.native="drawTyphoonPath(yearValue1,typhoonName1)">绘制路径动画
                            </el-button>

                            <li>请选择另一条历史台风</li>
                            <el-date-picker
                              v-model="yearValue2"
                              :picker-options="pickerOptions"
                              @change="getTyphoonNameFromBack(yearValue2,2)"
                              type="year"
                              placeholder="选择年"
                              style="width: 250px"
                              value-format="yyyy">
                            </el-date-picker>
                            <el-select v-model="typhoonName2" placeholder="请选择" style="width: 250px">
                              <el-option
                                v-for="item in options2"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                            <el-button type="primary" style="width: auto"
                                       @click.native="drawTyphoonPath(yearValue2,typhoonName2)">绘制路径动画
                            </el-button>
                            <li>使用DTW算法计算两条台风的相似程度</li>
                            <el-button type="success" style="width: auto"
                                       @click.native="resultOfDTW(yearValue1,typhoonName1,yearValue2,typhoonName2)">开始计算
                            </el-button>

                          </el-tab-pane>

                          <el-tab-pane label="历史-实时比较" name="second">
                            <li>请选择一条历史台风</li>
                            <el-date-picker
                              v-model="yearValue1"
                              :picker-options="pickerOptions"
                              @change="getTyphoonNameFromBack(yearValue1,1)"
                              type="year"
                              placeholder="选择年"
                              style="width: 250px"
                              value-format="yyyy">
                            </el-date-picker>
                            <el-select v-model="typhoonName1" placeholder="请选择" style="width: 250px">
                              <el-option
                                v-for="item in options1"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                            <el-button type="primary" style="width: auto"
                                       @click.native="drawTyphoonPath(yearValue1,typhoonName1)">绘制路径动画
                            </el-button>
                            <li>请选择目前海面上的台风</li>
                            <el-button type="primary" style="width: auto" @click.native="getNewestTyphoonData">
                              获取最新台风信息
                            </el-button>
                            <el-select v-model="newestTyphoonName" placeholder="请选择">
                              <el-option
                                v-for="item in newestTyphoonList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>


                            <li>使用DTW算法计算两条台风的相似程度</li>
                            <el-button type="success" style="width: auto"
                                       @click.native="resultOfDTW(yearValue1,typhoonName1,yearOfToday,newestTyphoonName)"
                                       :disabled="ifPredict">
                              开始计算
                            </el-button>


                          </el-tab-pane>

                          <el-tab-pane label="寻找历史台风的最相似台风" name="third">
                            <li>请选择一条历史台风</li>
                            <el-date-picker
                              v-model="yearValue1"
                              :picker-options="pickerOptions"
                              @change="getTyphoonNameFromBack(yearValue1,1)"
                              type="year"
                              placeholder="选择年"
                              style="width: 250px"
                              value-format="yyyy">
                            </el-date-picker>
                            <el-select v-model="typhoonName1" placeholder="请选择" style="width: 250px">
                              <el-option
                                v-for="item in options1"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                            <el-button type="primary" style="width: auto"
                                       @click.native="drawTyphoonPath(yearValue1,typhoonName1)">绘制路径动画
                            </el-button>
                            <el-button type="success" style="width: auto"
                                       @click.native="findNearestDTW(yearValue1,typhoonName1)">开始寻找
                            </el-button>

                            <li>寻找历史上最相近台风（判据：DTW矩阵）</li>
                            <el-date-picker
                              v-model="yearValueDTW"
                              :picker-options="pickerOptions"
                              type="year"
                              placeholder="选择年"
                              style="width: 250px"
                              value-format="yyyy">
                            </el-date-picker>
                            <el-select v-model="typhoonNameDTW" placeholder="请选择" style="width: 250px">
                              <el-option
                                v-for="item in optionsDTW"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                            <el-button type="primary" style="width: auto"
                                       @click.native="drawTyphoonPath(yearValueDTW,typhoonNameDTW)">绘制路径动画
                            </el-button>


                          </el-tab-pane>

                          <el-tab-pane label="寻找实时台风的最相似台风" name="fourth">
                            <li>请选择目前海面上的台风</li>
                            <el-button type="primary" style="width: 200px" @click.native="getNewestTyphoonData">
                              获取最新台风信息
                            </el-button>
                            <el-select v-model="newestTyphoonName" placeholder="请选择">
                              <el-option
                                v-for="item in newestTyphoonList"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                            <el-button type="success" style="width: 200px" :disabled="ifPredict"
                                       @click.native="findNearestDTW(yearOfToday,newestTyphoonName)">开始寻找
                            </el-button>

                            <li>寻找历史上最相近台风（判据：DTW矩阵）</li>
                            <el-date-picker
                              v-model="yearValueDTW"
                              :picker-options="pickerOptions"
                              type="year"
                              placeholder="选择年"
                              style="width: 250px"
                              value-format="yyyy">
                            </el-date-picker>
                            <el-select v-model="typhoonNameDTW" placeholder="请选择" style="width: 250px">
                              <el-option
                                v-for="item in optionsDTW"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                              </el-option>
                            </el-select>
                            <el-button type="primary" style="width: auto"
                                       @click.native="drawTyphoonPath(yearValueDTW,typhoonNameDTW)">绘制路径动画
                            </el-button>


                          </el-tab-pane>
                        </el-tabs>
                      </template>
                    </div>
                    <li class="lb_li" slot="reference">台风相似性比较</li>
                  </el-popover>
                  <el-popover>
                    <div class="block">
                      <template>
                        <el-tabs>
                          <el-tab-pane label="来临之前" name="first">
                            台风来前，公众应密切关注媒体的台风报道，仔细检查电路、煤气、太阳能热水器等各项预防措施是否到位。花盆、空调室外机、玻璃窗等都要检查、转移或加固；若玻璃松动或有裂缝，要在玻璃上贴胶条，以免被吹碎、伤人。同时，应准备好手电筒、收音机、食物、饮用水及常用药品等以备急需。
                          </el-tab-pane>
                          <el-tab-pane label="行走注意" name="second">
                            台风来临时千万不要在河、湖、海的路堤或桥上行走。如必须外出，人员应着装醒目，弯腰漫步在较空旷的道路上行走，随时注意高处物品坠落。
                          </el-tab-pane>
                          <el-tab-pane label="避风避雨" name="third">
                            避风避雨时要选择安全地带，千万不要在危旧房、工棚、临时建筑、脚手架、电线杆、树木、广告牌、铁塔等危险地带躲避风雨，防止倾倒压伤或触电。
                          </el-tab-pane>
                          <el-tab-pane label="驾车外出" name="fourth">驾车外出时，应低速行驶或暂时停开，停车要远离楼房、广告牌、枯树等。</el-tab-pane>
                        </el-tabs>
                      </template>
                    </div>
                    <li class="lb_li" slot="reference">台风避险知识</li>
                  </el-popover>
                </ul>
              </div>
              <div class="map-container" id="map-container"></div>
            </el-main>
          </el-container>
        </el-container>
      </el-container>
      <div id="register">
        <p style="text-align: center">
          <a class="a" href="http://beian.miit.gov.cn">粤ICP备2021023332号-1</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {
  postTargetYear,
  postTargetTyphoonPath,
  setTyphoonColor,
  postTyphoonPredictPint,
  postNewestTyphoonInformation, postCalculateDTW, postFindNearestDTW,
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
    LTooltip,
    // MapMeasureDistance
  },
  data() {
    return {
      yearOfToday: '',
      note: {
        backgroundImage: "url(" + require("../assets/typhoon.jpg") + ")",
        backgroundRepeat: "no-repeat",
        backgroundSize: "25px auto",
        marginTop: "5px",
      },
      url: '',
      ifDisplayLatLngTip: false,
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
      newestTyphoonName: '',
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
      // url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '哈尔滨工业大学（深圳）计算机学院企业智能实验室气象组',
      mapOptions: {
        zoomSnap: 0.5
      },
      typhoonName: '',// 台风名字
      typhoonName1: '',// 台风名字
      typhoonName2: '',// 台风名字
      typhoonNameDTW: '',
      yearValue: '',// 台风值
      yearValue1: '',// 台风值
      yearValue2: '',// 台风值
      yearValueDTW: '',
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
      options1: [],
      options2: [],
      optionsDTW: []
    }
  },
  methods: {

    //得到当前用户输入年份对应的台风名称
    getTyphoonNameFromBack(yearValue, optionChoose) {
      let targetYear = yearValue;
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

        switch (optionChoose) {
          case 0:
            this.options = result;
            break;
          case 1:
            this.options1 = result;
            break;
          case 2:
            this.options2 = result;
            break;
          default:
            break;
        }
      })
    },

    // 点击画图按钮，绘制台风路径曲线
    drawTyphoonPath(yearValue, typhoonName) {
      // 这里的指针一定要变换，因为地图是由vue的this指向的，
      // 所以后面的指向地图的指针也得是vue的this
      // 但是到了这些函数里面，
      // this就变成了这些函数自己的this，
      // 所以要在下面先声明一个outerThis备份好外面的this
      // 之后在指向地图的地方使用这个outerThis即可
      let outerThis = this;
      postTargetTyphoonPath(yearValue, typhoonName).then(_data => {
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
    },

    //计算出自选的两条台风的的DTW值，并给出弹窗的提示
    resultOfDTW(formerYear, formerName, latterYear, latterName) {
      let outerThis = this;
      postCalculateDTW(formerYear, formerName, latterYear, latterName).then(_data => {
        this.$alert('DTW矩阵计算出的值为' + _data.dtw_result, '计算结果', {
          confirmButtonText: '确定'
        });
      }, outerThis);
    },

    //用于寻找与当前台风的历史最相近的台风的DTW值，并给出弹窗的提示
    findNearestDTW(formerYear, formerName) {
      let outerThis = this;
      this.$alert('计算时间较长，请耐心等待，您可以先使用别的功能我们会弹窗通知您', '提示', {
        confirmButtonText: '确定'
      });
      postFindNearestDTW(formerYear, formerName).then(_data => {
        window.console.log(_data);
        this.$alert('DTW矩阵计算出的值为' + _data.DTW_value, '计算结果', {
          confirmButtonText: '确定'
        });
        outerThis.typhoonNameDTW = _data.nearest_name;
        outerThis.yearValueDTW = _data.nearest_year;
      }, outerThis);
    }
  },
  mounted() {
    /***
     * 经度：lng
     * 纬度：lat
     */
    let timeTmp = new Date();
    this.yearOfToday = timeTmp.getFullYear();
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
      if (mountOuterThis.ifDisplayLatLngTip === true) {
        positionPopup.setLatLng(e.latlng)
          .setContent(
            "<br>你点击在地图的位置为： </br>"
            + '<br>纬度：' + e.latlng.lat.toString() + '</br>'
            + '经度：' + e.latlng.lng.toString()
          ).openOn(mountOuterThis.tfmap);
      }


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

.map-tool-measure {
  position: absolute;
  right: 15px;
  top: 80px;
  z-index: 999;

  height: 36px;
  box-shadow: 0px 0px 50px 2px rgba(0, 0, 0, 0.35);
  background-color: #fff;
}

.lb_ul {
  display: flex;
  padding: 0;
  margin: 0;
  list-style: none;
}

.lb_li {
  padding: 0 15px;
  height: 36px;
  font-size: 13px;
  line-height: 36px;
  cursor: pointer;
}

.lb_li:hover {
  background-color: rgb(212, 224, 246);
}

.a {
  text-decoration: none;
}
</style>
