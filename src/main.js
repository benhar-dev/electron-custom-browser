const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const minimist = require("minimist");
const fs = require("fs");

// Determine if the application is packaged
const isPackaged = app.isPackaged;

// Handle command line arguments appropriately based on packaging
const argv = process.argv.slice(isPackaged ? 1 : 2);
const parsedArgs = minimist(argv);

// Check command line arguments, or use default values
const startUrl = parsedArgs.url || "http://127.0.0.1:1010/";
const startWidth = parseInt(parsedArgs.width, 10) || 800;
const startHeight = parseInt(parsedArgs.height, 10) || 600;
const startX = parseInt(parsedArgs.x, 10) || undefined;
const startY = parseInt(parsedArgs.y, 10) || undefined;
const isFullscreen =
  parsedArgs.width === undefined &&
  parsedArgs.height === undefined &&
  parsedArgs.x === undefined &&
  parsedArgs.y === undefined;

// Initialize main window variable
let mainWindow = null;
let windowMap = new Map();

// Function to create the main window with necessary configurations
function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "../assets/icons/icon.png"), // Window icon
    width: startWidth,
    height: startHeight,
    x: startX,
    y: startY,
    fullscreen: isFullscreen,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Preload script
      contextIsolation: true, // Protect against prototype pollution
      nodeIntegration: false, // Disable node integration for security
      sandbox: true, // Enable sandbox for added security
      enableRemoteModule: false, // Disable remote module for security
      webSecurity: true, // Enforce web security
      additionalArguments: [`--csp="default-src 'self'; script-src 'self'"`], // CSP for enhanced security
    },
  });

  // Load the URL or default to local server
  loadURLWithRetry(startUrl);

  mainWindow.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (isMainFrame) {
        loadURLWithRetry(startUrl);
      }
    }
  );
}

function loadURLWithRetry(url, interval = 5000) {
  mainWindow.loadURL(url).catch(() => {
    setTimeout(() => {
      loadURLWithRetry(url, interval);
    }, interval);
  });
}

// App readiness to create window
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Re-create a window in the app when the dock icon is clicked (macOS)
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ---------------------------------------------------------------------------------
// helper functions
// ---------------------------------------------------------------------------------

function registerIpcHandler(channel, handler) {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      const result = await Promise.resolve(handler(event, ...args));
      return { success: true, reply: result };
    } catch (error) {
      return {
        success: false,
        message: error.message || "An unknown error occurred",
      };
    }
  });
}

// ---------------------------------------------------------------------------------
// Example "extra" functionality
//
// This is the code which performs the new operations.  You will see in the section
// below how they are then registered with the application.
// ---------------------------------------------------------------------------------

const toggleFullscreen = () => {
  const isFullscreen = mainWindow.isFullScreen();
  mainWindow.setFullScreen(!isFullscreen);
};

const resize = (event, width, height) => {
  if (mainWindow.isFullScreen()) {
    mainWindow.setFullScreen(false);
  }

  mainWindow.setBounds({
    width: parseInt(width, 10),
    height: parseInt(height, 10),
  });
};

const takeScreenshot = async (event, filename) => {
  try {
    const image = await mainWindow.capturePage();
    const baseFilename = filename || `screenshot-${Date.now()}`;
    const filePath = path.join(app.getPath("pictures"), `${baseFilename}.png`);
    await fs.promises.writeFile(filePath, image.toPNG());
    return `${baseFilename}.png`;
  } catch (error) {
    throw new Error("Unable to create screenshot");
  }
};

const openWindow = (
  event,
  url,
  width = 500,
  height = 400,
  x = 100,
  y = 100
) => {
  let childWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    parent: mainWindow,
    modal: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      enableRemoteModule: false,
      webSecurity: true,
      additionalArguments: [`--csp="default-src 'self'; script-src 'self'"`],
    },
  });

  childWindow.loadURL(url);
  childWindow.on("closed", () => {
    windowMap.delete(childWindow.id);
    childWindow = null;
  });

  windowMap.set(childWindow.id, childWindow);
  return childWindow.id;
};

const closeWindow = (event, handle) => {
  const windowToClose = windowMap.get(handle);
  if (!windowToClose) {
    throw new Error(`Unknown window handle ${handle}`);
  }
  windowToClose.close();
};

const closeApp = () => {
  app.quit();
};

// ---------------------------------------------------------------------------------
// Registering the functions
//
// You simply define an event name which will be called from the preload.js, and
// pass in the function which should be called.
// ---------------------------------------------------------------------------------

registerIpcHandler("toggle-fullscreen", toggleFullscreen);
registerIpcHandler("resize", resize);
registerIpcHandler("take-screenshot", takeScreenshot);
registerIpcHandler("open-window", openWindow);
registerIpcHandler("close-window", closeWindow);
registerIpcHandler("close-app", closeApp);
