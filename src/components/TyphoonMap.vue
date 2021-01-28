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
                  @change="getYearValue"
                  type="year"
                  placeholder="选择年"
                  style="width: auto"
                  value-format="yyyy"
                >
                </el-date-picker>
              </div>
              <el-menu-item-group>
                <template slot="title">分组一</template>
                <el-menu-item index="1-1">选项1</el-menu-item>
                <el-menu-item index="1-2">选项2</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="分组2">
                <el-menu-item index="1-3">选项3</el-menu-item>
              </el-menu-item-group>
              <el-submenu index="1-4">
                <template slot="title">选项4</template>
                <el-menu-item index="1-4-1">选项4-1</el-menu-item>
              </el-submenu>
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
            <span>台风路径预警系统</span>
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
export default {
  name: "map",
  components: {},
  data() {
    return {
      yearValue: '2021',
      tfmap: null,
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
  methods: {
    //获取当前用户点击的台风的年份
    getYearValue() {
      const selectYear = this.yearValue;
      window.console.log(selectYear);
    }
  },
  // created() {
  //   console.log(this.yearValue);
  // },
  mounted() {
    window.console.log('年份值：' + this.yearValue);
    this.tfmap = this.$utils.map.createMap("map-container");
    // 设施地图视图 中心位置
    this.tfmap.setView([39.92, 116.46], 3);
    // 加载 open street map和mapbox 图层服务
    this.$utils.map.createTileLayer(this.tfmap, this.OSMUrl, this.mapOption);
    window.console.log(this.yearValue);
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
