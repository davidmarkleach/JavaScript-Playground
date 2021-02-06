//Reverse A String

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

	let revString = "";
	str.split("").forEach(function (char) {
		revString = char + revString;
	});

	stringArray = str.split("");
	stringArray.forEach((char) => {
		revString = char + revString;
	});
*/
	return str.split("").reduce((revString, char) => char + revString, "");
}

console.log(reverseString("hello"));

// Challenge 2: Validate a palindrome
// return true if palindrome and flase if not

function isPalindrome(str) {
	/*	let revString = "";
	stringArray = str.split("");
	stringArray.forEach((char) => {
		revString = char + revString;
	});

	console.log(revString);
	return revString == str;
*/
	const revString = str.split("").reverse().join("");
	return revString === str;
}

console.log(isPalindrome("goog"));

// Challenge 3: reverse an integer array
function reverseInt(int) {
	const revString = int.toString().split("").reverse().join("");

	return parseInt(revString) * Math.sign(int);
}

console.log(reverseInt(-12345));

// challenge 4 capitalize letters
// reutrn a string with the first letter of every word capitlalized

function capitalizeLetters(str) {
	// const strArr = str.toLowerCase()

	// 	.split(' ');
	// for (let i = 0; i < strArr.length; i++) {
	// 	strArr[i] = strArr[i].substring(0,1).toUpperCase() + strArr[i].substring(1);
	// }

	// return strArr.join(' ');

	return str
		.toLowerCase()
		.split(" ")
		.map(function (word) {
			return word[0].toUpperCase() + word.substring(1);
		})
		.join(" ");
}

console.log(capitalizeLetters("i love javascript"));
