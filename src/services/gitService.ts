import { exec } from "child_process";
import { promisify } from "util";

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
    try {
      await execPromise(`test -d ${repoName}`);
      return `Repository folder '${repoName}' already exists. Skipping clone.`;
    } catch {}
    try {
      const { stdout, stderr } = await execPromise(`git clone ${repoUrl}`);
      if (stderr) {
        if (/fatal|error/i.test(stderr)) {
          throw new Error(stderr);
        }
      }
      return stdout || `Cloned ${repoUrl}`;
    } catch (error) {
      throw new Error(`Clone failed: ${error.message}`);
    }
  }

  async listFiles(repoName: string): Promise<string[]> {
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execP = promisify(exec);
    try {
      await execP(`test -d ${repoName}`);
    } catch {
      return [];
    }
    try {
      const { stdout } = await execP(
        `find ${repoName} -type f -not -path '*/.git/*' -not -path '*/node_modules/*'`
      );
      return stdout
        .split("\n")
        .filter((l) => l.trim())
        .map((full) => full.replace(new RegExp(`^${repoName}/`), ""));
    } catch (e: any) {
      throw new Error(`Failed to list files: ${e.message}`);
    }
  }

  async updateRepository(repoName: string): Promise<string> {
    if (!repoName) throw new Error("Repository name required");
    const { exec } = await import("child_process");
    const { promisify } = await import("util");
    const execP = promisify(exec);
    try {
      await execP(`test -d ${repoName}`);
    } catch {
      return `Repository '${repoName}' not cloned yet. Clone first in Settings.`;
    }
    try {
      const { stdout, stderr } = await execP(
        `git -C ${repoName} pull --ff-only`
      );
      if (stderr && /fatal|error/i.test(stderr)) {
        throw new Error(stderr);
      }
      return stdout || `Updated ${repoName}`;
    } catch (e: any) {
      throw new Error(`Update failed: ${e.message}`);
    }
  }

  async ensureArticlesDir(repoName: string): Promise<void> {
    const dir = `${repoName}/articles`;
    try {
      await execPromise(`test -d ${dir}`);
    } catch {
      await execPromise(`mkdir -p ${dir}`);
    }
  }

  async listArticles(repoName: string): Promise<string[]> {
    if (!repoName) return [];
    try {
      await this.ensureArticlesDir(repoName);
    } catch {}
    try {
      const { stdout } = await execPromise(
        `find ${repoName}/articles -type f -maxdepth 1 2>/dev/null || true`
      );
      return stdout
        .split("\n")
        .filter((l) => l.trim())
        .map((full) => full.replace(new RegExp(`^${repoName}/articles/`), ""));
    } catch (e: any) {
      throw new Error(`Failed to list articles: ${e.message}`);
    }
  }

  async readArticle(repoName: string, filename: string): Promise<string> {
    if (!repoName || !filename)
      throw new Error("Repository and filename required");
    await this.ensureArticlesDir(repoName);
    const path = `${repoName}/articles/${filename}`;
    try {
      const { stdout } = await execPromise(`cat ${path} 2>/dev/null || true`);
      return stdout;
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
    const path = `${repoName}/articles/${filename}`;
    const escaped = content.replace(/`/g, "\\`");
    try {
      await execPromise(
        `bash -c 'printf %s "${escaped.replace(/"/g, '\\"')}" > ${path}'`
      );
      return `Saved ${filename}`;
    } catch (e: any) {
      throw new Error(`Failed to write article: ${e.message}`);
    }
  }

  async newArticle(repoName: string, filename: string): Promise<string> {
    if (!repoName || !filename)
      throw new Error("Repository and filename required");
    await this.ensureArticlesDir(repoName);
    const path = `${repoName}/articles/${filename}`;
    try {
      await execPromise(`test -f ${path}`);
      return `Article '${filename}' already exists.`;
    } catch {
      const template = `# ${filename}\n\nNew article created on ${new Date().toISOString()}\n`;
      await this.writeArticle(repoName, filename, template);
      return `Created ${filename}`;
    }
  }

  async commitAndPush(repoName: string, message?: string): Promise<string> {
    if (!repoName) throw new Error("Repository name required");
    const commitMsg = message || `Update articles ${new Date().toISOString()}`;
    try {
      await execPromise(`git -C ${repoName} add articles || true`);
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
