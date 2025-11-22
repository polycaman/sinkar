(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};

const CommonCss = (config: any, p: any) => `
:root {
    --primary: ${p.primary};
    --secondary: ${p.secondary};
    --bg: ${p.bg};
    --surface: ${p.surface};
    --text: ${p.text};
    --font: ${config.fontFamily};
    --radius: ${config.borderRadius || '8px'};
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
* { box-sizing: border-box; }
body {
    font-family: var(--font);
    margin: 0;
    padding: 0;
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
}
a { color: var(--primary); text-decoration: none; transition: all 0.2s; }
a:hover { opacity: 0.8; }
img { max-width: 100%; height: auto; display: block; border-radius: var(--radius); }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
.loading, .error { text-align: center; padding: 4rem; }
.error { color: #ef4444; }
`;

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

(window as any).SinkarGenerators.Common = {
    CommonCss,
    CommonJsHelpers,
    CommonHtmlHead,
    CommonHtmlFooter
};

