# Simple example of creating your own browser

## Disclaimer

This is a personal guide not a peer reviewed journal or a sponsored publication. We make
no representations as to accuracy, completeness, correctness, suitability, or validity of any
information and will not be liable for any errors, omissions, or delays in this information or any
losses injuries, or damages arising from its display or use. All information is provided on an as
is basis. It is the reader’s responsibility to verify their own facts.

The views and opinions expressed in this guide are those of the authors and do not
necessarily reflect the official policy or position of any other agency, organization, employer or
company. Assumptions made in the analysis are not reflective of the position of any entity
other than the author(s) and, since we are critically thinking human beings, these views are
always subject to change, revision, and rethinking at any time. Please do not hold us to them
in perpetuity.

## Overview

This is a proof of concept that you can create a custom browser with extended functionality for use with TwinCAT HMI.

## Screenshot

![image](./docs/Images/Screenshot.gif)

## This demo has the following features

### Customizable startup options

This section outlines the various command-line arguments you can use to configure the behavior of the application at startup. These options allow you to customize settings such as window size, startup URLs, and more.

If you omit both height and width then the application will start full screen.

| Option     | Description                                                | Values            | Default              |
| ---------- | ---------------------------------------------------------- | ----------------- | -------------------- |
| `--width`  | Sets the width of the application window.                  | Any integer value | `800`                |
| `--height` | Sets the height of the application window.                 | Any integer value | `600`                |
| `--x`      | Sets the x of the application window. --y must be included | Any integer value | Window Centered      |
| `--y`      | Sets the y of the application window. --x must be included | Any integer value | Window Centered      |
| `--url`    | Specifies the startup URL to load.                         | Any valid URL     | `http://example.com` |

#### Examples

To start the application fullscreen with the default URL of http://127.0.0.1:1010

```bash
ecBrowser.exe
```

To start the application with a specific window size and position:

```bash
ecBrowser.exe --width=1024 --height=768 --x=10 --y=20
```

To start the application fullscreen with example.com :

```bash
ecBrowser.exe --url="http://example.com"
```

### Support of the ecBrowser API

ecBrowser will be available to your JavaScript application. You can call function such as,

#### Closing the application

```javascript
ecBrowser.closeApp();
```

#### Resize the main window

If the main window is full screen then it will be windowed at the same time.

```javascript
//ecBrowser.resize(width, height)
ecBrowser
  .resize(100, 100)
  .then(() => {
    console.log(`Resize is complete`);
  })
  .catch((error) => {
    console.error("Error resizing window:", error);
  });
```

#### Taking a Screenshot

This example shows how to capture a screenshot and handle the filename, which can be useful for logging, debugging, or displaying in the UI.

If no filename is supplied then an automatic timestamp filename will be used.

Pictures will be saved in the windows pictures folder.

```javascript
//ecBrowser.takeScreenshot(filename)
ecBrowser
  .takeScreenshot("snapshot.png")
  .then((filename) => {
    console.log(`Screenshot saved as ${filename}`);
    // Additional code to use the filename, e.g., display it in the UI
  })
  .catch((error) => {
    console.error("Error taking screenshot:", error);
  });
```

#### Opening and Managing a New Window

Open a new window and use the returned window handle for further operations, such as closing it or monitoring its status.

```javascript
//ecBrowser.openWindow(url, width, height, x, y)
ecBrowser
  .openWindow("https://example.com", 500, 400, 100, 100)
  .then((windowHandle) => {
    console.log(`Window opened with handle ${windowHandle}`);
  })
  .catch((error) => {
    console.error("Error opening new window:", error);
  });
```

#### Closing a Specific Window

```javascript
//ecBrowser.closeWindow(windowHandle)
const windowHandle = 123; // This should be replaced with the actual window handle
ecBrowser
  .closeWindow(windowHandle)
  .then(() => {
    console.log(`Window with handle ${windowHandle} has been closed.`);
  })
  .catch((error) => {
    console.error("Error closing window:", error);
  });
```

## Getting started

You will be creating an application based on electron. This requires the use of node.js. The steps below will show you how to setup and test the application. Once done there are steps following showing how this could be packaged in to an executable.

### Prerequisites

- Node.js (latest stable version)
- npm (comes with Node.js)
- GIT

### Installation

The steps below assume that Node.js and Git has already been installed.

#### Building from Source

1. Clone the repository:

   ```bash
   git clone https://github.com/benhar-dev/electron-custom-browser.git
   ```

2. Navigate to the cloned directory:

   ```bash
   cd electron-custom-browser
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Usage

To start the application, run the following command in the project directory:

```bash
npm start
# Please note, when running you can press ALT at any time to open the menu bar.
```

### Run using arguments

The application supports command line arguments to control what url and size of window is used. To simulate this you can run the following scripts :

#### Run windowed using example.com

```bash
# The code below simulates the following,
# > ecBrowser.exe --url="https://example.com" --width=1024 --height=768
npm run start-example-window
```

#### Run windowed and positioned using example.com

```bash
# The code below simulates the following,
# > ecBrowser.exe --url="https://example.com" --width=1024 --height=768 --x=10 --y=20
npm run start-example-window-positioned
```

#### Run fullscreen using example.com

```bash
# The code below simulates the following,
# > ecBrowser.exe --url="https://example.com"
npm run start-example-fullscreen
```

### Building for Production

To build the application to a ecBrowser.exe for production, use the following commands:

```bash
npm run dist
```

This will create a distribution using electron-builder and will generate necessary licenses and notices as part of the build process.

You will find the installer inside of the `./dist/win/` folder.

Copy to the IPC and run the installer.

Once done the command-line arguments will work as before, such as,

```bash
ecBrowser.exe --url="http://example.com"
```
