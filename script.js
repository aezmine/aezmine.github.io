// Questions Array
const questions = [
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4"
    },
    {
        question: "What color is the sky on a clear day?",
        options: ["Red", "Blue", "Green", "Yellow"],
        answer: "Blue"
    },
    {
        question: "Which animal barks?",
        options: ["Cat", "Dog", "Cow", "Bird"],
        answer: "Dog"
    },
    {
        question: "What is the capital of the USA?",
        options: ["New York", "Los Angeles", "Washington D.C.", "Chicago"],
        answer: "Washington D.C."
    }
];

// Global variables
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;

// Shuffle Questions Function
function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

// Start Timer
function startTimer() {
    timeLeft = 30;
    document.getElementById("time-left").textContent = timeLeft;
    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timer);
            nextQuestion();
        }
    }, 1000);
}

// Display Question
function displayQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    document.getElementById("question").textContent = currentQuestion.question;
    const answerOptions = document.getElementById("answer-options");
    answerOptions.innerHTML = "";

    currentQuestion.options.forEach(option => {
        const li = document.createElement("li");
        li.textContent = option;
        li.onclick = () => checkAnswer(option);
        answerOptions.appendChild(li);
    });
}

// Check Answer
function checkAnswer(selectedAnswer) {
    const currentQuestion = questions[currentQuestionIndex];
    const feedback = document.getElementById("feedback");
    if (selectedAnswer === currentQuestion.answer) {
        score++;
        feedback.textContent = "Correct!";
        feedback.style.color = "green";
    } else {
        feedback.textContent = "Incorrect!";
        feedback.style.color = "red";
    }
    document.getElementById("score").textContent = `Score: ${score}`;
    document.getElementById("next-button").disabled = false;
}

// Next Question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        clearInterval(timer);
        document.getElementById("question-container").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("next-button").style.display = "none";
        document.getElementById("feedback").textContent = `Quiz Over! Your Final Score: ${score}`;
        document.getElementById("feedback").style.color = "blue";
    } else {
        document.getElementById("next-button").disabled = true;
        document.getElementById("feedback").textContent = "";
        displayQuestion();
        startTimer();
    }
}

// Start Quiz
function startQuiz() {
    shuffleQuestions();
    displayQuestion();
    startTimer();
}

window.onload = startQuiz;
