(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.PortfolioTheme = (window as any).SinkarGenerators.PortfolioTheme || {};

(window as any).SinkarGenerators.PortfolioTheme.generateHtml = function(config: any): string {
    const title = config.siteTitle || "My Portfolio";
    const layout = config.layoutStyle || 'split';
    
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

    let bodyContent = '';
    
    if (layout === 'split') {
        bodyContent = `
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
    } else {
        // Grid or Minimal layout - Top Header
        bodyContent = `
<header class="top-header">
    <div class="container">
        <div class="header-flex">
            <h1><a href="index.html">${title}</a></h1>
            <nav>
                <a href="index.html" class="active">Work</a>
                <a href="#">About</a>
                <a href="#">Contact</a>
            </nav>
        </div>
        <p class="header-desc">${config.siteDescription}</p>
    </div>
</header>
<main id="view-container" class="container ${layout === 'minimal' ? 'layout-minimal' : 'layout-grid'}">
    <!-- Content injected here -->
</main>
<footer>
    <div class="container">
        &copy; ${new Date().getFullYear()} ${title}
    </div>
</footer>`;
    }

    return CommonHtmlHead(title, "portfolio") + bodyContent + CommonHtmlFooter;
};
