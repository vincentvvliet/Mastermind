var main = function () {
	"use strict";

	// START SCRIPT FOR TIMER
	var secs = 0;

// change value of function
	var changeValue = function () {
  		document.getElementById("time-passed").innerHTML = ++value;
	}

	var timerInterval = null;
	var value;

// function to start time
	var start = function () {
	  stop(); // stop the previous counting (if any)
	  value = 0;
	  timerInterval = setInterval(changeValue, 1000);  
	};

// function to stop time
	var stop = function () {
  		clearInterval(timerInterval);
	};

// start function when clicked
	$("#time-passed").on("click", function () {
		start();
	});

	// END SCRIPT FOR TIMER

	$(".empty").on("click", function () {
		if ($('.peg').hasClass('empty')) {
			$('.peg').removeClass('empty');
			$('.peg').addClass('red');
		}
	});

// !! implement a function to create HTML elements for game rows to make code more readable !!

// idea's 
	var rows = 10;
	// number of rows in total
	var guess = 0;
	// number of guesses -> needed for stats
	var correct; 
	// after a guess, check how many colours from the guess correspond --> update correct
	var colours = ['red', 'blue', 'green', 'yellow', 'pink', 'orange']; // 5 or 6 different colours
	// when clicking on a colour selector, selects a colour from this array
};

$(document).ready(main);	
