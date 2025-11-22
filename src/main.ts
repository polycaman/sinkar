import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "path";
import { GitService } from "./services/gitService";

const gitService = new GitService();

function createWindow() {
  // Create splash window
  const splash = new BrowserWindow({
    width: 400,
    height: 400,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    icon: join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  
  splash.loadFile(join(__dirname, "splash.html"));
  splash.show(); // Ensure it's shown immediately

  // Create main window (hidden initially)
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    icon: join(__dirname, "icon.png"),
    autoHideMenuBar: true,
    show: false, // Don't show until ready
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Handle external links and mailto
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:") || url.startsWith("http:") || url.startsWith("mailto:")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Handle window.location.href = 'mailto:...'
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('mailto:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadFile(join(__dirname, "renderer", "index.html")).catch(() => {});

  // Wait for main window to be ready
  win.once('ready-to-show', () => {
    // Keep splash screen for at least 2 seconds to show the animation
    setTimeout(() => {
      splash.close();
      win.show();
    }, 2500);
  });
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
  "git:write-site-file",
  async (
    _event,
    payload: { repoName: string; filePath: string; content: string }
  ) => {
    try {
      return await gitService.writeSiteFile(
        payload.repoName,
        payload.filePath,
        payload.content
      );
    } catch (e: any) {
      return { error: e.message };
    }
  }
);

ipcMain.handle(
  "git:read-site-file",
  async (
    _event,
    payload: { repoName: string; filePath: string }
  ) => {
    try {
      return await gitService.readSiteFile(
        payload.repoName,
        payload.filePath
      );
    } catch (e: any) {
      return { error: e.message };
    }
  }
);

ipcMain.handle(
  "git:rebuild-index",
  async (_event, repoName: string) => {
    try {
      return await gitService.rebuildArticlesIndex(repoName);
    } catch (e: any) {
      return { error: e.message };
    }
  }
);

ipcMain.handle(
  "git:get-repo-path",
  async (_event, repoName: string) => {
    try {
      return await gitService.getRepoPath(repoName);
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

ipcMain.handle(
  "git:save-asset",
  async (
    _event,
    payload: { repoName: string; articleId: string; fileName: string; fileData: ArrayBuffer }
  ) => {
    try {
      // Convert ArrayBuffer to Buffer
      const buffer = Buffer.from(payload.fileData);
      return await gitService.saveAsset(
        payload.repoName,
        payload.articleId,
        payload.fileName,
        buffer
      );
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
