let globalVar = 'global';

function outer() {
  let outerVar = 'outer';
  
  function inner() {
    let innerVar = 'inner';
    console.log(globalVar, outerVar, innerVar); // 可以访问所有变量
  }
  
  inner();
}

outer();