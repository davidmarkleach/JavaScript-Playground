
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
*/
	let revString = "";
	str.split("").forEach(function (char) {
		revString = char + revString;
	});

	stringArray = str.split("");
	stringArray.forEach((char) => {
		revString = char + revString;
	});

	return revString;
}

console.log(reverseString("hello"));
