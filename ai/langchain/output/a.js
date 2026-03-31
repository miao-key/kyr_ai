function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayName = function() {
  console.log(`我的名字是${this.name}`);
}

