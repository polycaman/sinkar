function settingsLogic() {
  return {
    repoName: "",
    username: "",
    email: "",
    status: "",
    saving: false,
    async init() {
      const savedRepo = localStorage.getItem("sinkar.repoName");
      if (savedRepo) this.repoName = savedRepo;
      await this.loadConfig();
    },
    async loadConfig() {
      try {
        const cfg = await (window as any).git.getConfig();
        this.username = cfg.username || "";
        this.email = cfg.email || "";
        if (!this.username || !this.email) {
          this.status = "Missing global git credentials";
        }
      } catch (e) {
        this.status = "Failed to load git config";
      }
    },
    isReady() {
      return !!(this.repoName && this.username && this.email);
    },
    async saveAndClone() {
      if (!this.repoName) {
        this.status = "Repository name required";
        return;
      }
      if (!this.username || !this.email) {
        this.status = "Provide username & email first";
        return;
      }
      this.saving = true;
      this.status = "Processing...";
      try {
        const msg = await (window as any).git.saveConfigAndClone({
          repoName: this.repoName,
          username: this.username,
          email: this.email,
        });
        this.status = msg;
        await this.loadConfig();
        this.persistRepoName();
        (window as any).repoName = this.repoName;
        try {
          const files = await (window as any).git.listFiles(this.repoName);
          if (Array.isArray(files)) {
            window.dispatchEvent(
              new CustomEvent("repo:files-updated", {
                detail: { repoName: this.repoName, files },
              })
            );
          }
        } catch {}
      } catch (e: any) {
        this.status = "Error: " + e.message;
      } finally {
        this.saving = false;
      }
    },
    persistRepoName() {
      localStorage.setItem("sinkar.repoName", this.repoName);
      (window as any).repoName = this.repoName;
    },
  };
}

(window as any).createSettingsLogic = settingsLogic;

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("components/settings.html");
    if (!res.ok) return;
    const html = await res.text();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    document.body.appendChild(wrapper);
  } catch {}
});
