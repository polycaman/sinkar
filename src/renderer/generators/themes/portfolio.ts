(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.Themes = (window as any).SinkarGenerators.Themes || {};

const PortfolioTheme = {
  id: "portfolio",

  generateHtml(config: any): string {
    const { CommonHtmlHead, CommonHtmlFooter } = (window as any).SinkarGenerators.Common;
    const title = config.siteTitle || "My Portfolio";
    const bodyContent = `
<div class="layout-split">
    <aside>
        <div class="sticky-content">
            <h1><a href="index.html">${title}</a></h1>
            <p>${config.siteDescription}</p>
            <nav>
                <a href="index.html" class="active">Work</a>
                <a href="#">About</a>
                <a href="#">Contact</a>
            </nav>
            <footer>&copy; ${new Date().getFullYear()}</footer>
        </div>
    </aside>
    <main id="view-container">
        <!-- Content injected here -->
    </main>
</div>`;
    return CommonHtmlHead(title, "portfolio") + bodyContent + CommonHtmlFooter;
  },

  generateCss(config: any): string {
    const { CommonCss } = (window as any).SinkarGenerators.Common;
    const PALETTES = (window as any).SinkarGenerators.PALETTES;
    const p = PALETTES[config.paletteId] || PALETTES.default;
    
    const themeCss = `
        body { overflow-x: hidden; }
        .layout-split { display: flex; min-height: 100vh; }
        aside { 
            width: 300px; background: var(--surface); border-right: 1px solid rgba(0,0,0,0.05);
            padding: 3rem 2rem; flex-shrink: 0;
        }
        .sticky-content { position: sticky; top: 3rem; }
        aside h1 { font-size: 1.5rem; margin: 0 0 1rem; font-weight: 800; }
        aside h1 a { color: var(--text); }
        aside p { color: var(--text); opacity: 0.7; margin-bottom: 3rem; }
        aside nav { display: flex; flex-direction: column; gap: 1rem; }
        aside nav a { color: var(--text); opacity: 0.5; font-weight: 500; }
        aside nav a.active, aside nav a:hover { opacity: 1; color: var(--primary); }
        aside footer { margin-top: 4rem; font-size: 0.8rem; opacity: 0.4; }

        main { flex-grow: 1; padding: 3rem; background: var(--bg); }
        #article-list { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 3rem; 
        }
        .article-card { group; }
        .project-thumb {
            aspect-ratio: 16/10; background: color-mix(in srgb, var(--secondary), transparent 90%);
            border-radius: var(--radius); margin-bottom: 1.5rem; overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            font-size: 2rem; color: var(--secondary); transition: transform 0.4s;
        }
        .article-card:hover .project-thumb { transform: scale(1.02); }
        .article-card h4 { font-size: 1.5rem; margin: 0 0 0.5rem; }
        .article-card h4 a { color: var(--text); }
        .article-card small { text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem; color: var(--primary); font-weight: bold; }

        /* Project Detail */
        .project-detail-header { margin-bottom: 3rem; }
        .project-detail-header h1 { font-size: 3rem; margin: 0 0 1rem; line-height: 1.1; }
        .project-meta { display: flex; gap: 2rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.6; }
        .project-hero-image { 
            width: 100%; height: 400px; background: color-mix(in srgb, var(--secondary), transparent 90%);
            border-radius: var(--radius); margin-bottom: 3rem;
            display: flex; align-items: center; justify-content: center; font-size: 3rem; color: var(--secondary);
        }
        .project-content { max-width: 800px; font-size: 1.2rem; line-height: 1.8; }

        @media (max-width: 900px) {
            .layout-split { flex-direction: column; }
            aside { width: 100%; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 2rem; }
            .sticky-content { position: static; }
            main { padding: 2rem; }
        }
    `;
    return CommonCss(config, p) + themeCss;
  },

  generateJs(config: any, preloadedArticles: any[] | null): string {
    const { CommonJsHelpers } = (window as any).SinkarGenerators.Common;
    const description = config.siteDescription.replace(/"/g, '\\"');
    const articlesJson = preloadedArticles ? JSON.stringify(preloadedArticles) : 'null';

    return `
const CURRENT_THEME = "portfolio";
const SITE_DESC = "${description}";
const PRELOADED_ARTICLES = ${articlesJson};

${CommonJsHelpers}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article');
    
    if (article) {
        await renderArticle(article);
    } else {
        await renderHome();
    }
}

async function renderArticle(filename) {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        let res = await fetch('articles/' + filename + '/index.md');
        let isFolder = true;
        
        if (!res.ok) {
            res = await fetch('articles/' + filename);
            isFolder = false;
        }
        
        if (!res.ok) throw new Error('Content not found');
        const rawText = await res.text();
        
        const { metadata, body } = parseFrontmatter(rawText);
        
        let processedBody = body;
        if (isFolder) {
            const assetPrefix = \`articles/\${filename}/\`;
            processedBody = processedBody.replace(/\\]\\(assets\\//g, \`](\${assetPrefix}assets/\`);
            processedBody = processedBody.replace(/src="assets\\//g, \`src="\${assetPrefix}assets/\`);
        }
        
        if (metadata.coverImage) metadata.coverImage = fixAssetPath(metadata.coverImage, filename);

        const content = typeof marked !== 'undefined' 
            ? marked.parse(processedBody)
            : processedBody.replace(/\\n/g, '<br>');
            
        const title = metadata.title || filename.replace('.md', '').replace(/-/g, ' ');
        const client = metadata.client || 'Unknown Client';

        const html = \`
            <div class="project-detail">
                <div class="project-hero-image" style="\${metadata.projectUrl ? 'cursor:pointer' : ''}" onclick="\${metadata.projectUrl ? \`window.open('\${metadata.projectUrl}')\` : ''}">
                    <i class="fas fa-image"></i>
                </div>
                <div class="project-detail-header">
                    <div class="project-meta">
                        \${client} / \${metadata.projectDate || '2024'}
                        \${metadata.role ? \` • \${metadata.role}\` : ''}
                    </div>
                    <h1>\${title}</h1>
                    \${metadata.projectUrl ? \`<a href="\${metadata.projectUrl}" target="_blank" class="btn-visit">Visit Project <i class="fas fa-external-link-alt"></i></a>\` : ''}
                </div>
                <div class="project-content">
                    \${content}
                </div>
                <div style="margin-top: 4rem;">
                    <a href="index.html">&larr; Back to Work</a>
                </div>
            </div>
        \`;

        container.innerHTML = html;
        window.scrollTo(0, 0);
    } catch (e) {
        container.innerHTML = \`<div class="error">Error loading content: \${e.message}</div>\`;
    }
}

async function renderHome() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div id="article-list">Loading...</div>';
    await loadArticlesList();
}

async function loadArticlesList() {
    const list = document.getElementById('article-list');
    if (!list) return;

    let allArticles = [];

    if (PRELOADED_ARTICLES) {
        allArticles = PRELOADED_ARTICLES;
        renderArticles(allArticles);
        return;
    }

    if (window.location.protocol === 'file:') {
        list.innerHTML = \`
            <div style="padding: 1rem; background: #fff3cd; color: #856404; border-radius: 4px; margin-bottom: 1rem;">
                <strong>Local Preview Warning:</strong> Browsers block loading external files (articles.json) via file:// protocol.
                Please push to GitHub or use a local server to view content.
            </div>
        \`;
        return;
    }

    try {
        const res = await fetch('articles.json');
        if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);
        allArticles = await res.json();
        renderArticles(allArticles);
    } catch (e) {
        console.error("Error loading articles:", e);
        list.innerHTML = '<div class="error">Could not load content list.</div>';
    }

    function renderArticles(articles) {
        if (!articles || articles.length === 0) {
            list.innerHTML = '<p style="text-align:center; opacity:0.6;">No content found.</p>';
            return;
        }
        
        list.innerHTML = articles.map(a => {
            const coverImage = fixAssetPath(a.coverImage, a.file);
            
            return \`
                <div class="article-card">
                    <a href="?article=\${a.file}" class="project-thumb" style="\${coverImage ? \`background:url('\${coverImage}') center/cover\` : ''}">
                        \${!coverImage ? '<i class="fas fa-image"></i>' : ''}
                    </a>
                    <h4><a href="?article=\${a.file}">\${a.title}</a></h4>
                    <small>\${a.client || 'Project'} / \${new Date(a.date).getFullYear()}</small>
                </div>
            \`;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', init);
`;
  }
};

(window as any).SinkarGenerators.Themes.portfolio = PortfolioTheme;

