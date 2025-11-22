(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.WriterTheme = (window as any).SinkarGenerators.WriterTheme || {};

(window as any).SinkarGenerators.WriterTheme.generateJs = function(config: any, preloadedArticles: any[] | null): string {
    const description = config.siteDescription.replace(/"/g, '\\"');
    const articlesJson = preloadedArticles ? JSON.stringify(preloadedArticles) : 'null';
    const extraPagesJson = JSON.stringify(config.extraPages || []);

    const CommonJsHelpers = `
function fixAssetPath(path, articleFilename) {
    if (!path) return path;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    
    // If path is relative "assets/..." and article is a folder (no .md extension)
    if (path.startsWith('assets/') && !articleFilename.endsWith('.md')) {
        return 'articles/' + articleFilename + '/' + path;
    }
    return path;
}

function parseFrontmatter(text) {
    const match = text.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---\\r?\\n([\\s\\S]*)$/);
    if (match) {
        const yamlText = match[1];
        const body = match[2];
        const metadata = {};
        
        yamlText.split(/\\r?\\n/).forEach(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
                const key = parts[0].replace(/[\\x00-\\x1F\\x7F-\\x9F\\u200B]/g, "").trim();
                const value = parts.slice(1).join(':').trim();
                if (key) {
                    metadata[key] = value;
                }
            }
        });
        return { metadata, body };
    }
    return { metadata: {}, body: text };
}
`;

    return `
const CURRENT_THEME = "writer";
const SITE_DESC = "${description}";
const PRELOADED_ARTICLES = ${articlesJson};
const EXTRA_PAGES = ${extraPagesJson};

${CommonJsHelpers}

async function init() {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article');
    const page = params.get('page');
    
    if (page) {
        await renderPage(page);
    } else if (article) {
        await renderArticle(article);
    } else {
        await renderHome();
    }
}

async function renderPage(slug) {
    const container = document.getElementById('view-container');
    const pageData = EXTRA_PAGES.find(p => p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
    
    if (!pageData) {
        container.innerHTML = '<div class="error">Page not found</div>';
        return;
    }

    const content = typeof marked !== 'undefined' 
        ? marked.parse(pageData.content)
        : pageData.content.replace(/\\n/g, '<br>');

    const html = \`
        <article class="article-content">
            <h1>\${pageData.title}</h1>
            \${content}
        </article>
        <div style="margin-top: 3rem; text-align: center;">
            <a href="index.html" style="opacity: 0.6;">&larr; Back to Home</a>
        </div>
    \`;
    
    container.innerHTML = html;
    window.scrollTo(0, 0);
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
};
