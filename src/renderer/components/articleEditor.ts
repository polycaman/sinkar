function articleEditorLogic() {
  return {
    repoName:
      (window as any).repoName || localStorage.getItem("sinkar.repoName") || "",
    filename: "",
    content: "",
    originalContent: "",
    loading: false,
    saving: false,
    dirty() {
      return this.content !== this.originalContent;
    },
    init() {
      window.addEventListener("article:open", (e: any) => {
        const { repoName, filename } = e.detail || {};
        if (repoName) this.repoName = repoName;
        if (filename) {
          this.load(filename);
        }
      });
    },
    async load(name: string) {
      if (!this.repoName) return;
      this.loading = true;
      this.filename = name;
      try {
        const data = await (window as any).git.readArticle(this.repoName, name);
        if (typeof data === "string") {
          this.content = data;
          this.originalContent = data;
        } else if (data && data.error) {
          this.content = `Error loading file: ${data.error}`;
          this.originalContent = this.content;
        }
      } catch (e: any) {
        this.content = `Error: ${e.message}`;
        this.originalContent = this.content;
      } finally {
        this.loading = false;
      }
    },
    async save() {
      if (!this.repoName || !this.filename) return;
      this.saving = true;
      try {
        const res = await (window as any).git.writeArticle(
          this.repoName,
          this.filename,
          this.content
        );
        if (res && res.error) {
          alert(res.error);
        } else {
          this.originalContent = this.content;
          window.dispatchEvent(new Event("article:refresh"));
        }
      } catch (e: any) {
        alert("Save failed: " + e.message);
      } finally {
        this.saving = false;
      }
    },
  };
}

(window as any).createArticleEditorLogic = articleEditorLogic;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("components/articleEditor.html");
    if (!res.ok) return;
    const html = await res.text();
    const mount = document.getElementById("article-editor-mount");
    if (!mount) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    mount.appendChild(wrapper.firstElementChild as HTMLElement);
  } catch {}
});
