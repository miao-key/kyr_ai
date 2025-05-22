
const friends = [
  {
    name: '吴老板',
    hometown: '上饶',
    college: '湖南工业大学',
  }
];

// 可以执行的操作
friends.push({name: '谢老板', hometown: '赣州'});

// 不可执行的操作
friends = []; // 错误！TypeError: Assignment to constant variable. 
