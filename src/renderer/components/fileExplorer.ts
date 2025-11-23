function fileExplorerLogic() {
  return {
    repoName:
      (window as any).repoName || localStorage.getItem("sinkar.repoName") || "",
    articles: [] as string[],
    loading: false,
    creating: false,
    newArticleName: "",
    init() {
      window.addEventListener("repo:files-updated", (e: any) => {
        const { repoName } = e.detail || {};
        if (repoName) {
          this.repoName = repoName;
          this.refresh();
        }
      });
      this.refresh();
      window.addEventListener("article:refresh", () => this.refresh());
    },
    async refresh() {
      if (!this.repoName) return;
      this.loading = true;
      try {
        await (window as any).git.rebuildIndex(this.repoName);
        const list = await (window as any).git.listArticles(this.repoName);
        if (Array.isArray(list)) this.articles = list;
      } catch {
      } finally {
        this.loading = false;
      }
    },
    startCreate() {
      if (!this.repoName) return;
      this.creating = true;
      this.newArticleName = "";
    },
    cancelCreate() {
      this.creating = false;
      this.newArticleName = "";
    },
    async confirmCreate() {
      if (!this.repoName || !this.newArticleName.trim()) return;
      const name = this.newArticleName.trim();
      this.loading = true;
      try {
        await (window as any).git.newArticle(this.repoName, name);
        await this.refresh();

        // Notify themes to regenerate script.js
        window.dispatchEvent(
          new CustomEvent("repo:files-updated", {
            detail: { repoName: this.repoName },
          })
        );

        window.dispatchEvent(
          new CustomEvent("article:open", {
            detail: { repoName: this.repoName, filename: name },
          })
        );
      } finally {
        this.loading = false;
        this.creating = false;
        this.newArticleName = "";
      }
    },
    openArticle(name: string) {
      window.dispatchEvent(
        new CustomEvent("article:open", {
          detail: { repoName: this.repoName, filename: name },
        })
      );
    },
  };
}

(window as any).createFileExplorerLogic = fileExplorerLogic;

const initFileExplorer = async () => {
  try {
    const res = await fetch("components/fileExplorer.html");
    if (!res.ok) return;
    const html = await res.text();
    const mount = document.getElementById("file-explorer-mount");
    if (!mount) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    mount.appendChild(wrapper.firstElementChild as HTMLElement);
  } catch {}
};

window.addEventListener("workspace:mounted", initFileExplorer);
