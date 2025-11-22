(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.Themes = (window as any).SinkarGenerators.Themes || {};

const LandingTheme = {
  id: "landing",

  generateHtml(config: any): string {
    const { CommonHtmlHead, CommonHtmlFooter } = (window as any).SinkarGenerators.Common;
    const title = config.siteTitle || "My Landing Page";
    const bodyContent = `
<header>
    <div class="container">
        <h1><a href="index.html">${title}</a></h1>
        <nav>
            <a href="index.html#features">Features</a>
            <a href="index.html#pricing">Pricing</a>
            <a href="#" class="btn-cta">Get Started</a>
        </nav>
    </div>
</header>
<div id="view-container">
    <!-- Content injected here -->
</div>
<footer>
    <div class="container">
        <p>&copy; ${new Date().getFullYear()} ${title}. All rights reserved.</p>
    </div>
</footer>`;
    return CommonHtmlHead(title, "landing") + bodyContent + CommonHtmlFooter;
  },

  generateCss(config: any): string {
    const { CommonCss } = (window as any).SinkarGenerators.Common;
    const PALETTES = (window as any).SinkarGenerators.PALETTES;
    const p = PALETTES[config.paletteId] || PALETTES.default;
    
    const themeCss = `
        header { padding: 2rem 0; position: absolute; width: 100%; top: 0; left: 0; z-index: 10; }
        header .container { display: flex; justify-content: space-between; align-items: center; }
        header h1 a { color: var(--text); font-weight: 800; font-size: 1.5rem; }
        header nav a { margin-left: 2rem; color: var(--text); font-weight: 500; }
        .btn-cta { 
            background: var(--primary); color: white !important; padding: 0.75rem 1.5rem; 
            border-radius: 99px; transition: transform 0.2s; 
        }
        .btn-cta:hover { transform: scale(1.05); }

        #hero { 
            padding: 10rem 0 6rem; text-align: center; 
            background: radial-gradient(circle at top center, color-mix(in srgb, var(--primary), transparent 92%), transparent 70%);
        }
        #hero h2 { font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; margin-bottom: 1.5rem; color: var(--text); letter-spacing: -0.03em; }
        #hero p { font-size: 1.25rem; max-width: 600px; margin: 0 auto 2.5rem; opacity: 0.8; }
        .hero-btns { display: flex; gap: 1rem; justify-content: center; }
        .btn-primary { background: var(--text); color: var(--bg); padding: 1rem 2rem; border-radius: var(--radius); font-weight: 600; }
        .btn-secondary { background: transparent; border: 1px solid var(--text); color: var(--text); padding: 1rem 2rem; border-radius: var(--radius); font-weight: 600; }

        #features { padding: 6rem 0; background: var(--surface); }
        #features h3 { text-align: center; font-size: 2rem; margin-bottom: 4rem; }
        #article-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem; }
        .article-card { padding: 2rem; border-radius: var(--radius); background: var(--bg); border: 1px solid rgba(0,0,0,0.05); }
        .article-card h4 { font-size: 1.25rem; margin-bottom: 1rem; }
        .article-card h4 a { color: var(--text); }
        .article-card small { display: none; } /* Hide dates for landing page look */
        
        /* Feature Detail */
        .feature-detail { max-width: 800px; margin: 4rem auto; padding: 0 1.5rem; }
        .feature-detail h1 { font-size: 3rem; text-align: center; margin-bottom: 2rem; }
        .feature-detail-content { font-size: 1.2rem; line-height: 1.8; }

        footer { padding: 4rem 0; text-align: center; opacity: 0.6; font-size: 0.9rem; }
    `;
    return CommonCss(config, p) + themeCss;
  },

  generateJs(config: any, preloadedArticles: any[] | null): string {
    const { CommonJsHelpers } = (window as any).SinkarGenerators.Common;
    const description = config.siteDescription.replace(/"/g, '\\"');
    const articlesJson = preloadedArticles ? JSON.stringify(preloadedArticles) : 'null';

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
        <section id="hero">
            <div class="container">
                <h2>\${SITE_DESC}</h2>
                <p>The best solution for your needs. Fast, reliable, and secure.</p>
                <div class="hero-btns">
                    <a href="#features" class="btn-primary">Start Free Trial</a>
                    <a href="#pricing" class="btn-secondary">Learn More</a>
                </div>
            </div>
        </section>
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
  }
};

(window as any).SinkarGenerators.Themes.landing = LandingTheme;

