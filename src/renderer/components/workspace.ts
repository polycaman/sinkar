function workspaceLogic() {
  return {
    output: "",
    loading: false,
    repoName: "",
    async init() {
      this.repoName = localStorage.getItem("sinkar.repoName") || "";
    },
    async fetchRepo() {
      const repo =
        (window as any).repoName ||
        this.repoName ||
        localStorage.getItem("sinkar.repoName") ||
        "";
      if (!repo) {
        this.output = "No repository name set. Set it in Settings first.";
        return;
      }
      this.loading = true;
      this.output = `Updating ${repo}...`;
      
      try {
        // 1. Try to fetch from remote
        try {
            const res = await (window as any).git.fetch(repo);
            this.output = res || `Updated ${repo}`;
        } catch (fetchErr: any) {
            console.warn("Fetch failed, continuing to local rebuild:", fetchErr);
            this.output = `Fetch warning: ${fetchErr.message}\nRebuilding local index...`;
        }
        
        // 2. Always rebuild index from disk (Single Source of Truth)
        try {
            await (window as any).git.rebuildIndex(repo);
            // Trigger file explorer refresh
            window.dispatchEvent(
                new CustomEvent("repo:files-updated", {
                    detail: { repoName: repo },
                })
            );
            this.output += "\nLocal index rebuilt.";
        } catch (idxErr: any) {
            this.output += "\nIndex rebuild error: " + idxErr.message;
        }

        // 3. Refresh file list for UI
        try {
          const files = await (window as any).git.listFiles(repo);
          if (Array.isArray(files)) {
             // This event is redundant if we just did repo:files-updated, 
             // but listFiles returns ALL files, while listArticles returns just articles.
             // We might need both.
          } else if (files && files.error) {
            this.output += "\n" + files.error;
          }
        } catch (err: any) {
          this.output += "\nFile list error: " + err.message;
        }
      } catch (e: any) {
        this.output = "Error: " + e.message;
      } finally {
        this.loading = false;
      }
    },
    async pushRepo() {
      const repo =
        (window as any).repoName ||
        this.repoName ||
        localStorage.getItem("sinkar.repoName") ||
        "";
      if (!repo) {
        this.output = "No repository name set. Set it first.";
        return;
      }
      this.loading = true;
      this.output = `Pushing ${repo}...`;
      try {
        // Rebuild index before pushing to ensure it's up to date
        await (window as any).git.rebuildIndex(repo);
        
        const res = await (window as any).git.commitAndPush(
          repo,
          "Sync articles"
        );
        this.output = res;
      } catch (e: any) {
        this.output = "Push failed: " + e.message;
      } finally {
        this.loading = false;
      }
    },
  };
}

(window as any).workspaceLogic = workspaceLogic;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("components/workspace.html");
    if (!res.ok) return;
    const html = await res.text();
    const mount = document.getElementById("app-root");
    if (!mount) return;
    mount.innerHTML = html;
    
    // Dispatch event to signal that the workspace layout is mounted
    // and other components can now find their mount points.
    window.dispatchEvent(new Event("workspace:mounted"));
  } catch (e) {
    console.error("Failed to load workspace component", e);
  }
});
