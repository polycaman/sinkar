(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.PortfolioTheme = (window as any).SinkarGenerators.PortfolioTheme || {};

(window as any).SinkarGenerators.PortfolioTheme.generateCss = function(config: any): string {
    const PALETTES = (window as any).SinkarGenerators.PALETTES;
    const p = PALETTES[config.paletteId] || PALETTES.default;
    const layout = config.layoutStyle || 'split';
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
    if (variant === 'dark-mode') {
        // Override palette vars for dark mode
        variantCss = `
            :root { --bg: #111; --text: #eee; --surface: #222; --primary: ${p.primary}; --secondary: ${p.secondary}; }
            body { background: var(--bg); color: var(--text); }
            .article-card { border-color: rgba(255,255,255,0.1); }
        `;
    } else if (variant === 'minimal') {
        variantCss = `
            .project-thumb { display: none; }
            .article-card { 
                border-bottom: 1px solid rgba(0,0,0,0.1); 
                padding-bottom: 2rem; 
                margin-bottom: 2rem; 
                display: flex; 
                justify-content: space-between; 
                align-items: baseline;
            }
            .article-card h4 { font-size: 2.5rem; margin: 0; font-weight: 300; }
            .article-card small { font-size: 1rem; opacity: 0.6; font-weight: normal; }
            .article-card:hover h4 a { color: var(--primary); padding-left: 1rem; }
            .article-card h4 a { transition: all 0.3s; }
            @media(max-width: 600px) { .article-card { flex-direction: column; gap: 0.5rem; } }
        `;
    }

    const themeCss = `
        body { overflow-x: hidden; }
        
        /* Split Layout */
        .layout-split { display: flex; min-height: 100vh; }
        .layout-split aside { 
            width: 350px; background: var(--surface); border-right: 1px solid rgba(0,0,0,0.05);
            padding: 4rem 3rem; flex-shrink: 0; display: flex; flex-direction: column;
        }
        .sticky-content { position: sticky; top: 4rem; }
        aside h1 { font-size: 2rem; margin: 0 0 1.5rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1; }
        aside h1 a { color: var(--text); }
        aside p { color: var(--text); opacity: 0.7; margin-bottom: 4rem; font-size: 1.1rem; line-height: 1.6; }
        aside nav { display: flex; flex-direction: column; gap: 1.2rem; }
        aside nav a { color: var(--text); opacity: 0.5; font-weight: 600; font-size: 1.1rem; letter-spacing: 0.05em; text-transform: uppercase; }
        aside nav a.active, aside nav a:hover { opacity: 1; color: var(--primary); padding-left: 10px; }
        aside footer { margin-top: auto; padding-top: 4rem; font-size: 0.85rem; opacity: 0.4; }

        .layout-split main { flex-grow: 1; padding: 4rem 5rem; background: var(--bg); }
        
        /* Top Header Layouts */
        .top-header { padding: 3rem 0; margin-bottom: 4rem; border-bottom: 1px solid rgba(0,0,0,0.05); background: var(--surface); }
        .header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .top-header h1 { font-size: 2rem; font-weight: 800; margin: 0; }
        .top-header h1 a { color: var(--text); }
        .top-header nav { display: flex; gap: 2.5rem; }
        .top-header nav a { color: var(--text); font-weight: 600; opacity: 0.6; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; }
        .top-header nav a:hover { opacity: 1; color: var(--primary); }
        .header-desc { opacity: 0.6; max-width: 600px; font-size: 1.1rem; }
        
        /* Grid & Minimal Layouts */
        .layout-grid #article-list { 
            display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 4rem 3rem; 
        }
        .layout-minimal #article-list {
            display: flex; flex-direction: column; gap: 3rem; max-width: 900px; margin: 0 auto;
        }

        /* Cards */
        .article-card { position: relative; }
        .project-thumb {
            aspect-ratio: 4/3; background: color-mix(in srgb, var(--secondary), transparent 90%);
            border-radius: var(--radius); margin-bottom: 1.5rem; overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            font-size: 3rem; color: var(--secondary); transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            box-shadow: var(--shadow-sm);
        }
        .article-card:hover .project-thumb { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .article-card h4 { font-size: 1.75rem; margin: 0 0 0.5rem; font-weight: 700; letter-spacing: -0.02em; }
        .article-card h4 a { color: var(--text); }
        .article-card small { text-transform: uppercase; letter-spacing: 1.5px; font-size: 0.8rem; color: var(--primary); font-weight: 700; opacity: 0.9; }

        /* Project Detail */
        .project-detail-header { margin-bottom: 4rem; text-align: center; max-width: 800px; margin-left: auto; margin-right: auto; }
        .project-detail-header h1 { font-size: clamp(2.5rem, 5vw, 4rem); margin: 0 0 1.5rem; line-height: 1.1; font-weight: 800; }
        .project-meta { display: flex; gap: 2rem; justify-content: center; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.6; margin-bottom: 2rem; }
        .project-hero-image { 
            width: 100%; height: 60vh; min-height: 400px; background: color-mix(in srgb, var(--secondary), transparent 90%);
            border-radius: var(--radius); margin-bottom: 4rem;
            display: flex; align-items: center; justify-content: center; font-size: 4rem; color: var(--secondary);
            overflow: hidden;
        }
        .project-content { max-width: 800px; margin: 0 auto; font-size: 1.25rem; line-height: 1.8; color: var(--text); }
        .project-content img { margin: 3rem 0; width: 100%; border-radius: var(--radius); box-shadow: var(--shadow); }
        .project-content p { margin-bottom: 2rem; }

        @media (max-width: 900px) {
            .layout-split { flex-direction: column; }
            .layout-split aside { width: 100%; border-right: none; border-bottom: 1px solid rgba(0,0,0,0.05); padding: 3rem 2rem; }
            .sticky-content { position: static; }
            .layout-split main { padding: 3rem 2rem; }
            .layout-grid #article-list { grid-template-columns: 1fr; }
        }
        
        ${variantCss}
    `;
    return CommonCss(config, p) + themeCss;
};
