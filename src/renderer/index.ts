(window as any).appState = function () {
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
        const res = await (window as any).git.fetch(repo);
        this.output = res || `Updated ${repo}`;
        try {
          const files = await (window as any).git.listFiles(repo);
          if (Array.isArray(files)) {
            window.dispatchEvent(
              new CustomEvent("repo:files-updated", {
                detail: { repoName: repo, files },
              })
            );
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
};
