import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { GitService } from "./services/gitService";

const gitService = new GitService();

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.loadFile(join(__dirname, "renderer", "index.html")).catch(() => {});
}

app.whenReady().then(createWindow);

ipcMain.handle("git:fetch", async (_event, repoName: string) => {
  try {
    return await gitService.updateRepository(repoName);
  } catch (e: any) {
    return e.message;
  }
});

ipcMain.handle("git:push", async (_event) => {
  try {
    return await gitService.push("origin", "main");
  } catch (e) {
    return e.message;
  }
});

ipcMain.handle("git:get-config", async () => {
  try {
    const cfg = await gitService.getGlobalConfig();
    return cfg;
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle(
  "git:save-config-and-clone",
  async (
    _event,
    config: { username?: string; email?: string; repoName: string }
  ) => {
    const { username, email, repoName } = config || {};
    if (!repoName) return "Repository name is required.";
    try {
      const setResult = await gitService.setGlobalConfigIfUnset(
        username,
        email
      );
      const global = await gitService.getGlobalConfig();
      const effectiveUser = global.username || username;
      if (!effectiveUser)
        return "Global git username still not set; cannot clone.";
      const cloneMsg = await gitService.cloneRepository(
        effectiveUser,
        repoName
      );
      const configSummary = `user.name: ${setResult.username}; user.email: ${setResult.email}`;
      return `${configSummary}\n${cloneMsg}`;
    } catch (e: any) {
      return `Failed: ${e.message}`;
    }
  }
);

ipcMain.handle("git:list-files", async (_event, repoName: string) => {
  try {
    return await gitService.listFiles(repoName);
  } catch (e: any) {
    return { error: e.message };
  }
});

ipcMain.handle("git:list-articles", async (_event, repoName: string) => {
  try {
    return await gitService.listArticles(repoName);
  } catch (e: any) {
    return { error: e.message };
  }
});

ipcMain.handle(
  "git:new-article",
  async (_event, payload: { repoName: string; filename: string }) => {
    try {
      return await gitService.newArticle(payload.repoName, payload.filename);
    } catch (e: any) {
      return { error: e.message };
    }
  }
);

ipcMain.handle(
  "git:read-article",
  async (_event, payload: { repoName: string; filename: string }) => {
    try {
      return await gitService.readArticle(payload.repoName, payload.filename);
    } catch (e: any) {
      return { error: e.message };
    }
  }
);

ipcMain.handle(
  "git:write-article",
  async (
    _event,
    payload: { repoName: string; filename: string; content: string }
  ) => {
    try {
      return await gitService.writeArticle(
        payload.repoName,
        payload.filename,
        payload.content
      );
    } catch (e: any) {
      return { error: e.message };
    }
  }
);

ipcMain.handle(
  "git:commit-and-push",
  async (_event, payload: { repoName: string; message?: string }) => {
    try {
      return await gitService.commitAndPush(payload.repoName, payload.message);
    } catch (e: any) {
      return { error: e.message };
    }
  }
);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
