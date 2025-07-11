console.log('start');

Promise.resolve().then(() => {
    console.log('promise3');
    setTimeout(() => {
        console.log('timeout3');
    }, 0);
});

setTimeout(() => {
    console.log('timeout1');
    Promise.resolve().then(() => {
        console.log('promise1');
    });
}, 0);

setTimeout(() => {
    console.log('timeout2');
    Promise.resolve().then(() => {
        console.log('promise2');
    });
}, 0);



console.log('end');

// 输出顺序：start -> end -> promise3 -> timeout1 -> promise1 -> timeout2 -> promise2 -> timeout3