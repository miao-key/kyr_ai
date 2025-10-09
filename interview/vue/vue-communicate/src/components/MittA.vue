<template>
    <div>
      <button @click="handleClick">点击我</button>
    </div>
  </template>
  
  <script setup>
  import mitter from '../mitt.js'
  
  const handleClick = () => {
    // 发布者
    mitter.emit('handleChange');
  }
  </script>
  
  <style  scoped>
  
  </style>