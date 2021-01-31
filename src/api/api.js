import axiosInstance from './index'

const axios = axiosInstance

export const getBooks = () => {
  return axios.get('http://localhost:8000/api/books/')
}


export const postBook = (bookName, bookAuthor) => {
  return axios.post('http://localhost:8000/api/books/', {'name': bookName, 'author': bookAuthor})
}

export const getTest = () => {
  return axios.get('http://localhost:8000/requesttest/t1').then(
    (response) => {
      console.log(response.data);
    }
  )
}

export const postTest = () => {
  return axios.post('http://localhost:8000/requesttest/typhoon_path_data/', {'year': '1949', 'name': 'Carmen'}).then(
    (response) => {
      console.log(response.data);
    }
  )
}

export const postTargetYear = (year) => {
  return axios.post('http://localhost:8000/requesttest/year/', {'year': year}).then(
    (response) => {
      try {
        return response.data;
      } catch (e) {
        window.console.log(e);
      }
    }
  )
}
