<script setup lang="ts">
// CORS policy 同源策略
// Cross-Origin Resource Sharing policy
async function fetchUser() {
  // 前端知道访问的地址和域名
  // 委托vite 工程化 帮解决下
    const res = await fetch('http://localhost:3000/api/user');
    const data = await res.json();
    console.log(data);
}

fetchUser();
</script>

<template>
    <div>

    </div>
</template>