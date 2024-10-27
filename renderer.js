const { ipcRenderer } = require('electron');
const { exec } = require('child_process');
const { remote } = require('electron');

const encouragingRemarks = [
    "Keep going! You're doing fine... for now.",
    "You're on the right track, just a few bumps!",
    "Almost there! Just a couple more tweaks.",
    "Good job! Just don't get too comfortable.",
    "You're improving... sort of!"
];

const rudeRemarks = [
    "Wow! Are you even trying? That's a lot of errors!",
    "Do you want a job as a bug magnet?",
    "I've seen better code from a toddler!",
    "Is your keyboard stuck or are you just this bad?",
    "Coding is not for everyone, clearly."
];

const encouragingButMockingRemarks = [
    "Look at you! All errors cleared... for now.",
    "Wow! You actually did it. Don’t get used to it.",
    "All clear! Just don’t mess it up again.",
    "You're a genius! At least for this moment.",
    "Well done! Just don’t push your luck!"
];

let timer;
let remainingTime;
let isTimerRunning = false;
let filePath;

function startTimer() {
    const timerInput = document.getElementById('timer').value;
    const hours = parseInt(timerInput, 10);

    if (isNaN(hours) || hours <= 0 || hours > 48) {
        alert('Please enter a valid number of hours (1-48).');
        return;
    }

    remainingTime = hours * 3600;
    isTimerRunning = true;

    timer = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
        } else {
            clearInterval(timer);
            isTimerRunning = false;
            deleteFile(filePath);
        }
    }, 1000);
}

function deleteFile(filePath) {
    const fs = require('fs');
    
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(`Error deleting file: ${err.message}`);
            displaySnarkyRemark("Oops! Couldn't delete your file. Try again!");
        } else {
            displaySnarkyRemark("Your file has been deleted due to inactivity!");
        }
    });
}

function checkErrors() {
    const errorCount = Math.floor(Math.random() * 15);
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.innerText = `Current Errors: ${errorCount}`;

    if (errorCount < 3) {
        displaySnarkyRemark(encouragingRemarks[Math.floor(Math.random() * encouragingRemarks.length)]);
    } else if (errorCount >= 9) {
        displayPopUpRemark(rudeRemarks[Math.floor(Math.random() * rudeRemarks.length)]);
    } else {
        displaySnarkyRemark("Not bad! Just a few bumps along the way.");
    }

    if (errorCount === 0) {
        displaySnarkyRemark(encouragingButMockingRemarks[Math.floor(Math.random() * encouragingButMockingRemarks.length)]);
    }
}

function displaySnarkyRemark(message) {
    const terminalElement = document.getElementById('terminal');
    terminalElement.innerText += `${message}\n`;
}

function displayPopUpRemark(message) {
    alert(message);
}

function openFileInVSCode(filePath) {
    exec(`code "${filePath}"`, (error) => {
        if (error) {
            console.error(`Error opening file in VS Code: ${error.message}`);
        } else {
            pauseTimer();
        }
    });
}

function pauseTimer() {
    if (isTimerRunning) {
        clearInterval(timer);
        isTimerRunning = false;
    }
}

function openInVSCode() {
    const input = document.getElementById('project-path');
    const file = input.files[0];

    if (file) {
        filePath = file.path;
        openFileInVSCode(filePath);
        document.getElementById('file-path').innerText = `Selected File: ${filePath}`;
    } else {
        alert('Please select a file first.');
    }
}

document.getElementById('start-timer').addEventListener('click', startTimer);
document.getElementById('checkErrorsButton').addEventListener('click', checkErrors);
document.getElementById('openFileButton').addEventListener('click', openInVSCode);

