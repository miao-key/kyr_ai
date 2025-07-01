// 业务流水账代码
// 封装
function Button(id){
    this.element = document.querySelector(`#${id}`);
    console.log(this.element);
    this.bindEvent();
}

// Button.prototype.bindEvent = function(){
//     // this 丢失问题  // this Button
//     this.element.addEventListener('click',function() {
//         // => 函数没有this,会使用作用域链中this
//         // this => this.element
//         this.element.style.backgroundColor = 'red';
//     }.bind(this))
// }

Button.prototype.bindEvent = function(){
    // this 丢失问题  // this Button
    this.element.addEventListener('click',this.setBgColor.bind(this))
}

Button.prototype.setBgColor = function(){
    this.element.style.backgroundColor ='#1abc9c';
}