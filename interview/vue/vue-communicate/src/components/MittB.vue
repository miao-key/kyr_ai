<template>
    <div>
      abc
    </div>
  </template>
  
  <script setup>
  import mitter from '../mitt'
  const someMethod = () => {
    console.log('///////');
  }
  // 订阅者
  mitter.on('handleChange', someMethod);
  </script>
  
  <style scoped>
  
  </style>