(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.LandingTheme = (window as any).SinkarGenerators.LandingTheme || {};

(window as any).SinkarGenerators.LandingTheme.generateCss = function(config: any): string {
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
    
    let layoutCss = '';
    if (layout === 'split') {
        layoutCss = `
            #hero { text-align: left; padding: 6rem 0; min-height: 80vh; display: flex; align-items: center; }
            #hero .container { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
            #hero h2 { font-size: clamp(3rem, 5vw, 4.5rem); margin-bottom: 1.5rem; }
            .hero-btns { justify-content: flex-start; }
            .hero-image-placeholder { 
                width: 100%; height: 500px; background: var(--surface); 
                border-radius: var(--radius); box-shadow: var(--shadow-lg);
                display: flex; align-items: center; justify-content: center;
                font-size: 8rem; color: var(--primary); opacity: 0.8;
                transform: perspective(1000px) rotateY(-5deg);
                transition: transform 0.5s;
            }
            .hero-image-placeholder:hover { transform: perspective(1000px) rotateY(0deg); }
            @media(max-width: 900px) { 
                #hero { padding: 4rem 0; text-align: center; }
                #hero .container { grid-template-columns: 1fr; gap: 3rem; } 
                .hero-btns { justify-content: center; }
                .hero-image-placeholder { height: 300px; transform: none; font-size: 5rem; }
                .hero-image-placeholder:hover { transform: none; }
            }
        `;
    } else if (layout === 'centered') {
        layoutCss = `
            #hero { padding: 10rem 0 8rem; text-align: center; }
            #hero h2 { font-size: clamp(3.5rem, 7vw, 5.5rem); max-width: 900px; margin-left: auto; margin-right: auto; }
            #hero p { font-size: 1.5rem; max-width: 700px; margin-left: auto; margin-right: auto; }
        `;
    }

    let variantCss = '';
    if (variant === 'gradient') {
        variantCss = `
            #hero { background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; }
            #hero h2, #hero p { color: white; opacity: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
            .btn-primary { background: white; color: var(--primary); border: none; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
            .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.3); background: white; color: var(--primary); }
            .btn-secondary { border: 2px solid rgba(255,255,255,0.8); color: white; }
            .btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; border-color: white; }
            header { background: rgba(0,0,0,0.1); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(255,255,255,0.1); }
            header h1 a, header nav a { color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.3); }
            header nav a:hover { color: rgba(255,255,255,0.8); }
        `;
    } else if (variant === 'solid') {
        variantCss = `
            #hero { background: var(--primary); }
            #hero h2, #hero p { color: var(--bg); }
            .btn-primary { background: var(--bg); color: var(--primary); border: none; }
            .btn-secondary { border: 2px solid var(--bg); color: var(--bg); }
            .btn-secondary:hover { background: var(--bg); color: var(--primary); }
        `;
    }

    const themeCss = `
        header { padding: 1.5rem 0; position: absolute; width: 100%; top: 0; left: 0; z-index: 50; transition: background 0.3s; }
        header .container { display: flex; justify-content: space-between; align-items: center; }
        header h1 a { color: var(--text); font-weight: 800; font-size: 1.5rem; letter-spacing: -0.02em; }
        header nav { display: flex; align-items: center; }
        header nav a { margin-left: 2rem; color: var(--text); font-weight: 600; font-size: 0.95rem; }
        header nav a:not(.btn-cta):hover { color: var(--primary); }
        .btn-cta { 
            background: var(--primary); color: white !important; padding: 0.6rem 1.5rem; 
            border-radius: 99px; transition: all 0.2s; font-weight: 700; margin-left: 2rem;
            box-shadow: var(--shadow);
        }
        .btn-cta:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.95; }

        #hero { 
            padding: 8rem 0 6rem; text-align: center; 
            background: radial-gradient(circle at top center, color-mix(in srgb, var(--primary), transparent 92%), transparent 70%);
            position: relative; overflow: hidden;
        }
        #hero h2 { font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.1; margin-bottom: 1.5rem; color: var(--text); letter-spacing: -0.03em; font-weight: 800; }
        #hero p { font-size: 1.25rem; max-width: 600px; margin: 0 auto 2.5rem; opacity: 0.8; line-height: 1.6; }
        .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-primary { 
            background: var(--text); color: var(--bg); padding: 1rem 2.5rem; border-radius: var(--radius); font-weight: 700; 
            transition: all 0.2s; font-size: 1.1rem;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.95; }
        .btn-secondary { 
            background: transparent; border: 2px solid var(--text); color: var(--text); padding: 1rem 2.5rem; border-radius: var(--radius); font-weight: 700; 
            transition: all 0.2s; font-size: 1.1rem;
        }
        .btn-secondary:hover { background: var(--text); color: var(--bg); transform: translateY(-2px); }

        #features { padding: 8rem 0; background: var(--surface); }
        #features h3 { text-align: center; font-size: 2.5rem; margin-bottom: 5rem; font-weight: 800; letter-spacing: -0.02em; }
        #article-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 3rem; }
        .article-card { 
            padding: 2.5rem; border-radius: var(--radius); background: var(--bg); border: 1px solid rgba(0,0,0,0.05); 
            transition: all 0.3s; height: 100%; display: flex; flex-direction: column;
        }
        .article-card:hover { transform: translateY(-10px); box-shadow: var(--shadow-lg); border-color: transparent; }
        .article-card h4 { font-size: 1.5rem; margin-bottom: 1rem; font-weight: 700; }
        .article-card h4 a { color: var(--text); }
        .article-card p { opacity: 0.7; line-height: 1.6; flex-grow: 1; margin-bottom: 1.5rem; }
        .article-card small { display: none; } /* Hide dates for landing page look */
        
        /* Feature Detail */
        .feature-detail { max-width: 900px; margin: 6rem auto; padding: 0 1.5rem; }
        .feature-detail h1 { font-size: clamp(2.5rem, 5vw, 4rem); text-align: center; margin-bottom: 3rem; font-weight: 800; line-height: 1.1; }
        .feature-detail-content { font-size: 1.25rem; line-height: 1.8; color: var(--text); }
        .feature-detail-content img { margin: 3rem 0; box-shadow: var(--shadow-lg); border-radius: var(--radius); }
        .feature-detail-content h2 { margin-top: 3rem; font-size: 2rem; }

        footer { padding: 5rem 0; text-align: center; opacity: 0.6; font-size: 0.95rem; border-top: 1px solid rgba(0,0,0,0.05); margin-top: auto; }
        
        ${layoutCss}
        ${variantCss}
    `;
    return CommonCss(config, p) + themeCss;
};
