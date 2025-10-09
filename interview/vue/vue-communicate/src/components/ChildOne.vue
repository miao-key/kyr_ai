<template>
    <div>
        {{ msg1 }}<br />
        {{ msg2 }}
    </div>
</template>
<script>
// 类式写法
// data 自由数据状态
export default {
    // 父传过来的参数
    props: ['msg1', 'msg2']
}
</script>

<style scoped>

</style>