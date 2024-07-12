const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ecBrowser", {
  closeApp: async () => await invokeIpcCommand("close-app"),

  toggleFullscreen: async () => await invokeIpcCommand("toggle-fullscreen"),

  resize: async (width, height) =>
    await invokeIpcCommand("resize", width, height),

  takeScreenshot: async (filename) =>
    await invokeIpcCommand("take-screenshot", filename),

  openWindow: async (url, width, height, x, y) =>
    await invokeIpcCommand("open-window", url, width, height, x, y),

  closeWindow: async (handle) => await invokeIpcCommand("close-window", handle),
});

// ---------------------------------------------------------------------------------
// helper function
// ---------------------------------------------------------------------------------

async function invokeIpcCommand(channel, ...args) {
  try {
    const response = await ipcRenderer.invoke(channel, ...args);
    if (response.success) {
      return response.reply || response;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    throw new Error(`Failed to execute ${channel}: ${error.message}`);
  }
}
