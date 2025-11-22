(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.Themes = (window as any).SinkarGenerators.Themes || {};

const WriterTheme = {
  id: "writer",

  generateHtml(config: any): string {
    const { CommonHtmlHead, CommonHtmlFooter } = (window as any).SinkarGenerators.Common;
    const title = config.siteTitle || "My Blog";
    const bodyContent = `
<header>
    <div class="container">
        <h1><a href="index.html">${title}</a></h1>
        <p class="subtitle">${config.siteDescription}</p>
    </div>
</header>
<main id="view-container" class="container">
    <!-- Content injected here -->
</main>
<footer>
    <p>&copy; ${new Date().getFullYear()} ${title}</p>
</footer>`;
    return CommonHtmlHead(title, "writer") + bodyContent + CommonHtmlFooter;
  },

  generateCss(config: any): string {
    const { CommonCss } = (window as any).SinkarGenerators.Common;
    const PALETTES = (window as any).SinkarGenerators.PALETTES;
    const p = PALETTES[config.paletteId] || PALETTES.default;
    
    const themeCss = `
        header { padding: 4rem 0 2rem; text-align: center; }
        header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; letter-spacing: -0.03em; }
        header h1 a { color: var(--text); }
        .subtitle { font-size: 1.1rem; opacity: 0.6; max-width: 500px; margin: 0 auto; }
        
        main { max-width: 720px; margin: 0 auto; padding: 0 1.5rem; }
        .article-card { margin-bottom: 4rem; }
        .article-card h4 { font-size: 1.75rem; margin: 0 0 0.5rem; line-height: 1.2; }
        .article-card h4 a { color: var(--text); }
        .article-card h4 a:hover { color: var(--primary); }
        .article-card small { font-size: 0.9rem; color: var(--text); opacity: 0.5; }
        
        .article-content { font-size: 1.2rem; line-height: 1.8; color: var(--text); }
        .article-content h1, .article-content h2 { margin-top: 2em; letter-spacing: -0.02em; }
        .article-content p { margin-bottom: 1.5em; }
    `;
    return CommonCss(config, p) + themeCss;
  },

  generateJs(config: any, preloadedArticles: any[] | null): string {
    const { CommonJsHelpers } = (window as any).SinkarGenerators.Common;
    const description = config.siteDescription.replace(/"/g, '\\"');
    const articlesJson = preloadedArticles ? JSON.stringify(preloadedArticles) : 'null';

    return `
const CURRENT_THEME = "writer";
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

        const html = \`
            <article class="article-content">
                <h1>\${title}</h1>
                \${metadata.coverImage ? \`<img src="\${metadata.coverImage}" alt="Cover" style="width:100%; border-radius:8px; margin-bottom:2rem;">\` : ''}
                \${metadata.tags ? \`<div class="tags mb-3">\${metadata.tags.split(',').map(t => \`<span class="badge bg-light text-dark me-1">#\${t.trim()}</span>\`).join('')}</div>\` : ''}
                \${content}
            </article>
            <div style="margin-top: 3rem; text-align: center;">
                <a href="index.html" style="opacity: 0.6;">&larr; Back to Home</a>
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
            const date = new Date(a.date).toLocaleDateString();
            const coverImage = fixAssetPath(a.coverImage, a.file);
            
            return \`
                <div class="article-card">
                    \${coverImage ? \`<div class="card-img-top" style="height:150px; background:url('\${coverImage}') center/cover"></div>\` : ''}
                    <div class="p-3">
                        <h4><a href="?article=\${a.file}">\${a.title}</a></h4>
                        <small>\${date}</small>
                        \${a.tags ? \`<div class="mt-2 small text-muted">#\${a.tags.split(',')[0]}</div>\` : ''}
                    </div>
                </div>
            \`;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', init);
`;
  }
};

(window as any).SinkarGenerators.Themes.writer = WriterTheme;

