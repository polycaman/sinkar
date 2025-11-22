(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.StoreTheme = (window as any).SinkarGenerators.StoreTheme || {};

(window as any).SinkarGenerators.StoreTheme.generateHtml = function(config: any): string {
    const title = config.siteTitle || "My Site";
    
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

    const bodyContent = `
<header>
    <div class="header-inner">
        <h1><a href="index.html">${title}</a></h1>
        <nav>
            <a href="index.html">Shop</a>
            <a href="?view=cart" id="nav-cart-count">Cart (0)</a>
        </nav>
    </div>
</header>
<div id="view-container">
    <!-- Content injected here -->
</div>`;
    return CommonHtmlHead(title, "store") + bodyContent + CommonHtmlFooter;
};
