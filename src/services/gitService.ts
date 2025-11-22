import { exec } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";

const execPromise = promisify(exec);

export class GitService {
  async fetch(remote: string): Promise<string> {
    try {
      const { stdout, stderr } = await execPromise(`git fetch ${remote}`);
      if (stderr) {
        throw new Error(stderr);
      }
      return stdout;
    } catch (error) {
      throw new Error(`Fetch failed: ${error.message}`);
    }
  }

  async push(remote: string, branch: string): Promise<string> {
    try {
      const { stdout, stderr } = await execPromise(
        `git push ${remote} ${branch}`
      );
      if (stderr) {
        throw new Error(stderr);
      }
      return stdout;
    } catch (error) {
      throw new Error(`Push failed: ${error.message}`);
    }
  }

  async getChangedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execPromise("git status --porcelain");
      const changedFiles = stdout
        .split("\n")
        .filter((line) => line)
        .map((line) => line.substring(3)); // Get the file names
      return changedFiles;
    } catch (error) {
      throw new Error(`Failed to get changed files: ${error.message}`);
    }
  }

  async getGlobalConfig(): Promise<{ username?: string; email?: string }> {
    const result: { username?: string; email?: string } = {};
    try {
      const { stdout: nameOut } = await execPromise(
        "git config --global user.name || true"
      );
      const name = nameOut.trim();
      if (name) result.username = name;
    } catch {}
    try {
      const { stdout: emailOut } = await execPromise(
        "git config --global user.email || true"
      );
      const email = emailOut.trim();
      if (email) result.email = email;
    } catch {}
    return result;
  }

  async setGlobalConfigIfUnset(
    username?: string,
    email?: string
  ): Promise<{
    username: "set" | "skipped" | "not-provided";
    email: "set" | "skipped" | "not-provided";
  }> {
    const result: {
      username: "set" | "skipped" | "not-provided";
      email: "set" | "skipped" | "not-provided";
    } = {
      username: "not-provided",
      email: "not-provided",
    };
    const currentGlobal = await this.getGlobalConfig();
    if (username) {
      const current = currentGlobal.username;
      if (!current) {
        await execPromise(
          `git config --global user.name "${username.replace(/"/g, '\\"')}"`
        );
        result.username = "set";
      } else {
        result.username = "skipped";
      }
    }
    if (email) {
      const current = currentGlobal.email;
      if (!current) {
        await execPromise(
          `git config --global user.email "${email.replace(/"/g, '\\"')}"`
        );
        result.email = "set";
      } else {
        result.email = "skipped";
      }
    }
    return result;
  }

  async cloneRepository(username: string, repoName: string): Promise<string> {
    if (!username || !repoName) {
      throw new Error("Username and repository name are required to clone");
    }
    const repoUrl = `https://github.com/${username}/${repoName}.git`;
    const repoPath = path.resolve(process.cwd(), repoName);
    try {
      const stat = await fs.stat(repoPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        return `Repository folder '${repoName}' already exists. Skipping clone.`;
      }
    } catch {}
    try {
      const { stdout, stderr } = await execPromise(`git clone ${repoUrl}`);
      if (stderr && /fatal|error/i.test(stderr)) {
        throw new Error(stderr);
      }
      return stdout || `Cloned ${repoUrl}`;
    } catch (error: any) {
      throw new Error(`Clone failed: ${error.message}`);
    }
  }

  async listFiles(repoName: string): Promise<string[]> {
    if (!repoName) return [];
    const repoPath = path.resolve(process.cwd(), repoName);
    const exists = await fs.stat(repoPath).catch(() => null);
    if (!exists) return [];
    const out: string[] = [];
    const walk = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === ".git" || entry.name === "node_modules") continue;
          await walk(full);
        } else if (entry.isFile()) {
          out.push(path.relative(repoPath, full).replace(/\\/g, "/"));
        }
      }
    };
    try {
      await walk(repoPath);
      return out;
    } catch (e: any) {
      throw new Error(`Failed to list files: ${e.message}`);
    }
  }

  async updateRepository(repoName: string): Promise<string> {
    if (!repoName) throw new Error("Repository name required");
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execP = promisify(exec);
    
    // Check if repo exists using fs.stat instead of shell command 'test -d'
    // 'test -d' fails on Windows cmd.exe
    const repoPath = path.resolve(process.cwd(), repoName);
    try {
      const stat = await fs.stat(repoPath);
      if (!stat.isDirectory()) {
         throw new Error("Not a directory");
      }
    } catch {
      return `Repository '${repoName}' not cloned yet. Clone first in Settings.`;
    }

    try {
      // First fetch
      await execP(`git -C ${repoName} fetch origin`);
      
      // Then reset hard to match origin/main exactly
      // This ensures "what is in the repo remains" and discards local garbage/conflicts
      await execP(`git -C ${repoName} reset --hard origin/main`);
      
      // Also clean untracked files to ensure "everything is forgotten" except what's in the repo
      await execP(`git -C ${repoName} clean -fd`);

      // Rebuild index to match the new state
      await this.rebuildArticlesIndex(repoName);

      return `Updated ${repoName} (Reset to origin/main & Cleaned)`;
    } catch (e: any) {
      throw new Error(`Update failed: ${e.message}`);
    }
  }

  async ensureArticlesDir(repoName: string): Promise<void> {
    if (!repoName) return;
    const dir = path.resolve(process.cwd(), repoName, "articles");
    const stat = await fs.stat(dir).catch(() => null);
    if (!stat) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async listArticles(repoName: string): Promise<string[]> {
    if (!repoName) return [];
    await this.ensureArticlesDir(repoName);
    const articlesDir = path.resolve(process.cwd(), repoName, "articles");
    try {
      const entries = await fs.readdir(articlesDir, { withFileTypes: true });
      return entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort();
    } catch (e: any) {
      throw new Error(`Failed to list articles: ${e.message}`);
    }
  }

  async readArticle(repoName: string, filename: string): Promise<string> {
    if (!repoName || !filename)
      throw new Error("Repository and filename required");
    await this.ensureArticlesDir(repoName);
    // Check if it's a folder (new system) or file (old system)
    const folderPath = path.resolve(process.cwd(), repoName, "articles", filename);
    const filePath = path.resolve(process.cwd(), repoName, "articles", filename + ".md");
    
    try {
      const stat = await fs.stat(folderPath).catch(() => null);
      if (stat && stat.isDirectory()) {
        // It's a folder, read index.md
        return await fs.readFile(path.join(folderPath, "index.md"), "utf8");
      } else {
        // Fallback to old file system
        return await fs.readFile(filePath, "utf8").catch(() => "");
      }
    } catch (e: any) {
      throw new Error(`Failed to read article: ${e.message}`);
    }
  }

  async writeArticle(
    repoName: string,
    filename: string,
    content: string
  ): Promise<string> {
    if (!repoName || !filename)
      throw new Error("Repository and filename required");
    await this.ensureArticlesDir(repoName);
    
    const folderPath = path.resolve(process.cwd(), repoName, "articles", filename);
    
    try {
      // Ensure folder exists
      await fs.mkdir(folderPath, { recursive: true });
      // Write to index.md
      await fs.writeFile(path.join(folderPath, "index.md"), content, "utf8");
      
      // Auto-rebuild index after writing
      await this.rebuildArticlesIndex(repoName);
      return `Saved ${filename}`;
    } catch (e: any) {
      throw new Error(`Failed to write article: ${e.message}`);
    }
  }

  async newArticle(repoName: string, filename: string): Promise<string> {
    if (!repoName || !filename)
      throw new Error("Repository and filename required");
    
    // Clean filename to be folder-safe
    const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();

    await this.ensureArticlesDir(repoName);
    const folderPath = path.resolve(process.cwd(), repoName, "articles", safeName);
    
    const exists = await fs.stat(folderPath).catch(() => null);
    if (exists) {
      return `Article '${safeName}' already exists.`;
    }
    
    try {
      await fs.mkdir(folderPath, { recursive: true });
      await fs.mkdir(path.join(folderPath, "assets"), { recursive: true });
      
      const template = `# ${filename}\n\nNew article created on ${new Date().toISOString()}\n`;
      await fs.writeFile(path.join(folderPath, "index.md"), template, "utf8");
      
      await this.rebuildArticlesIndex(repoName);
      return `Created ${safeName}`;
    } catch (e: any) {
      throw new Error(`Failed to create article: ${e.message}`);
    }
  }

  async saveAsset(repoName: string, articleId: string, fileName: string, fileData: Buffer): Promise<string> {
    if (!repoName || !articleId || !fileName) throw new Error("Missing params");
    
    const assetsDir = path.resolve(process.cwd(), repoName, "articles", articleId, "assets");
    try {
      await fs.mkdir(assetsDir, { recursive: true });
      
      // Generate random name to avoid collisions
      const ext = path.extname(fileName);
      const randomName = Math.random().toString(36).substring(2, 15) + ext;
      const filePath = path.join(assetsDir, randomName);
      
      await fs.writeFile(filePath, fileData);
      return `assets/${randomName}`;
    } catch (e: any) {
      throw new Error(`Failed to save asset: ${e.message}`);
    }
  }

  async writeSiteFile(
    repoName: string,
    filePath: string,
    content: string
  ): Promise<string> {
    if (!repoName || !filePath)
      throw new Error("Repository and file path required");
    const fullPath = path.resolve(process.cwd(), repoName, filePath);
    const dir = path.dirname(fullPath);
    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content, "utf8");
      return `Saved ${filePath}`;
    } catch (e: any) {
      throw new Error(`Failed to write site file: ${e.message}`);
    }
  }

  async readSiteFile(repoName: string, filePath: string): Promise<string> {
    if (!repoName || !filePath)
      throw new Error("Repository and file path required");
    const fullPath = path.resolve(process.cwd(), repoName, filePath);
    try {
      const data = await fs.readFile(fullPath, "utf8");
      return data;
    } catch (e: any) {
      // Return empty string if file doesn't exist, or throw specific error?
      // For config loading, empty string or null is better than crashing.
      if (e.code === 'ENOENT') return "";
      throw new Error(`Failed to read site file: ${e.message}`);
    }
  }

  async rebuildArticlesIndex(repoName: string): Promise<string> {
    if (!repoName) throw new Error("Repository name required");
    
    // Ensure directory exists, if not create it (handles empty repo case)
    await this.ensureArticlesDir(repoName);
    
    const articlesDir = path.resolve(process.cwd(), repoName, "articles");
    try {
      // If directory doesn't exist (should be handled by ensureArticlesDir but double check)
      const dirStat = await fs.stat(articlesDir).catch(() => null);
      if (!dirStat) {
          // If for some reason it's still missing, write empty index
          const indexPath = path.resolve(process.cwd(), repoName, "articles.json");
          await fs.writeFile(indexPath, "[]", "utf8");
          return "Repo empty, initialized empty index.";
      }

      const entries = await fs.readdir(articlesDir, { withFileTypes: true });
      const articles = [];
      for (const entry of entries) {
        let content = "";
        let fullPath = "";
        let articleId = entry.name;

        if (entry.isDirectory()) {
          fullPath = path.join(articlesDir, entry.name, "index.md");
          content = await fs.readFile(fullPath, "utf8").catch(() => "");
        } else if (entry.isFile() && !entry.name.startsWith(".")) {
          // Legacy support
          fullPath = path.join(articlesDir, entry.name);
          content = await fs.readFile(fullPath, "utf8").catch(() => "");
        } else {
          continue;
        }

        if (!content) continue;
          
          let title = articleId;
          let metadata: any = {};

          // Parse Frontmatter
          const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
          if (fmMatch) {
            const yamlText = fmMatch[1];
            yamlText.split(/\r?\n/).forEach(line => {
              const parts = line.split(':');
              if (parts.length >= 2) {
                const key = parts[0].replace(/[\x00-\x1F\x7F-\x9F\u200B]/g, "").trim();
                const value = parts.slice(1).join(':').trim();
                if (key) {
                  metadata[key] = value;
                }
              }
            });
            
            // If title is in metadata, use it
            if (metadata.title) {
              title = metadata.title;
            }
          }

          // Fallback title extraction if not in metadata
          if (title === articleId) {
             const firstLine = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').split(/\r?\n/)[0] || "";
             if (firstLine.startsWith("#")) {
               title = firstLine.replace(/^#+\s*/, "").trim();
             }
          }
          
          // Get file modification time
          const stats = await fs.stat(fullPath);
          
          articles.push({
            title,
            file: articleId, // Now just the folder name (or filename for legacy)
            date: stats.mtime.toISOString(),
            ...metadata // Include all metadata in the index
          });
        }
      // Sort by date descending
      articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const indexContent = JSON.stringify(articles, null, 2);
      const indexPath = path.resolve(process.cwd(), repoName, "articles.json");
      await fs.writeFile(indexPath, indexContent, "utf8");
      return `Rebuilt articles.json with ${articles.length} articles`;
    } catch (e: any) {
      throw new Error(`Failed to rebuild index: ${e.message}`);
    }
  }

  async getRepoPath(repoName: string): Promise<string> {
    if (!repoName) throw new Error("Repository name required");
    return path.resolve(process.cwd(), repoName);
  }

  async commitAndPush(repoName: string, message?: string): Promise<string> {
    if (!repoName) throw new Error("Repository name required");
    const commitMsg = message || `Update site ${new Date().toISOString()}`;
    try {
      await execPromise(`git -C ${repoName} add .`);
      const { stdout: diffOut } = await execPromise(
        `git -C ${repoName} diff --cached --name-only`
      );
      if (!diffOut.trim()) {
        const pushRes = await execPromise(
          `git -C ${repoName} push origin main`
        );
        if (pushRes.stderr && /fatal|error/i.test(pushRes.stderr))
          throw new Error(pushRes.stderr);
        return pushRes.stdout || `No changes. Pushed ${repoName}.`;
      }
      const { stdout: commitOut, stderr: commitErr } = await execPromise(
        `git -C ${repoName} commit -m "${commitMsg.replace(/"/g, '\\"')}"`
      );
      if (commitErr && /fatal|error/i.test(commitErr))
        throw new Error(commitErr);
      const { stdout: pushOut, stderr: pushErr } = await execPromise(
        `git -C ${repoName} push origin main`
      );
      if (pushErr && /fatal|error/i.test(pushErr)) throw new Error(pushErr);
      return `${commitOut}\n${pushOut}`.trim();
    } catch (e: any) {
      throw new Error(`Commit & push failed: ${e.message}`);
    }
  }
}
