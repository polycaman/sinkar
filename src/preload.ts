import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("git", {
  fetch: (repoName: string) => ipcRenderer.invoke("git:fetch", repoName),
  push: () => ipcRenderer.invoke("git:push"),
  getRepoPath: (repoName: string) =>
    ipcRenderer.invoke("git:get-repo-path", repoName),
  commitAndPush: (repoName: string, message?: string) =>
    ipcRenderer.invoke("git:commit-and-push", { repoName, message }),
  getConfig: () => ipcRenderer.invoke("git:get-config"),
  saveConfigAndClone: (config: {
    username?: string;
    email?: string;
    repoName: string;
  }) => ipcRenderer.invoke("git:save-config-and-clone", config),
  listFiles: (repoName: string) =>
    ipcRenderer.invoke("git:list-files", repoName),
  listArticles: (repoName: string) =>
    ipcRenderer.invoke("git:list-articles", repoName),
  newArticle: (repoName: string, filename: string) =>
    ipcRenderer.invoke("git:new-article", { repoName, filename }),
  readArticle: (repoName: string, filename: string) =>
    ipcRenderer.invoke("git:read-article", { repoName, filename }),
  writeArticle: (repoName: string, filename: string, content: string) =>
    ipcRenderer.invoke("git:write-article", { repoName, filename, content }),
  writeSiteFile: (repoName: string, filePath: string, content: string) =>
    ipcRenderer.invoke("git:write-site-file", { repoName, filePath, content }),
  readSiteFile: (repoName: string, filePath: string) =>
    ipcRenderer.invoke("git:read-site-file", { repoName, filePath }),
  rebuildIndex: (repoName: string) =>
    ipcRenderer.invoke("git:rebuild-index", repoName),
  saveAsset: (repoName: string, articleId: string, fileName: string, fileData: ArrayBuffer) =>
    ipcRenderer.invoke("git:save-asset", { repoName, articleId, fileName, fileData }),
  onChangedFiles: (callback: (files: string[]) => void) =>
    ipcRenderer.on("git:changed-files", (_event, files) => callback(files)),
});
