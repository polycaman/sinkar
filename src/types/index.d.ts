export {};
interface GitCommandResponse {
  success: boolean;
  output: string;
  error?: string;
}

interface ChangedFile {
  path: string;
  status: "modified" | "added" | "deleted";
}

interface GitStatusResponse {
  changedFiles: ChangedFile[];
}

interface GitConfig {
  username?: string;
  email?: string;
  repoName?: string;
}

interface GitAPI {
  fetch: () => Promise<string>;
  push: () => Promise<string>;
  getConfig: () => Promise<GitConfig>;
  saveConfigAndClone: (config: {
    username?: string;
    email?: string;
    repoName: string;
  }) => Promise<string>;
}

declare global {
  interface Window {
    git: GitAPI;
  }
}
