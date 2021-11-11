const sectionStart = document.getElementById("section_start");
const bodyTag = document.querySelector("body");
const h1 = document.createElement("h1");
h1.innerHTML = "Hallowween-o-rama Quiz!"
sectionStart.append(h1);
const startButton = document.createElement("button");

function createForm() {
	let label = document.createElement("label");
	let form = document.createElement("form");
	let input = document.createElement("input");

	//DONE Add label
	
	label.innerHTML = "Add your name:";
	label.htmlFor = "userNameInput";
	form.id = "inputForm";

	input.type = "text";
	input.placeholder = "First name";
	input.id = "userNameInput";
	input.name = "userNameInput";

	startButton.innerHTML = "Start the quiz";
	startButton.type = "submit";
	startButton.id = "startButton";

	
	form.append(label);
	form.append(input);
	form.append(startButton);
	sectionStart.appendChild(form);
}

function createBtn(btnText, btnClass, btnSectionId) {
	let button = document.createElement("button");
	button.innerHTML = btnText;
  button.className = btnClass;
  
	return button;
}

function createDiv(id, className, appendPlace) {
	let div = document.createElement("div");
	div.id = id;
	div.className = className;
	appendPlace.append(div);

	return div;
}

createForm();

// export { startButton };
import { sendNameToFirebase } from "./firebase.js";
startButton.addEventListener("click", sendNameToFirebase);

function createSection(id) {
	let section = document.createElement("section");
	section.id = id;
	bodyTag.append(section);

	return section;
}

const answerCategory = ["a", "b", "c", "d"];

//Section is an object
function createContent(section, section_id, QnA) {
	//Questions
	let question = document.createElement("label");
	question.innerHTML = QnA.question;
	section.append(question);

	//Div BtnWrapper
	let div = createDiv(section.id + "Div", "answer_wrapper", section);

	div.addEventListener("click", function (event) {
		if (event.target.tagName === "BUTTON") {
			console.log("class is", event.target.classList[0]);
			const userAnswer = event.target.classList[0];
			console.log(userAnswer);
			recordUserAnswerToArray(userAnswer);
			window.location.href = "#section" + (section_id + 1).toString();
			console.log("#section" + (section_id + 1).toString())
		}
	});

	// Buttons
	for (let i = 0; i < QnA.answers.length; i++) {
		let button = createBtn(	QnA.answers[i],`${answerCategory[i]} answers`, section.id);
		div.append(button);
	}
}

async function getQuestions() {
	try {
		let fetchQuestions = await fetch("questions.json");
		//QuestionsJs
		let questionsAsJson = await fetchQuestions.json();

		for (let i = 1; i <= Object.keys(questionsAsJson).length; i++) {
			let section = createSection("section" + i.toString());

			//CONTENT
			createContent(section, i, questionsAsJson[i]);
		}
		createSubmitResultsSection();
	} catch (error) {
		console.log("error", error);
	}
}
getQuestions();

let arrayOfUserAnswers = [0, 0, 0, 0];

function recordUserAnswerToArray(userAnswer) {
	if (userAnswer === "a") {
		arrayOfUserAnswers[0]++;
		console.log(arrayOfUserAnswers);
	} else if (userAnswer === "b") {
		arrayOfUserAnswers[1]++;
		console.log(arrayOfUserAnswers);
	} else if (userAnswer === "c") {
		arrayOfUserAnswers[2]++;
		console.log(arrayOfUserAnswers);
	} else if (userAnswer === "d") {
		arrayOfUserAnswers[3]++;
		console.log(arrayOfUserAnswers);
	}
}

let resultCategory = "";

// returns a letter
function getCategory() {
	let categoriesIndex = [];
	let maxPoints = Math.max(...arrayOfUserAnswers);

	for (let i = 0; i < arrayOfUserAnswers.length; i++) {
		if (arrayOfUserAnswers[i] == maxPoints) {
			categoriesIndex.push(i);
		}
	}
	let randomIndex =
		categoriesIndex[Math.floor(Math.random() * categoriesIndex.length)];
	let letter = answerCategory[randomIndex];
	return (resultCategory = letter);
}

import { sendResultToFirebase } from "./firebase.js";

//Submit results page
function createSubmitResultsSection() {
	let section = createSection("section9");

	//Div
	let div = createDiv("section9Div", "sectionSubmit", section);
	section.append(div);

	//btn "submit"
	let resultbutton = createBtn(
		"Show me the results!",
		"resultbutton",
		"resultbutton"
	);

	div.append(resultbutton);

	//calculate results when btn is clicked
	resultbutton.addEventListener("click",  waitForResultSection);
}


// TODO finish this function, find a way to access keys from json to compare
const movieObject = async () => {
	try {
		getCategory();
		let fetchMovies = await fetch("movie.json");
		let moviesAsJs = await fetchMovies.json();

		let movies = moviesAsJs[resultCategory];
		let arrayOfMovieTitles = Object.keys(movies);

		const randomMovie =
			arrayOfMovieTitles[Math.floor(Math.random() * arrayOfMovieTitles.length)];
		const randomMoviePoster = movies[randomMovie]["poster"];
		const randomMovieYear = movies[randomMovie]["year"];

		return {
			movieName: randomMovie,
			moviePoster: randomMoviePoster,
			movieYear: randomMovieYear,
		};
	} catch (error) {
		console.log("error", error);
	}
};

//Last page
async function createResultSection() {
	let section = createSection("section10");
  let movie = await movieObject();
  
  //SEND TO FIREBASE
	sendResultToFirebase(movie);
	console.log("movie is", movie);
	console.log("movie name is", movie.movieName);
	//Div
	let containerDiv = createDiv("section10-wrapper", "sectionResults", section);
	let posterDiv = createDiv("posterDiv", "sectionResults", containerDiv);
	let infoDiv = createDiv("movieDiv", "sectionResults", containerDiv);

	let heading = document.createElement("h2");
  heading.innerHTML = "You should watch this movie:";
  
	posterDiv.innerHTML = `<img src="${movie.moviePoster}">`;
	infoDiv.innerHTML = `<h2>${movie.movieName}</h2> <p>${movie.movieYear}</p>`;
	section.append(containerDiv);
	
}

async function waitForResultSection() {
	await createResultSection();
	window.location.href = "#section10";
}