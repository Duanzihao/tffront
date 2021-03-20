import axiosInstance from './index'

// var backendUrl = '106.15.170.138' //远程的后端服务器
const backendUrl = 'localhost'; //本地调试的后端服务器

const axios = axiosInstance

export const getBooks = () => {
  return axios.get('http://' + backendUrl + ':8000/api/books/')
}


export const postBook = (bookName, bookAuthor) => {
  return axios.post('http://' + backendUrl + ':8000/api/books/', {'name': bookName, 'author': bookAuthor})
}

export const getTest = () => {
  return axios.get('http://' + backendUrl + ':8000/requesttest/t1').then(
    (response) => {
      console.log(response.data);
    }
  )
}

export const postTest = () => {
  return axios.post('http://' + backendUrl + ':8000/requesttest/typhoon_path_data/', {
    'year': '1949',
    'name': 'Carmen'
  }).then(
    (response) => {
      console.log(response.data);
    }
  )
}

export const postTargetYear = (year) => {
  return axios.post('http://' + backendUrl + ':8000/requesttest/year/', {'year': year}).then(
    (response) => {
      try {
        return response.data;
      } catch (e) {
        window.console.log(e);
      }
    }
  )
}

export const postTargetTyphoonPath = (year, name) => {
  return axios.post('http://' + backendUrl + ':8000/requesttest/typhoon_path_data/', {'year': year, 'name': name}).then(
    (response) => {
      try {
        return response.data;
      } catch (e) {
        window.console.log(e);
      }
    }
  )
}

//获取预测的台风路径信息
export const postTyphoonPredictPint = (pointList) => {
  window.console.log(pointList);
  return axios.post('http://' + backendUrl + ':8000/requesttest/predict/', {'pointList': pointList}).then(
    (response) => {
      try {
        return response.data;
      } catch (e) {
        window.console.log(e);
      }
    }
  )
}

//获取目前最新的台风信息
export const postNewestTyphoonInformation = () => {
  window.console.log();
  return axios.post('http://' + backendUrl + ':8000/requesttest/get_newest_typhoon/').then(
    (response) => {
      try {
        return response.data;
      } catch (e) {
        window.console.log(e);
      }
    }
  )
}
//计算两条台风的DTW矩阵值
export const postCalculateDTW = (formerYear, formerName, latterYear, latterName) => {
  window.console.log();
  return axios.post('http://' + backendUrl + ':8000/requesttest/dtw_cal/', {
    'formerYear': formerYear,
    'formerName': formerName,
    'latterYear': latterYear,
    'latterName': latterName
  }).then(
    (response) => {
      try {
        return response.data;
      } catch (e) {
        window.console.log(e);
      }
    }
  )
}

//寻找出与当前台风最相近的台风，判据为DTW矩阵
export const postFindNearestDTW = (formerYear, formerName) => {
  window.console.log();
  return axios.post('http://' + backendUrl + ':8000/requesttest/find_nearest_dtw/', {
    'formerYear': formerYear,
    'formerName': formerName,
  }).then(
    (response) => {
      try {
        return response.data;
      } catch (e) {
        window.console.log(e);
      }
    }
  )
}


//设置台风颜色
export const setTyphoonColor = (typhoonPower) => {
  let powerColor;
  switch (typhoonPower) {
    case 0:
      powerColor = 'blue';
      break;
    case 1:
      powerColor = 'green';
      break;
    case 2:
      powerColor = 'green';
      break;
    case 3:
      powerColor = 'yellow';
      break;
    case 4:
      powerColor = 'orange';
      break;
    case 5:
      powerColor = 'purple';
      break;
    case 6:
      powerColor = 'red';
      break;
    case 9:
      powerColor = 'black';
      break;
    default:
      powerColor = 'white';
      break;
  }
  return powerColor;
}
