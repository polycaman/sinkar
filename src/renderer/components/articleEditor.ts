function articleEditorLogic() {
  const generators = (window as any).SinkarGenerators;

  return {
    repoName:
      (window as any).repoName || localStorage.getItem("sinkar.repoName") || "",
    repoPath: "",
    filename: "",
    content: "", // Full content (for raw view if needed, or internal storage)
    body: "", // The markdown part
    metadata: {} as any, // The frontmatter part
    originalContent: "",
    loading: false,
    saving: false,
    currentSchema: [] as any[],
    showMetadata: false,
    orphanedProps: [] as string[],

    dirty() {
      return this.composeContent() !== this.originalContent;
    },

    init() {
      window.addEventListener("article:open", async (e: any) => {
        const { repoName, filename } = e.detail || {};
        if (repoName) {
            this.repoName = repoName;
            this.repoPath = await (window as any).git.getRepoPath(repoName);
        }
        if (filename) {
          this.load(filename);
        }
      });
      
      // Listen for theme changes to update schema immediately
      window.addEventListener("theme:changed", () => {
        this.loadThemeSchema();
      });

      // Listen for repo updates (e.g. after Fetch) to reload current article
      window.addEventListener("repo:files-updated", (e: any) => {
        const { repoName } = e.detail || {};
        if (repoName && repoName === this.repoName && this.filename) {
            // Reload the current article to reflect changes from disk
            this.load(this.filename);
        }
      });

      this.loadThemeSchema();
    },

    async loadThemeSchema() {
      if (!this.repoName) return;
      try {
        const content = await (window as any).git.readSiteFile(this.repoName, "swp/theme-config.json");
        let themeId = "writer"; // default
        if (content && typeof content === 'string') {
          const config = JSON.parse(content);
          if (config.themeId) themeId = config.themeId;
        }
        this.currentSchema = generators.THEME_SCHEMAS[themeId] || generators.THEME_SCHEMAS['writer'];
        this.checkOrphanedProps();
      } catch (e) {
        console.error("Failed to load theme schema", e);
        this.currentSchema = generators.THEME_SCHEMAS['writer'];
      }
    },

    checkOrphanedProps() {
      if (!this.metadata || !this.currentSchema) return;
      const schemaKeys = this.currentSchema.map(f => f.name);
      const allowedKeys = [...schemaKeys, 'title'];
      
      this.orphanedProps = Object.keys(this.metadata).filter(key => {
        if (!key) return false;
        // Check for invisible chars or whitespace-only keys that might have slipped in
        if (!key.trim()) return false;
        
        // Ignore if value is empty (undefined, null, empty string)
        // These will be automatically cleaned up on save by composeContent anyway
        const val = this.metadata[key];
        if (val === undefined || val === null || String(val).trim() === '') return false;

        return !allowedKeys.includes(key);
      });
    },

    removeOrphanedProps() {
      if (this.orphanedProps.length === 0) return;
      // Create a new object to ensure reactivity triggers properly
      const newMetadata = { ...this.metadata };
      this.orphanedProps.forEach(key => {
        delete newMetadata[key];
      });
      this.metadata = newMetadata;
      this.orphanedProps = [];
      this.notifyChange();
      // Re-check to ensure UI updates
      this.checkOrphanedProps();
    },

    parseFrontmatter(text: string) {
      const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (match) {
        const yamlText = match[1];
        const body = match[2];
        const metadata: any = {};
        
        // Simple YAML parser
        yamlText.split(/\r?\n/).forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            // Sanitize key: remove non-printable chars, zero-width spaces, etc.
            let key = parts[0].replace(/[\x00-\x1F\x7F-\x9F\u200B]/g, "").trim();
            
            // Extra safety: ignore keys that are just punctuation or invalid
            // This fixes issues where "..." or "---" inside the block might be parsed as keys
            if (key && /^[\w\s-]+$/.test(key)) {
                const value = parts.slice(1).join(':').trim();
                metadata[key] = value;
            }
          }
        });

        return { metadata, body };
      }
      return { metadata: {}, body: text };
    },

    composeContent() {
      const metaString = Object.entries(this.metadata)
        .filter(([k, v]) => k && v !== undefined && v !== '')
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      
      if (metaString.length > 0) {
        return `---\n${metaString}\n---\n${this.body}`;
      }
      return this.body;
    },

    async load(name: string) {
      if (!this.repoName) return;
      this.loading = true;
      this.filename = name;
      // Refresh schema in case theme changed
      await this.loadThemeSchema();

      try {
        const data = await (window as any).git.readArticle(this.repoName, name);
        if (typeof data === "string") {
          this.originalContent = data;
          const parsed = this.parseFrontmatter(data);
          this.metadata = parsed.metadata;
          this.body = parsed.body;
          this.content = data; // Keep sync
          this.checkOrphanedProps();
          
          window.dispatchEvent(
            new CustomEvent("article:content-changed", {
              detail: { filename: this.filename, content: this.body },
            })
          );
        } else if (data && data.error) {
          this.body = `Error loading file: ${data.error}`;
          this.originalContent = this.body;
        }
      } catch (e: any) {
        this.body = `Error: ${e.message}`;
        this.originalContent = this.body;
      } finally {
        this.loading = false;
      }
    },

    async save() {
      if (!this.repoName || !this.filename) return;
      this.saving = true;
      const fullContent = this.composeContent();
      
      try {
        const res = await (window as any).git.writeArticle(
          this.repoName,
          this.filename,
          fullContent
        );
        if (res && res.error) {
          alert(res.error);
        } else {
          this.originalContent = fullContent;
          this.content = fullContent;
          window.dispatchEvent(new Event("article:refresh"));
          
          // Notify themes to regenerate script.js with new content/metadata
          window.dispatchEvent(
            new CustomEvent("repo:files-updated", {
              detail: { repoName: this.repoName },
            })
          );
        }
      } catch (e: any) {
        alert("Save failed: " + e.message);
      } finally {
        this.saving = false;
      }
    },

    notifyChange() {
      if (!this.filename) return;
      // We notify with just the body for preview purposes, or full content?
      // Usually previewers expect the full content including frontmatter if they support it.
      // But if our previewer is simple, it might just want body.
      // Let's send full content so generators can use metadata.
      window.dispatchEvent(
        new CustomEvent("article:content-changed", {
          detail: { filename: this.filename, content: this.composeContent() },
        })
      );
    },

    insertMarkdown(prefix: string, suffix: string = "") {
      const textarea = document.querySelector('#editor-textarea') as HTMLTextAreaElement;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = this.body;
      const selection = text.substring(start, end);

      const newText = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
      
      this.body = newText;
      
      this.$nextTick(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        this.notifyChange();
      });
    },

    async handleDrop(e: DragEvent) {
      if (!this.repoName || !this.filename) return;
      
      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      this.loading = true;
      
      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const buffer = await file.arrayBuffer();
          
          const assetPath = await (window as any).git.saveAsset(
            this.repoName,
            this.filename,
            file.name,
            buffer
          );

          if (assetPath && typeof assetPath === 'string') {
            // Determine if image or video
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');
            
            let md = '';
            if (isImage) {
              md = `\n![${file.name}](${assetPath})\n`;
            } else if (isVideo) {
              md = `\n<video controls src="${assetPath}" width="100%"></video>\n`;
            } else {
              md = `\n[Download ${file.name}](${assetPath})\n`;
            }
            
            this.insertMarkdown(md);
          } else {
            console.error("Failed to save asset", assetPath);
          }
        }
      } catch (err) {
        console.error("Drop error", err);
        alert("Failed to upload file(s).");
      } finally {
        this.loading = false;
      }
    },

    async handleFieldFileSelect(e: Event, fieldName: string) {
        const input = e.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            await this.uploadFieldImage(input.files[0], fieldName);
        }
        input.value = ''; // Reset input
    },

    async handleFieldDrop(e: DragEvent, fieldName: string) {
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            await this.uploadFieldImage(files[0], fieldName);
        }
    },

    async uploadFieldImage(file: File, fieldName: string) {
        if (!this.repoName || !this.filename) return;
        if (!file.type.startsWith('image/')) {
            alert("Please select an image file.");
            return;
        }

        this.loading = true;
        try {
            const buffer = await file.arrayBuffer();
            const assetPath = await (window as any).git.saveAsset(
                this.repoName,
                this.filename,
                file.name,
                buffer
            );

            if (assetPath && typeof assetPath === 'string') {
                this.metadata[fieldName] = assetPath;
                this.notifyChange();
            }
        } catch (err: any) {
            alert("Failed to upload image: " + err.message);
        } finally {
            this.loading = false;
        }
    },
  };
}

(window as any).createArticleEditorLogic = articleEditorLogic;

const initArticleEditor = async () => {
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
};

window.addEventListener("workspace:mounted", initArticleEditor);
