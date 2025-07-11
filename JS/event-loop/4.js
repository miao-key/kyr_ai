console.log('同步Start');
const promise1 =Promise.resolve('Frist Promise');
const promise2 =Promise.resolve('Second Promise');
const promise3 =new Promise(resolve => {
    console.log('Promise3');
    resolve('Third Promise')
})
promise1.then(res => {
    console.log(res);
})
promise2.then(res => {
    console.log(res);
})
promise3.then(res => {
    console.log(res);
})
setTimeout(() =>{
    console.log('六百六十六');
    const p4 =Promise.resolve('Promise4');
    p4.then(res => {
        console.log(res);
    })
})
setTimeout(() =>{
    console.log('演都不演了');
})

console.log('同步end');