// Helper function to add an event listener
// Why this exists: IE 5-8 used a different event model than other browsers
// Thanks IE
// Parameters:
// el is a DOM node representing the element that the event listener will attach to
// event is the type of event being listened for
// callback is the function when the event is triggered
function addEvent(el, event, callback){
	// Check if addEventListener works
	if ('addEventListener' in el){
		el.addEventListener(event, callback, false);
	} else {
		// Make callback a method of el
		el['e' + event + callback] = callback;
		// Add a second method
		el[event + callback] = function() {
			// Use the second method to call previous function
			el['e' + event + callback](window.event);
		};
		// Call the second function which will call the first function
		el.attachEvent('on' + event, el[event + callback]);
	}
}

(function(){

	var alphabet, personalNumStruct;
	var form = document.getElementById('julesForm');
	var submit = document.getElementById('submit');
	var bdayResult = document.getElementById('bdayResult');
	var nameResult = document.getElementById('nameResult');
	// Array that holds special dual numbers in numerology
	var masterNumArray = [11,22,33,44];

	function request(returnObj, url){
		var xhr = new XMLHttpRequest();
		xhr.onload = function(){
			if(xhr.status === 200){
				returnObj = JSON.parse(xhr.responseText);
				console.log(returnObj);
			}
		}
		xhr.open('GET', url, true);
		xhr.send(null);
	}

	function insertPersonalNum(personalNumArray){
		// Construct DocumentFragment for minimal DOM manipulation
		var fragment = document.createDocumentFragment();
		for(var i=0;i<personalNumArray.length;i++){
			var el = document.createElement('li');
			// If value is a master number, then we do not reduce it
			if ( masterNumArray.indexOf(personalNumArray[i].value) > -1 ) {
				el.innerText = personalNumArray[i].name + ' Number is: ' + personalNumArray[i].value;
			} else {
				el.innerText = personalNumArray[i].name + ' Number is: ' + personalNumArray[i].value + '/' + reduceNum(personalNumArray[i].value);
			}
			fragment.appendChild(el);
		}
		// Append the DocumentFragment to the result div's ul element
		var bdayList = bdayResult.getElementsByTagName('ul')[0];
		bdayList.appendChild(fragment);
	}

	function check(bday, fullName){
		
		// Start with: '10/11/1994'

		var bdayArray = bday.split('/');
		// Now: bdayArray == ['10','11','1994']
		var yearArray = bdayArray[2].split('');
		// Now: yearArray == ['1','9','9','4']
		var yearSum = 0;
		for(var i=0; i<yearArray.length; i++){
			yearSum += +yearArray[i];
		}
		// Now: yearSum == 23

		var lifeLessonNum = +bdayArray[0] + +bdayArray[1] + yearSum;
		// Now: lifeLessonNum == ( 10 + 11 + 23) == 44

		var nameArray = fullName.toLowerCase().replace(/ /g, '').split('');
		// Now: nameArray = ["j", "u", "l", "e", "s", "d", "i", "c", "k", "s", "o", "n", "m", "a", "p", "p", "u", "s"]
		var vowelSum, consonantSum, nameSum;
		vowelSum = consonantSum = nameSum = 0;

		console.log(alphabet);

		for(var i=0;i<nameArray.length;i++){
			console.log(alphabet);
			console.log(nameArray[i]);
			if (alphabet[nameArray[i]].vowel){
				vowelSum += alphabet[nameArray[i]].small;
			} else {
				consonantSum += alphabet[nameArray[i]].small;
			}
		}
		// Now: vowelSum == 27, consonantSum == 39
		nameSum = vowelSum + consonantSum;
		// Now: nameSum == ( 27 + 39 ) == 66

		function personalNumObj(name, value, details){
			this.name = name;
			this.value = value;
			this.details = details;
		}

		var llObj = new personalNumObj('Life Lesson', lifeLessonNum, '');
		var snObj = new personalNumObj('Soul', vowelSum, '');
		var opObj = new personalNumObj('Outer Personality', consonantSum, '');
		var pdObj = new personalNumObj('Path of Destiny', nameSum, '');
		var personalNumArray = [];
		personalNumArray.push(llObj, snObj, opObj, pdObj);
		// Now: personalNumArray == [{"name":"Life Lesson","value":44,"details":""},{"name":"Soul","value":27,"details":""},{"name":"Outer Personality","value":39,"details":""},{"name":"Path of Destiny","value":66,"details":""}]

		insertPersonalNum(personalNumArray);


		

		nameResult.textContent = 'Full name is: ' + fullName;
	};

	function reduceNum(num){
		// If our number is special, return it
		if (masterNumArray.indexOf(num) > -1 ){
			return num;
		}

		// Combine the integers in our number
		var numArray = (''+num).split('');
		var result = 0;
		for(var i=0;i<numArray.length;i++){
			result += parseInt(numArray[i]);
		}

		// If combined number is special, return it
		if (masterNumArray.indexOf(result) > -1){
			return result;
		} 
		// Else if combined number contains more than one integer, recursively call reduceNum
		else if (result > 9){
			return reduceNum(result);
		}
		// If combined number has only one integer, return it
		return result;
	}

	request(alphabet, '/data/letters.json');
	request(personalNumStruct, '/data/personalNum.json');

	addEvent(form, 'submit', function(e) {
		e.preventDefault();
		var elements = this.elements;
		var bday = elements.bday.value;
		var fullName = elements.fullName.value;
		check(bday, fullName);
	})



}());