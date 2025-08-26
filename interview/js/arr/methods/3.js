const people = [
    { name: 'John', age: 20 , role: 'user'},
    { name: 'Jane', age: 21 , role: 'admin'},
    { name: 'Jim', age: 22 , role: 'user'},
]
const allAdults = people.every(person => person.age >= 18);
const hasAdmin = people.some(person => person.role === 'admin');


