//DOM Elements

const time = document.getElementById('time'),
	greeting = document.getElementById('greeting'),
	name = document.getElementById('name'),
	focus = document.getElementById('focus');


// Show Time

function showTime() {
	let today = new Date(),
		hour = today.getHours(),
		min = today.getMinutes(),
		sec = today.getSeconds();
	
	//SET AM or PM
	const amPm = hour >= 12 ? 'PM' : 'AM';

	// 12hr Format
	hour = hour % 12 || 12;

	// Output Time
	time.innerHTML = `${hour}<span>:</span>${addZero(min)}<span>:</span>${addZero(sec)}`;

	setTimeout(showTime, 1000);
};

//Add Zeros

function addZero(n) {
	return (parseInt(n, 10) < 10 ? '0' : '') + n;
};

// Set Background and Greeting
function setBgGreet() {
	let today = new Date(),
		hour = today.getHours();
	
	if (hour < 12) {
		//Morning
		document.body.style.backgroundImage =
			"url('https://img.huffingtonpost.com/asset/5e0f68ec2500003b1998fb2e.jpeg?cache=YqiWjN9UVt&ops=1778_1000')";
		document.body.style.backgroundPosition = "Center";

	} else if (hour < 18) {
		//Afternoon
		document.body.style.backgroundImage =
			"url('https://wallpapercave.com/wp/wp7903231.jpg')";		
		document.body.style.backgroundPosition = "Center";

	} else {
		//Evening
		document.body.style.backgroundImage =
			"url('https://cutewallpaper.org/21/night-sky-wallpaper-4k/Night-sky-stars-and-comet-Wallpaper-4k-Ultra-HD-ID3036.jpg')";
		document.body.style.backgroundPosition = 'Center'
		document.body.style.color = "white";
		greeting.textContent = 'Good Evening';
	}
}


//Run
showTime();
setBgGreet();
