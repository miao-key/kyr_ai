<script setup>
import {
  ref,  // 响应式 ref 简单的 reactive 对象  
  onMounted, // 生命周期函数
  onUnmounted
} from 'vue';

const images = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#1a535c'];
const currentIndex = ref(0); // number 
let timer = null;

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % images.length;
}

const prevSlide = () => {
  currentIndex.value = 
    (currentIndex.value - 1 + images.length) % images.length;
}

onMounted(() => {
  timer = setInterval(nextSlide, 3000) 
})

onUnmounted(() => {
  clearInterval(timer);
})

</script>

<template>
<div class="carousel">
  <div class="slides"
    :style="{transform:`translateX(-${currentIndex * 100}%)`}"
  >
    <div
      class="slide"
      v-for="(color, index) in images"
      :key="index"
      :style="{backgroundColor:color}"
    >
      Slide {{index + 1}}
    </div>
  </div>
  <button class="arrow left" @click="prevSlide">
    &lt;
  </button>
  <button class="arrow right" @click="nextSlide">
    &gt;
  </button>
</div>
</template>

<style scoped>
.carousel {
  position: relative;
  width: 400px;
  height: 200px;
  overflow: hidden;
  border-radius: 12px;
}
.slides {
  display: flex;
  transition: transform 0.5s ease;
  width: 100%;
  height: 100%;
}
.slide {
  min-width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  color: #fff;
}
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  border: none;
  cursor: pointer;
  padding: 8px 12px;
  font-size: 20px;
  border-radius: 4px;
}
.arrow:hover {
  background-color: rgba(0, 0, 0, 0.6);
}
.arrow.left {
  left: 10px;
}
.arrow.right {
  right: 10px;
}
</style>