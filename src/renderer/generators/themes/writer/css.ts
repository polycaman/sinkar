(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.WriterTheme = (window as any).SinkarGenerators.WriterTheme || {};

(window as any).SinkarGenerators.WriterTheme.generateCss = function(config: any): string {
    const PALETTES = (window as any).SinkarGenerators.PALETTES;
    const p = PALETTES[config.paletteId] || PALETTES.default;
    const layout = config.layoutStyle || 'default';
    const variant = config.designVariant || 'default';

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
h1, h2, h3, h4, h5, h6 { margin: 0 0 1rem; line-height: 1.2; font-weight: 700; color: var(--text); }
p { margin: 0 0 1.5rem; }
a { color: var(--primary); text-decoration: none; transition: all 0.2s; }
a:hover { opacity: 0.8; }
img { max-width: 100%; height: auto; display: block; border-radius: var(--radius); }
button, .btn { font-family: inherit; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
.loading, .error { text-align: center; padding: 4rem; }
.error { color: #ef4444; }
.text-center { text-align: center; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mb-5 { margin-bottom: 3rem; }
`;
    
    let variantCss = '';
    if (variant === 'flat') {
        variantCss = `
            :root { --shadow: none; --shadow-sm: none; --shadow-lg: none; }
            .article-card { border: 1px solid var(--text); box-shadow: none !important; }
            .btn, button { border: 1px solid var(--text); box-shadow: none !important; }
        `;
    } else if (variant === 'glass') {
        variantCss = `
            .article-card { 
                background: rgba(255, 255, 255, 0.7); 
                backdrop-filter: blur(12px); 
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
            }
            header, aside { background: rgba(255, 255, 255, 0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
            /* Dark mode adjustment if bg is dark */
            @media (prefers-color-scheme: dark) {
                .article-card { background: rgba(0, 0, 0, 0.4); border-color: rgba(255,255,255,0.1); color: white; }
                header, aside { background: rgba(0, 0, 0, 0.3); }
            }
        `;
    } else if (variant === 'neumorphic') {
        variantCss = `
            .article-card {
                background: var(--bg);
                box-shadow: 9px 9px 16px rgba(0,0,0,0.06), -9px -9px 16px rgba(255,255,255, 0.6);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 16px;
            }
            .btn, button {
                box-shadow: 5px 5px 10px rgba(0,0,0,0.05), -5px -5px 10px rgba(255,255,255, 0.6);
                border: none;
            }
        `;
    } else if (variant === 'retro') {
        variantCss = `
            body { font-family: 'Courier New', Courier, monospace; }
            .article-card { border: 2px solid var(--text); box-shadow: 6px 6px 0 var(--text); border-radius: 0; margin-bottom: 5rem; }
            .article-card:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0 var(--text); }
            header h1 { text-transform: uppercase; letter-spacing: 2px; border-bottom: 4px double var(--text); display: inline-block; padding-bottom: 0.5rem; }
            .badge { border: 1px solid var(--text); background: transparent !important; color: var(--text) !important; border-radius: 0; }
        `;
    }

    const themeCss = `
        /* Base Layout */
        header { padding: 6rem 0 3rem; text-align: center; }
        header h1 { font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 800; margin-bottom: 1rem; letter-spacing: -0.03em; line-height: 1.1; }
        header h1 a { color: var(--text); }
        .subtitle { font-size: 1.25rem; opacity: 0.7; max-width: 600px; margin: 0 auto; line-height: 1.6; }
        
        main { max-width: 800px; margin: 0 auto; padding: 0 1.5rem 4rem; }
        
        /* Sidebar Layout */
        .layout-sidebar { display: flex; min-height: 100vh; }
        .sidebar { width: 320px; background: var(--surface); padding: 4rem 2.5rem; border-right: 1px solid rgba(0,0,0,0.06); flex-shrink: 0; }
        .sidebar-sticky { position: sticky; top: 3rem; }
        .sidebar h1 { font-size: 1.75rem; margin-bottom: 1rem; }
        .sidebar nav { display: flex; flex-direction: column; gap: 0.75rem; margin: 2.5rem 0; }
        .sidebar nav a { color: var(--text); font-weight: 500; font-size: 1.1rem; opacity: 0.7; }
        .sidebar nav a:hover { opacity: 1; color: var(--primary); transform: translateX(5px); }
        .layout-sidebar main { flex-grow: 1; max-width: 900px; padding: 5rem 4rem; margin: 0; }
        
        @media(max-width: 900px) { 
            .layout-sidebar { flex-direction: column; } 
            .sidebar { width: 100%; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.06); padding: 2rem; }
            .sidebar-sticky { position: static; }
            .layout-sidebar main { padding: 3rem 1.5rem; }
        }

        /* Grid Layout */
        .layout-grid #article-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2.5rem; }
        .layout-grid { max-width: 1400px; }
        
        /* Cards */
        .article-card { 
            margin-bottom: ${layout === 'grid' ? '0' : '5rem'}; 
            background: var(--surface); 
            border-radius: var(--radius); 
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            overflow: hidden;
        }
        ${layout === 'grid' ? '.article-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }' : ''}
        
        .article-card h4 { font-size: 1.8rem; margin: 0 0 0.75rem; line-height: 1.3; font-weight: 700; }
        .article-card h4 a { color: var(--text); text-decoration: none; background-image: linear-gradient(var(--primary), var(--primary)); background-size: 0% 2px; background-repeat: no-repeat; background-position: left bottom; transition: background-size 0.3s; }
        .article-card h4 a:hover { background-size: 100% 2px; }
        .article-card small { font-size: 0.95rem; color: var(--text); opacity: 0.6; display: block; margin-bottom: 0.5rem; }
        
        /* Article Content Typography */
        .article-content { font-size: 1.25rem; line-height: 1.8; color: var(--text); max-width: 100%; }
        .article-content h1 { font-size: 2.5rem; margin-top: 3rem; margin-bottom: 1.5rem; }
        .article-content h2 { font-size: 2rem; margin-top: 2.5rem; margin-bottom: 1.25rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(0,0,0,0.1); }
        .article-content h3 { font-size: 1.5rem; margin-top: 2rem; margin-bottom: 1rem; }
        .article-content p { margin-bottom: 1.75rem; }
        .article-content ul, .article-content ol { margin-bottom: 1.75rem; padding-left: 1.5rem; }
        .article-content li { margin-bottom: 0.5rem; }
        .article-content blockquote { border-left: 4px solid var(--primary); padding-left: 1.5rem; margin: 2rem 0; font-style: italic; opacity: 0.8; font-size: 1.35rem; }
        .article-content img { margin: 2rem 0; width: 100%; box-shadow: var(--shadow); }
        .article-content pre { background: #1e1e1e; color: #d4d4d4; padding: 1.5rem; border-radius: var(--radius); overflow-x: auto; margin: 2rem 0; font-size: 0.9em; }
        .article-content code { background: rgba(0,0,0,0.05); padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; font-family: monospace; }
        .article-content pre code { background: transparent; padding: 0; }

        ${variantCss}
    `;
    return CommonCss(config, p) + themeCss;
};
