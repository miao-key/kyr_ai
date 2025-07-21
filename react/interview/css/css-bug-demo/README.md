# css 模块化
- Button AnotherButton 按钮组件
    自己写的组件
    别人写的组件
    第三方的组件
    冲突 
- 唯一的类名
    取名 烦了
    css 模块化能力
    不会影响外界
    不受外界影响
- stype.model.css模块化
    - react  vite
        确保唯一的hash 值 加到原类名上
    - vue scope
    -可读性受影响不？
        - 读的 是源码，button
        - 被模式化保护起来了
        - npm run builld
- dev/build/test/product
    开发的时候在dev 代码的可读性
    vite,react .jsx babel preser-react,
    style.module.css
    import styles from '.style.module.css'
    styles js 对象 css 的每一个类名都可以面向对象
    访问绑定
    npm run build 
    mpmrun run test 测试一下
    aliyun ngnix 跑起来 dist/