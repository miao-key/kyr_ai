<template>
    <div>
        {{ msg1 }}<br />
        {{ msg2 }}
    </div>
</template>

<script setup>
defineProps({
    msg1: {
        type: String,
        default: ''
    },
    msg2: {
        type: String,
        default: ''
    }
});
</script>

<style scoped>

</style>