import {
    from
} from 'rxjs';
// from 将数组转换为Observable对象
const stream = from([1, 2, 3]);
stream.subscribe(v => console.log(v));