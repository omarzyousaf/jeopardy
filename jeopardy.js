document.addEventListener("DOMContentLoaded", () => {

	//====================================================
	/*
	ISSUES
	1) I always had to push my data into an array outside of the function instead of utilizing
	the promise function and using "return". When I tried the "return" method, every time I
	called the function inside of another function, I was unable to retrieve the data! Is this a situation where I need to use .then()?

	2) When I hit New Board, it clears the board. I am unable to run all the functions at once to get a new game started
	so I split the functions up and left a few in "Start Game". Still, after hitting New Board - the answers show up before the questions.
	Most importantly: the fillTable() function won't run when put along with the other functions. Why is this? This is the main reason
	I used different buttons for START GAME and NEW BOARD.

	3) I could not 
	*/
	//===================
	//ISSUES:

	//1) Pick RANDOM questions from the list. 
	//2) FIX THE RESTART BUTTON!!!
	//====================================================





	// categories is the main data structure for the app; it looks like this:
	//  [
	//    { title: "Math",
	//      clues: [
	//        {question: "2+2", answer: 4, showing: null},
	//        {question: "1+1", answer: 2, showing: null}
	//        ...
	//      ],
	//    },
	//    { title: "Literature",
	//      clues: [
	//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
	//        {question: "Bell Jar Author", answer: "Plath", showing: null},
	//        ...
	//      ],
	//    },
	//    ...
	//  ]

	let categories = [];
	let categoryInfo = [];
	let NUM_CATEGORIES = 6
	let catValues = ['100', '200', '300', '400', '500']
	let fade = 1000

	/** Get NUM_CATEGORIES random category from API.
	 *
	 * Returns array of category ids
	 */
	async function getCategoryIds() {
		let res = await axios.get('http://jservice.io/api/categories', {
			params: {
				count: NUM_CATEGORIES,
				//offsets the starting ID, therefore, randomizes IDs everytime.
				offset: Math.floor(Math.random() * 1000)
			}
		});

		let categoryArr = res.data;

		for (let cat of categoryArr) {
			categories.push(cat.id);
		}

		// console.log(categoryArr.map((cat) => cat.id));
		// return categoryArr.map((cat) => cat.id);
	}

	/** Return object with data about a category:
	 *
	 *  Returns { title: "Math", clues: clue-array }
	 *
	 * Where clue-array is:
	 *   [
	 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
	 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
	 *      ...
	 *   ]
	 */
	function getCategory(categories) {
		let arr = categories.map(async function (catId) {
			let res = await axios.get('http://jservice.io/api/category', {
				params: {
					id: catId
				}
			});

			/*instead of using the map functionality below, I had to push the values to a globally scoped array.
				let answer = { //return
					//stored this as a variable and "pushed" into the empty array instead of using "return"
					title : res.data.title,
					clues : res.data.clues.map((clue) => {
						return {
							question : clue.question,
							answer   : clue.answer,
							showing  : null
						};
					})
				};
			*/

			let clueArray = [];

			for (let clue of res.data.clues) {
				let obj = {
					question: clue.question,
					answer: clue.answer,
					showing: null
				};
				clueArray.push(obj);
			}

			let answer = {
				title: res.data.title,
				clueArray: clueArray
			};
			categoryInfo.push(answer);
			return arr;
		});

	}

	/** Fill the HTML table#jeopardy with the categories & cells for questions.
	 *
	 * - The <thead> should be filled w/a <tr>, and a <td> for each category
	 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
	 *   each with a question for each category in a <td>
	 *   (initally, just show a "?" where the question/answer would go.)
	 */
	function fillTable(catArray) {
		// let catArr = await getCategoryIds()
		$('thead').append('<tr id="head">');
		for (let info of catArray) {
			let newTd = document.createElement('td');
			newTd.innerHTML = `${info.title}`;
			newTd.style.fontSize = "1.5em"
			$('#head').append(newTd)
		}
		$('thead').append('</tr>');


		//loop over the category arrays, create a new row in between each loop
		for (let i = 0; i <= 4; i++) {
			let newTr = document.createElement('tr');
			$('tbody').append(newTr);
			catArray.map(function (cat) {
				let newTd = document.createElement("TD");
				//add numbers to each td instead of "?"
				newTd.innerText = `${i+1}00`;
				newTd.id = `td-${i}`;
				newTd.style.color = "yellow"
				newTd.style.fontSize = "2em"
				newTr.append(newTd)
			})
		}

	}

	/** Handle clicking on a clue: show the question or answer.
	 * Uses .showing property on clue to determine what to show:
	 * - if currently null, show question & set .showing to "question"
	 * - if currently "question", show answer & set .showing to "answer"
	 * - if currently "answer", ignore click
	 * */

	function handleClick() {
		$('tbody').on('click', 'td', function (e) {
			//use the Column # as a reference to which category the TD belongs to
			$(this).hide().fadeIn(150)

			let target = e.target
			let columnCat = target.cellIndex
			let clue = categoryInfo[columnCat].clueArray
			console.log(e)
			console.log(clue)
			console.log(categoryInfo)
			//use loop to get the column number		
			for (let i = 0; i <= 4; i++) {
				let randomClueIdx = Math.floor(Math.random() * clue.length + 1)

				//TESTING CODE FOR ACTIVE AND HIDDEN DISPLAY OF Q&A
				// let question = document.createElement('div')
				// question.innerText = clue[randomClueIdx].question
				// question.style.color = "white"
				// // question.style.fontSize = "1.5em"
				// question.display = 'block'
				// target.append(question)

				// let answer = document.createElement('div')
				// answer.innerTet = clue[randomClueIdx].answer
				// answer.display = 'none'
				// target.append(answer)

				// if (question.display === 'block') {
				// 	answer.display = 'block'
				// 	question.display = 'none'
				// }


				//If the selected TD is included in catValues
				if (catValues.includes(target.innerText)) {

					//if column # matches selected TD, turn selecter TD into corresponding QUESTION
					if (target.id == `td-${i}`) {

						target.innerText = clue[i].question
						target.style.color = "white"
						target.style.fontSize = "1.5em"
					}
				} else {
					//If the column # matches the targete column #, turn selected TD into ANSWER
					if (target.id === `td-${i}`) target.innerText = clue[i].answer
				}

			}
		})
	}

	// }
	/** Start game:
	 * - get random category Ids
	 * - get data for each category
	 * - create HTML table
	 * */
	async function setupAndStart() {
		await getCategoryIds();
		getCategory(categories);
		// fillTable(categoryInfo); <---could not get this to work here, had to implement a START button below.
	}


	// START BUTTON to start game
	$('#start').on('click', function (e) {
		fillTable(categoryInfo);
		handleClick()

		//disables the START button
		$(this).prop('disabled', true);
		$('#restart').prop('disabled', false);

		//scrolls the page down to put the Table in full frame
		$('html, body').animate({
			scrollTop: $("table").offset().top
		}, fade);


	}).hide().fadeIn(fade)

	/** On click of restart button, restart game. */
	//   Had to reload the page in order to get it to work. 
	//   When I cleared the text and restarted the functions, I noticed that clicking
	//   on the "?" resulted in seeing the ANSWER without being able to see the QUESTION :(



	/** On page load, setup and start & add event handler for clicking clues */

	//   was unable to get the fillTable function working on page Load as well, implemented a START button instead.	
	$('document').ready(function (e) {
		console.log('dom loaded')
		setupAndStart();
		$('#textHeader').hide().fadeIn(fade)
		$('#restart').prop('disabled', true);

	})




	//==================================
	// EXTRA FEATURES NOT IN ASSIGNMENT
	//==================================

	//RESTART GAME BUTTON: clears boxes that were flipped over.
	$('#restart').on('click', function (e) {
		$('thead').text('')
		$('tbody').text('')
		fillTable(categoryInfo)
	}).hide().fadeIn(fade)


	//NEW BOARD BUTTON: pop-up box to confirm if you want to refresh the page
	$('#newBoard').on('click', function (e) {
		Swal.fire({
			title: 'Are you sure you want a New Board?',
			text: "This will refresh the page!",
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: 'green',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Yes, I NEED new categories!'
		}).then((result) => {
			if (result.value) {
				location.reload()
			}
		})

		/*instead of implementing the code below, I am refreshing the page. I could not avoid refreshing the page
		  and simply having fillTable() run. This is the main issue I am having.
		
			$('thead').text('');
			$('tbody').text('');
			categories = [];
			categoryInfo = [];
			setupAndStart();
			$('#start').prop('disabled', false);
			$('#restart').prop('disabled', true);
			fillTable() won't work, can't run at the same time?
			fillTable(categoryInfo);
		*/
	}).hide().fadeIn(fade)


	//Toggle for Light or Dark Mode: changes color of header and table.
	$(".modeBtn").click(function () {
		$(this).text(function (i, v) {
			if (v === 'Light Mode') {
				$(this).removeClass('btn-light').addClass('btn-dark')
				$('#jeopardy').removeClass('table-dark').addClass('jeopardy');
				$('#jumbo').css({
					"background-color": "rgb(179, 215, 242)",
					"color": 'black'
				})
				return 'Dark Mode'
			} else {
				$(this).removeClass('btn-dark').addClass('btn-light')
				$('#jeopardy').removeClass('jeopardy').addClass('table-dark');
				$('#jumbo').css({
					"background-color": "black",
					"color": 'white'
				})
				return 'Light Mode'
			}
		})
	}).hide().fadeIn(fade)
})