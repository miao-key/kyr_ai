// 声明了对象常量
// 内存中开辟了一个空间，里面存放了一个对象
// hxt 取址 & 变量名是地址的标记
// js是弱类型语言 变量的类型由值决定
// = 赋值
// 对象字面量 （字面意义上） JSON
// JS 太灵活，不需要new, 通过{}拿到对象 [] 拿到数组
const hxt = {
  name: '小黄',
  age: 20,
  tall: 187,
  hometown: '北京',
  isSingle: true
}
// js 灵活
const pyc ={
    name: '小彭', // key value String
    age: 21, // Number 数值类型
    hometown: '新余',
    isSingle: true ,// Boolean 布尔类型
    // 送花
    // 形参
    sendFlower: function(girl) {
        console.log(pyc.name + '给' + girl.name + '送了99朵玫瑰')
        girl.receiveFlower(pyc)
      }
}
const xm = {
    name: '小美',
    xq: 30,
    receiveFlower: function(sender) {
        console.log(xm.name + '收到了' + sender.name + '送的99朵玫瑰')
        if (xm.xq > 90){
            console.log('硕果走一波')
        }
        else{
            console.log('gun')
        }
    }
}




//帮彭老板的 小美的闺蜜
const xh ={
    name: '小红',
    room: '488',
    hometown: '新余', //老乡
    // 送小红， 送小美，都具有receiveFlower 方法
    // 对象互换
    // 接口 interface
    receiveFlower: function(sender) {
        //if (sender.name === '小彭') {
          //console.log('彭哥哥，让我们在一起吧')
          //return
    //}
    setTimeout(() => {
        xm.xq = 99;
        xm.receiveFlower(sender)
    }, 3000)
    
 }
}

pyc.sendFlower(xh)
