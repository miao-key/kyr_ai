# 响应式底层原理

- DOM Api -> 响应式业务
- Object.defineProperty(obj,"value",{
    get,
    set
})
    对象上的某个属性的某些行为（get，set）进行定义，在完成本来的职责同时，去做dom 更新，
    这就是响应式
    拦截行为
- 缺点呢？有点
- obj.value
- React ,Vue 现代前端MVVM 架构，早期用Object.defineProperty
    实现响应式
- es6 Proxy