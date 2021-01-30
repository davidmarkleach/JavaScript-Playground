/*
// Playground Code

// This is my first JS code
console.log("Hello world!");
// let name = 'mosh';
// let age = 30;
let person = {
	name: "mosh",
	age: 30,
};

//
let jasonsPeePee = "tiny";
console.log("Jasons Pee Pee = " + jasonsPeePee);

// Dot notation primary
person.name = "John";

// Bracket Notation for when you don't know
// the variable until runtime
person["name"] = "Mary";

let selection = "name";
person[selection] = "Mary";

console.log(person.name);

// Arrays
let selectedColors = ["red", "blue"];
selectedColors[2] = "green";
console.log(selectedColors.length);
console.log(selectedColors[2]);

// Functions
//paramater at time of declaration
// argument at time of execution
// performing a task
function greet(name, lastName) {
	console.log("Hello " + name + " " + lastName);
}

// calculate a value
function square(number) {
	return number * number;
}
greet("John", "smith");
greet("Mary");
let number = square(2);
console.log(number);

function minusSeven(num) {
	return num - 7;
}

console.log("your answer is " + minusSeven(10));

console.log("\n \n \n");

function nextInLine(arr, item) {
	arr.push(item);
	return arr.shift();
}

let testArr = [1, 2, 3, 4, 5];
console.log("before: " + JSON.stringify(testArr) + "\n" + testArr);
console.log(nextInLine(testArr, 6));
console.log("After: " + testArr);
console.log("this is a test commit to 2nd javascript playground");

// TEST COMMENT AT 4:38PM 1/25/21

// First Button Creation! 5:15PM

// 1. Create the button
var button = document.createElement("button");
button.innerHTML = "Click here for secret message";

// 2. Append somewhere
var body = document.getElementsByTagName("body")[0];
body.appendChild(button);

// 3. Add event handler
button.addEventListener("click", function () {
	alert("I love you!");
});


/* Read

https://css-tricks.com/use-button-element/

Test Code
*/

function reverseString(str) {
	/*
	const strArr = str.split("");
	strArr.reverse();
	console.log(strArr);
	return strArr.join('');

	for (let i = str.length - 1; i >= 0; i--) {
		revString = revString + str[i];
	}

	for (let i = 0; i < str.length; i++) {
		revString = str[i] + revString;
	}

	for (let char of str) {
		revString = char + revString;
	}
*/
	let revString = "";
	str.split('').forEach(function (char) {
		revString = char + revString;
	});

	stringArray = str.split('');
	stringArray.forEach(char => {
		revString = char + revString;
	});

	return revString;
}

console.log(reverseString("hello"));
