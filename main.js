const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let win;
let timer;
let selectedFilePath = ''; // Variable to store the selected file path

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Preload script for secure IPC
            contextIsolation: true,
            enableRemoteModule: false,
        }
    });

    // Load the main HTML file
    win.loadFile(path.join(__dirname, 'index.html'));

    // Open DevTools (optional, remove in production)
    win.webContents.openDevTools();

    // Handle window closed
    win.on('closed', () => {
        win = null;
    });
}

// Timer function to delete the selected file after the specified duration
function startTimer(duration) {
    timer = setTimeout(() => {
        if (selectedFilePath && fs.existsSync(selectedFilePath)) {
            fs.unlinkSync(selectedFilePath); // Delete the file
            dialog.showMessageBox(win, {
                type: 'info',
                title: 'File Deleted!',
                message: "Time's up! Your file has been obliterated.",
                buttons: ['Oops']
            });
        }
    }, duration * 60 * 60 * 1000); // Convert hours to milliseconds
}

// Handle IPC messages from the renderer process
ipcMain.on('start-timer', (event, hours) => {
    if (timer) {
        clearTimeout(timer); // Clear any existing timer
    }
    startTimer(hours); // Start a new timer with the specified duration
});

ipcMain.on('set-selected-file', (event, filePath) => {
    selectedFilePath = filePath; // Store the selected file path for deletion
});

ipcMain.on('open-file-in-vscode', (event, filePath) => {
    // Open the selected file in Visual Studio Code
    exec(`code "${filePath}"`, (error) => {
        if (error) {
            console.error("Failed to open file in VS Code:", error);
            dialog.showErrorBox("Error", "Failed to open the file in VS Code.");
        }
    });
});

// Application event handling
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});


app.whenReady().then(createWindow);
