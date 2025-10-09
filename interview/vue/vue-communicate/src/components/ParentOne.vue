<template>
    <div>
      ParentOne
      <ChildOne :msg1="msg1" :msg2="msg2" />
    </div>
  </template>
  <script>
  import ChildOne from './ChildOne.vue';
  import { ref } from 'vue';
  // vue2 时代 类组件写法
  // 借鉴 react 函数式 现在？
  export default {
    // 数据部分
    data() {
      return {
        msg1: '只是给子组件的信息1'
      }
    },
    // 返回的部分 template也直接调用
    setup() {
      const msg2 = ref("给子组件的信息2");
      return {
        msg2
      }
    },
    components: {
      ChildOne
    }
  }
  </script>