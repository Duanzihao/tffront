<template>
  <div class="hello">
    <h1>{{ responseData }}</h1>
    <h1>{{ msg }}</h1>
    <!-- show books list -->
    <ul>
      <li v-for="(book, index) in books" :key="index" style="display:block">
        {{ index }}-{{ book.name }}-{{ book.author }}
      </li>
    </ul>
    <!-- form to add a book -->
    <form action="">
      <label>
        输入书名：
        <input type="text" placeholder="book name" v-model="inputBook.name">
      </label><br>
      <label>
        输入作者：
        <input type="text" placeholder="book author" v-model="inputBook.author">
      </label><br>
    </form>
    <button type="submit" @click="bookSubmit()">submit</button>
    <button type="submit" @click="
const {getTest} = require('../api/api');
getTest()">get测试
    </button>
    <button type="submit" @click="
const {postTest} = require('../api/api');
postTest()">post测试
    </button>
  </div>
</template>

<script>
import {getBooks, postBook} from "../api/api";
import {getTest} from "../api/api"

export default {
  name: 'HelloWorld',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      responseData: '',
      // books list data
      books: [
        {name: 'test', author: 't'},
        {name: 'test2', author: 't2'}
      ],
      // book data in the form
      inputBook: {
        "name": "",
        "author": "",
      }
    }
  },
  methods: {
    loadBooks() {
      getBooks().then(response => {
        this.books = response.data
      })
    }, // load books list when visit the page
    bookSubmit() {
      postBook(this.inputBook.name, this.inputBook.author).then(response => {
        console.log(response)
        this.loadBooks()
      })
    } // add a book to backend when click the button
  },
  created: function () {
    this.loadBooks()
  },
  mounted() {
    this.responseData = getTest();
  }
}
</script>
