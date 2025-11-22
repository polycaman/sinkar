(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.LandingTheme = (window as any).SinkarGenerators.LandingTheme || {};

(window as any).SinkarGenerators.LandingTheme.generateJs = function(config: any, preloadedArticles: any[] | null): string {
    const description = config.siteDescription.replace(/"/g, '\\"');
    const articlesJson = preloadedArticles ? JSON.stringify(preloadedArticles) : 'null';
    const layout = config.layoutStyle || 'default';

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

    let heroHtml = '';
    if (layout === 'split') {
        heroHtml = `
        <section id="hero">
            <div class="container">
                <div class="hero-content">
                    <h2>\${SITE_DESC}</h2>
                    <p>The best solution for your needs. Fast, reliable, and secure.</p>
                    <div class="hero-btns">
                        <a href="#features" class="btn-primary">Start Free Trial</a>
                        <a href="#pricing" class="btn-secondary">Learn More</a>
                    </div>
                </div>
                <div class="hero-image-placeholder">
                    <i class="fas fa-rocket"></i>
                </div>
            </div>
        </section>`;
    } else {
        heroHtml = `
        <section id="hero">
            <div class="container">
                <h2>\${SITE_DESC}</h2>
                <p>The best solution for your needs. Fast, reliable, and secure.</p>
                <div class="hero-btns">
                    <a href="#features" class="btn-primary">Start Free Trial</a>
                    <a href="#pricing" class="btn-secondary">Learn More</a>
                </div>
            </div>
        </section>`;
    }

    return `
const CURRENT_THEME = "landing";
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
        const ctaText = metadata.ctaText || 'Get Started';
        const ctaLink = metadata.ctaLink || '#';

        const html = \`
            <div class="feature-detail">
                <div class="text-center mb-5">
                    \${metadata.icon ? \`<i class="\${metadata.icon} fa-3x mb-3 text-primary"></i>\` : ''}
                    <h1>\${title}</h1>
                </div>
                <div class="feature-detail-content">
                    \${content}
                </div>
                <div style="text-align: center; margin-top: 3rem;">
                    <a href="\${ctaLink}" class="btn-cta">\${ctaText}</a>
                    <br><br>
                    <a href="index.html" class="text-muted">&larr; Back to Home</a>
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
    container.innerHTML = \`
        ${heroHtml}
        <section id="features">
            <div class="container">
                <h3>Latest Updates & Features</h3>
                <div id="article-list" class="features-grid">Loading features...</div>
            </div>
        </section>
    \`;
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
                    \${coverImage ? \`<div class="mb-3"><img src="\${coverImage}" style="max-width:100%; height:auto; border-radius:4px;"></div>\` : \`<div class="mb-3 text-primary"><i class="\${a.icon || 'fas fa-star'} fa-2x"></i></div>\`}
                    <h4><a href="?article=\${a.file}">\${a.title}</a></h4>
                    <p>Click to read more about this feature.</p>
                    <a href="?article=\${a.file}" style="font-weight:bold; font-size:0.9rem;">Read More &rarr;</a>
                </div>
            \`;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', init);
`;
};
