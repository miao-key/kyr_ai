let arr1 = [
    {
        name: '张三',
        hobbies: ['篮球','足球','乒乓球'],
    },
    function(){
        console.log('函数拷贝不了');
    }
]

let arr2 = JSON.parse(JSON.stringify(arr1));
arr2[0].name = "张三(深拷贝)"
arr2[0].hobbies.push('羽毛球');
console.log(arr1);
console.log(arr2);