function previewerLogic() {
  return {
    activeFilename: "",
    content: "",
    rendered: "",
    init() {
      window.addEventListener("article:open", (e: any) => {
        const { filename } = e.detail || {};
        if (filename) {
          this.activeFilename = filename;
          this.content = "";
          this.rendered = "";
        }
      });
      window.addEventListener("article:content-changed", (e: any) => {
        const { filename, content } = e.detail || {};
        if (filename && filename === this.activeFilename) {
          this.content = content || "";
          this.updateRender();
        }
      });
    },
    updateRender() {
      if (!this.content.trim()) {
        this.rendered = "<em class='text-muted'>Empty file</em>";
        return;
      }
      try {
        if ((window as any).marked) {
          this.rendered = (window as any).marked.parse(this.content);
        } else {
          this.rendered = this.escapeHTML(this.content).replace(/\n/g, "<br/>");
        }
      } catch (e) {
        this.rendered = "<em class='text-danger'>Preview error</em>";
      }
    },
    escapeHTML(s: string) {
      return s.replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          }[c] as string)
      );
    },
  };
}

(window as any).previewerLogic = previewerLogic;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("components/previewer.html");
    if (!res.ok) return;
    const html = await res.text();
    const mount = document.getElementById("previewer-mount");
    if (!mount) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    mount.appendChild(wrapper.firstElementChild as HTMLElement);
  } catch {}
});
