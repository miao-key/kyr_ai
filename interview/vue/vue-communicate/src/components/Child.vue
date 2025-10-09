<template>
    <div>
        <Little />
    </div>
  </template>
  
  <script setup>
  import Little from './Little.vue';
  import { provide } from 'vue';  // 向外提供
  provide('name', '孙悟空');
  </script>
  
  <style scoped>
  
  </style>