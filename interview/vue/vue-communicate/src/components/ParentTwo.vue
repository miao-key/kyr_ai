<template>
    <div>
        <ChildTwo :msg1="msg1" :msg2="msg2" />
    </div>
</template>

<script setup>
import ChildTwo from './ChildTwo.vue';
import {
    ref
} from 'vue';
const msg1 = ref('这是给子组件的信息1');
const msg2 = ref('这是给子组件的信息2');
</script>
<style scoped>
</style>