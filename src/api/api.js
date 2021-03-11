import axiosInstance from './index'

// var backendUrl = '106.15.170.138' //远程的后端服务器
const backendUrl = 'localhost'; //远程的后端服务器

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
