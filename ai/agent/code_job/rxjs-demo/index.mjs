// 观察者模式是经典的设计模式
import {
    Observable
} from 'rxjs';
// 创建了一个Observable对象
// 参数是一个回调函数，
// subscriber 观察者对象
const stream = new Observable((subscriber) => {
    // next 发送数据
    // complete 完成数据流
    subscriber.next('Hello');
    subscriber.next('World');
    subscriber.complete();
});

// 订阅数据流
stream.subscribe((value) => {
    // 观察者函数
    console.log(value);
});