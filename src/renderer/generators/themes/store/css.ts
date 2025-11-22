(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.StoreTheme = (window as any).SinkarGenerators.StoreTheme || {};

(window as any).SinkarGenerators.StoreTheme.generateCss = function(config: any): string {
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
    if (layout === 'list') {
        layoutCss = `
            #article-list { display: flex; flex-direction: column; gap: 2rem; max-width: 900px; margin: 0 auto; }
            .article-card { flex-direction: row; align-items: stretch; min-height: 220px; }
            .product-image-placeholder { width: 280px; height: auto; aspect-ratio: auto; flex-shrink: 0; }
            .card-body { padding: 2rem; justify-content: center; align-items: flex-start; }
            .card-body h4 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            .price-tag { font-size: 1.4rem; margin-bottom: 1.5rem; color: var(--primary); }
            .btn-buy { width: auto; padding: 0.75rem 2rem; display: inline-block; margin-top: 0; }
            @media(max-width: 700px) { 
                .article-card { flex-direction: column; } 
                .product-image-placeholder { width: 100%; height: 250px; } 
                .card-body { align-items: stretch; }
                .btn-buy { display: block; text-align: center; }
            }
        `;
    } else if (layout === 'featured') {
        layoutCss = `
            #hero { padding: 10rem 1.5rem; background: radial-gradient(circle at center, var(--surface), var(--bg)); text-align: center; }
            #hero h2 { font-size: clamp(3rem, 6vw, 5rem); font-weight: 900; letter-spacing: -0.03em; margin-bottom: 2rem; }
            #hero button { padding: 1.25rem 3rem; font-size: 1.25rem; border-radius: 99px; }
            
            .article-card:first-child { 
                grid-column: 1 / -1; 
                display: grid; 
                grid-template-columns: 1.2fr 0.8fr; 
                min-height: 500px;
                background: var(--surface);
                border: 1px solid rgba(0,0,0,0.05);
            }
            .article-card:first-child .product-image-placeholder { height: 100%; width: 100%; border-radius: var(--radius) 0 0 var(--radius); }
            .article-card:first-child .card-body { padding: 4rem; justify-content: center; }
            .article-card:first-child h4 { font-size: 2.5rem; margin-bottom: 1rem; }
            .article-card:first-child .price-tag { font-size: 2rem; color: var(--primary); margin-bottom: 2rem; }
            .article-card:first-child .btn-buy { font-size: 1.2rem; padding: 1rem 2rem; width: auto; align-self: flex-start; }
            
            @media(max-width: 900px) { 
                .article-card:first-child { display: flex; flex-direction: column; } 
                .article-card:first-child .product-image-placeholder { height: 300px; border-radius: var(--radius) var(--radius) 0 0; }
                .article-card:first-child .card-body { padding: 2rem; }
                .article-card:first-child .btn-buy { width: 100%; }
            }
        `;
    }

    let variantCss = '';
    if (variant === 'flat') {
        variantCss = `
            .article-card { box-shadow: none; border: 1px solid var(--text); border-radius: 0; }
            .article-card:hover { transform: none; border-color: var(--primary); box-shadow: 4px 4px 0 var(--primary); }
            header { box-shadow: none; border-bottom: 1px solid var(--text); }
            .btn-buy, .btn-add-cart, #hero button { border-radius: 0; border: 1px solid var(--text); box-shadow: 4px 4px 0 var(--text); }
            .btn-buy:hover, .btn-add-cart:hover, #hero button:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--text); }
            .product-image-placeholder { border-radius: 0; }
        `;
    }

    const themeCss = `
        header { background: var(--surface); padding: 1.5rem 0; box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 50; }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        header h1 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.025em; }
        header h1 a { color: var(--text); }
        header nav a { color: var(--text); margin-left: 1.5rem; font-weight: 600; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; }
        header nav a:hover { color: var(--primary); }
        
        #hero { 
            background: var(--surface); 
            padding: 6rem 1.5rem; 
            text-align: center; 
            margin-bottom: 4rem;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        #hero h2 { font-size: clamp(2.5rem, 5vw, 4rem); margin: 0 0 1.5rem; line-height: 1.1; color: var(--text); font-weight: 800; }
        #hero button {
            background: var(--primary); color: var(--bg); border: none; padding: 1rem 2.5rem;
            font-size: 1.1rem; font-weight: 600; border-radius: var(--radius); cursor: pointer;
            transition: all 0.2s;
        }
        #hero button:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.9; }

        #app { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 4rem; }
        #article-list { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
            gap: 2.5rem; 
        }
        .article-card {
            background: var(--surface); border-radius: var(--radius); overflow: hidden;
            box-shadow: var(--shadow-sm); transition: all 0.3s; border: 1px solid rgba(0,0,0,0.05);
            display: flex; flex-direction: column;
        }
        .article-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-lg); }
        .product-image-placeholder {
            height: 240px; background: linear-gradient(135deg, color-mix(in srgb, var(--primary), transparent 90%), color-mix(in srgb, var(--secondary), transparent 90%));
            display: flex; align-items: center; justify-content: center;
            color: var(--primary); font-size: 3rem;
            background-size: cover; background-position: center;
            transition: transform 0.5s;
        }
        .article-card:hover .product-image-placeholder { transform: scale(1.05); }
        .card-body { padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column; position: relative; background: var(--surface); }
        .article-card h4 { margin: 0 0 0.5rem; font-size: 1.25rem; font-weight: 700; line-height: 1.3; }
        .article-card h4 a { color: var(--text); }
        .price-tag { font-size: 1.25rem; font-weight: 700; color: var(--text); margin-bottom: 1.25rem; display: block; opacity: 0.9; }
        .btn-buy {
            margin-top: auto; background: var(--text); color: var(--bg); text-align: center;
            padding: 0.85rem; border-radius: var(--radius); font-weight: 600; display: block;
            transition: all 0.2s;
        }
        .btn-buy:hover { background: var(--primary); color: white; text-decoration: none; transform: translateY(-2px); }

        /* Product Detail */
        .product-detail { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 5rem; margin-top: 3rem; align-items: start; }
        .product-detail-image { 
            background: linear-gradient(135deg, color-mix(in srgb, var(--primary), transparent 95%), color-mix(in srgb, var(--secondary), transparent 95%)); 
            border-radius: var(--radius); 
            aspect-ratio: 1; 
            display: flex; align-items: center; justify-content: center;
            font-size: 6rem; color: var(--primary);
            overflow: hidden;
        }
        .product-detail-info h1 { font-size: 3rem; margin: 0 0 1rem; line-height: 1.1; font-weight: 800; }
        .product-detail-price { font-size: 2.5rem; font-weight: 700; color: var(--primary); margin-bottom: 2rem; }
        .product-detail-desc { font-size: 1.15rem; opacity: 0.8; margin-bottom: 2.5rem; line-height: 1.8; }
        .btn-add-cart { 
            background: var(--primary); color: white; border: none; padding: 1.25rem 3rem; 
            font-size: 1.25rem; border-radius: var(--radius); cursor: pointer; width: 100%;
            font-weight: 700; transition: all 0.2s; box-shadow: var(--shadow);
        }
        .btn-add-cart:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.95; }
        .btn-add-cart:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        @media(max-width: 900px) { .product-detail { grid-template-columns: 1fr; gap: 3rem; } }
        
        ${layoutCss}
        ${variantCss}
    `;
    return CommonCss(config, p) + themeCss;
};
