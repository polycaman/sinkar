function previewerLogic() {
  const generators = (window as any).SinkarGenerators;

  return {
    activeFilename: "",
    repoName: "",
    repoPath: "",
    content: "",
    rendered: "",
    themeId: "writer",
    
    async init() {
      this.repoName = localStorage.getItem("sinkar.repoName") || "";
      if (this.repoName) {
        this.repoPath = await (window as any).git.getRepoPath(this.repoName);
        this.loadTheme();
      }

      window.addEventListener("workspace:mounted", async () => {
        this.repoName = localStorage.getItem("sinkar.repoName") || "";
        if (this.repoName) {
          this.repoPath = await (window as any).git.getRepoPath(this.repoName);
          this.loadTheme();
        }
      });

      window.addEventListener("theme:changed", () => {
        this.loadTheme();
        this.updateRender();
      });

      window.addEventListener("article:open", (e: any) => {
        const { filename, repoName } = e.detail || {};
        if (repoName) this.repoName = repoName;
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

    async loadTheme() {
      if (!this.repoName) return;
      try {
        const content = await (window as any).git.readSiteFile(this.repoName, "swp/theme-config.json");
        if (content && typeof content === 'string') {
          const config = JSON.parse(content);
          if (config.themeId) this.themeId = config.themeId;
        }
      } catch (e) {
        console.log("Previewer: No theme config found, using default");
        this.themeId = "writer";
      }
    },

    parseFrontmatter(text: string) {
      const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      if (match) {
        const yamlText = match[1];
        const body = match[2];
        const metadata: any = {};
        
        yamlText.split(/\r?\n/).forEach(line => {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const key = parts[0].replace(/[\x00-\x1F\x7F-\x9F\u200B]/g, "").trim();
            const value = parts.slice(1).join(':').trim();
            if (key) metadata[key] = value;
          }
        });
        return { metadata, body };
      }
      return { metadata: {}, body: text };
    },

    fixAssetPaths(html: string) {
      if (!this.repoPath || !this.activeFilename) return html;
      
      // Convert Windows backslashes to forward slashes for URL
      const cleanRepoPath = this.repoPath.replace(/\\/g, '/');
      
      // Construct absolute path to the article's folder
      // Note: activeFilename is now the folder name in the new system
      const articleFolder = `${cleanRepoPath}/articles/${this.activeFilename}`;
      
      // Replace relative asset paths with file:// URLs
      // Matches src="assets/..." or href="assets/..." or (assets/...)
      
      const assetUrlPrefix = `file:///${articleFolder}/`;
      
      let fixed = html;
      fixed = fixed.replace(/src="assets\//g, `src="${assetUrlPrefix}assets/`);
      fixed = fixed.replace(/href="assets\//g, `href="${assetUrlPrefix}assets/`);
      fixed = fixed.replace(/\]\(assets\//g, `](${assetUrlPrefix}assets/`);
      
      // Also fix coverImage if it's in metadata (handled in render logic, but just in case)
      
      return fixed;
    },

    updateRender() {
      if (!this.content.trim()) {
        this.rendered = "<em class='text-muted'>Empty file</em>";
        return;
      }

      try {
        const { metadata, body } = this.parseFrontmatter(this.content);
        
        let htmlContent = "";
        if ((window as any).marked) {
          htmlContent = (window as any).marked.parse(body);
        } else {
          htmlContent = this.escapeHTML(body).replace(/\n/g, "<br/>");
        }

        // Fix paths in the body content
        htmlContent = this.fixAssetPaths(htmlContent);

        // Prepare metadata for template
        const title = metadata.title || this.activeFilename;
        
        // Fix cover image path
        let coverImage = metadata.coverImage || "";
        if (coverImage && !coverImage.startsWith('http') && !coverImage.startsWith('data:')) {
             // If it's relative like "assets/img.jpg"
             if (coverImage.startsWith('assets/')) {
                 const cleanRepoPath = this.repoPath.replace(/\\/g, '/');
                 coverImage = `file:///${cleanRepoPath}/articles/${this.activeFilename}/${coverImage}`;
             }
        }

        // Emulate Theme Structure
        if (this.themeId === 'store') {
            const price = metadata.price || '0.00';
            const currency = metadata.currency || 'USD';
            const stock = metadata.stock || '0';
            
            this.rendered = `
                <div class="p-3 border rounded bg-white">
                    <div class="row">
                        <div class="col-md-4">
                            ${coverImage ? `<img src="${coverImage}" class="img-fluid rounded mb-3" alt="${title}">` : '<div class="bg-light rounded d-flex align-items-center justify-content-center" style="height:200px"><i class="bi bi-box-seam fs-1 text-muted"></i></div>'}
                        </div>
                        <div class="col-md-8">
                            <h2 class="h4">${title}</h2>
                            <div class="fs-4 fw-bold text-primary mb-2">${currency} ${price}</div>
                            <div class="mb-3">
                                <span class="badge ${stock > 0 ? 'bg-success' : 'bg-secondary'}">${stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                            </div>
                            <button class="btn btn-primary mb-3" disabled>Add to Cart</button>
                            <div class="prose">
                                ${htmlContent}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (this.themeId === 'portfolio') {
            const client = metadata.client || 'Client Name';
            
            this.rendered = `
                <div class="p-3 border rounded bg-white">
                    ${coverImage ? `<div class="mb-4 rounded" style="height:300px; background:url('${coverImage}') center/cover"></div>` : ''}
                    <div class="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <div class="text-uppercase small text-muted tracking-wide">${client}</div>
                            <h1 class="h2 mb-0">${title}</h1>
                        </div>
                        ${metadata.projectUrl ? `<a href="#" class="btn btn-outline-dark btn-sm">Visit Site <i class="bi bi-arrow-up-right"></i></a>` : ''}
                    </div>
                    <div class="prose" style="max-width: 800px; margin: 0 auto;">
                        ${htmlContent}
                    </div>
                </div>
            `;
        } else if (this.themeId === 'landing') {
            this.rendered = `
                <div class="p-4 border rounded bg-white text-center">
                    ${metadata.icon ? `<div class="mb-3 text-primary"><i class="${metadata.icon} fs-1"></i></div>` : ''}
                    <h2 class="mb-3">${title}</h2>
                    <div class="prose mb-4 text-muted">
                        ${htmlContent}
                    </div>
                    ${metadata.ctaText ? `<button class="btn btn-primary btn-lg">${metadata.ctaText}</button>` : ''}
                </div>
            `;
        } else {
            // Writer / Default
            this.rendered = `
                <div class="p-4 bg-white border rounded">
                    ${coverImage ? `<img src="${coverImage}" class="img-fluid rounded mb-4 w-100" style="max-height:400px; object-fit:cover;">` : ''}
                    <h1 class="display-6 mb-3">${title}</h1>
                    ${metadata.tags ? `<div class="mb-4">${metadata.tags.split(',').map((t:string) => `<span class="badge bg-light text-dark me-1">#${t.trim()}</span>`).join('')}</div>` : ''}
                    <div class="prose">
                        ${htmlContent}
                    </div>
                </div>
            `;
        }

      } catch (e: any) {
        this.rendered = `<div class="alert alert-danger">Preview error: ${e.message}</div>`;
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

const initPreviewer = async () => {
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
};

window.addEventListener("workspace:mounted", initPreviewer);
