<template>
  <div>
    {{count}}
    <!-- @ vue 事件绑定 vue 文档特别好 -->
    <EmitChild @myClick="onMyClick"/>
  </div>
</template>

<script setup>
import EmitChild from './EmitChild.vue'
import { ref } from 'vue'

const count = ref(0)

const onMyClick = (msg) => {
  console.log(msg);
  count.value++;
}
</script>

<style scoped>

</style>