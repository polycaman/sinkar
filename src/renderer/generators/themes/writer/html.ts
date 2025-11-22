(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.WriterTheme = (window as any).SinkarGenerators.WriterTheme || {};

(window as any).SinkarGenerators.WriterTheme.generateHtml = function(config: any): string {
    const title = config.siteTitle || "My Blog";
    const layout = config.layoutStyle || 'default';
    
    const CommonHtmlHead = (title: string, themeId: string) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link rel="stylesheet" href="swp/style.css">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="theme-${themeId}">`;

    const CommonHtmlFooter = `
<script src="swp/script.js"></script>
</body>
</html>`;

    const extraPages = config.extraPages || [];
    const navLinks = `
        <a href="index.html">Home</a>
        ${extraPages.map((p: any) => {
            const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return `<a href="?page=${slug}">${p.title}</a>`;
        }).join('\n')}
    `;
    
    let bodyContent = '';
    
    if (layout === 'sidebar') {
        bodyContent = `
<div class="layout-sidebar">
    <aside class="sidebar">
        <div class="sidebar-sticky">
            <h1><a href="index.html">${title}</a></h1>
            <p class="subtitle">${config.siteDescription}</p>
            <nav>
                ${navLinks}
            </nav>
            <footer>&copy; ${new Date().getFullYear()}</footer>
        </div>
    </aside>
    <main id="view-container">
        <!-- Content injected here -->
    </main>
</div>`;
    } else {
        bodyContent = `
<header>
    <div class="container">
        <h1><a href="index.html">${title}</a></h1>
        <p class="subtitle">${config.siteDescription}</p>
        <nav style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1.5rem;">
            ${navLinks}
        </nav>
    </div>
</header>
<main id="view-container" class="container ${layout === 'grid' ? 'layout-grid' : ''}">
    <!-- Content injected here -->
</main>
<footer>
    <p>&copy; ${new Date().getFullYear()} ${title}</p>
</footer>`;
    }

    return CommonHtmlHead(title, "writer") + bodyContent + CommonHtmlFooter;
};
