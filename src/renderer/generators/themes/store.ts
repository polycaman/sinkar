(window as any).SinkarGenerators = (window as any).SinkarGenerators || {};
(window as any).SinkarGenerators.Themes = (window as any).SinkarGenerators.Themes || {};

const StoreTheme = {
  id: "store",

  generateHtml(config: any): string {
    const { CommonHtmlHead, CommonHtmlFooter } = (window as any).SinkarGenerators.Common;
    const title = config.siteTitle || "My Site";
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
  },

  generateCss(config: any): string {
    const { CommonCss } = (window as any).SinkarGenerators.Common;
    const PALETTES = (window as any).SinkarGenerators.PALETTES;
    const p = PALETTES[config.paletteId] || PALETTES.default;
    
    const themeCss = `
        header { background: var(--surface); padding: 1.5rem 0; box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 50; }
        .header-inner { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        header h1 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.025em; }
        header h1 a { color: var(--text); }
        header nav a { color: var(--text); margin-left: 1.5rem; font-weight: 500; }
        
        #hero { 
            background: var(--surface); 
            padding: 6rem 1.5rem; 
            text-align: center; 
            margin-bottom: 3rem;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        #hero h2 { font-size: clamp(2rem, 5vw, 3.5rem); margin: 0 0 1.5rem; line-height: 1.1; color: var(--text); }
        #hero button {
            background: var(--primary); color: var(--bg); border: none; padding: 1rem 2rem;
            font-size: 1.1rem; font-weight: 600; border-radius: var(--radius); cursor: pointer;
            transition: transform 0.2s;
        }
        #hero button:hover { transform: translateY(-2px); box-shadow: var(--shadow); }

        #app { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 4rem; }
        #article-list { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
            gap: 2rem; 
        }
        .article-card {
            background: var(--surface); border-radius: var(--radius); overflow: hidden;
            box-shadow: var(--shadow-sm); transition: all 0.3s; border: 1px solid rgba(0,0,0,0.05);
            display: flex; flex-direction: column;
        }
        .article-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
        .product-image-placeholder {
            height: 200px; background: color-mix(in srgb, var(--primary), transparent 90%);
            display: flex; align-items: center; justify-content: center;
            color: var(--primary); font-size: 3rem;
        }
        .card-body { padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column; }
        .article-card h4 { margin: 0 0 0.5rem; font-size: 1.2rem; }
        .article-card h4 a { color: var(--text); }
        .price-tag { font-size: 1.25rem; font-weight: bold; color: var(--text); margin-bottom: 1rem; display: block; }
        .btn-buy {
            margin-top: auto; background: var(--text); color: var(--bg); text-align: center;
            padding: 0.75rem; border-radius: var(--radius); font-weight: 600; display: block;
        }
        .btn-buy:hover { background: var(--primary); color: white; text-decoration: none; }

        /* Product Detail */
        .product-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 2rem; }
        .product-detail-image { 
            background: color-mix(in srgb, var(--primary), transparent 90%); 
            border-radius: var(--radius); 
            aspect-ratio: 1; 
            display: flex; align-items: center; justify-content: center;
            font-size: 5rem; color: var(--primary);
        }
        .product-detail-info h1 { font-size: 2.5rem; margin: 0 0 1rem; line-height: 1.1; }
        .product-detail-price { font-size: 2rem; font-weight: bold; color: var(--primary); margin-bottom: 2rem; }
        .product-detail-desc { font-size: 1.1rem; opacity: 0.8; margin-bottom: 2rem; }
        .btn-add-cart { 
            background: var(--primary); color: white; border: none; padding: 1rem 3rem; 
            font-size: 1.2rem; border-radius: var(--radius); cursor: pointer; width: 100%;
        }
        @media(max-width: 768px) { .product-detail { grid-template-columns: 1fr; } }
    `;
    return CommonCss(config, p) + themeCss;
  },

  generateJs(config: any, preloadedArticles: any[] | null): string {
    const { CommonJsHelpers } = (window as any).SinkarGenerators.Common;
    const description = config.siteDescription.replace(/"/g, '\\"');
    const storeEmail = config.storeEmail ? config.storeEmail.replace(/"/g, '\\"') : '';
    const articlesJson = preloadedArticles ? JSON.stringify(preloadedArticles) : 'null';

    return `
const CURRENT_THEME = "store";
const SITE_DESC = "${description}";
const STORE_EMAIL = "${storeEmail}";
const PRELOADED_ARTICLES = ${articlesJson};

${CommonJsHelpers}

// Cart Logic for Store Theme
const Cart = {
    items: [],
    init() {
        const saved = localStorage.getItem('sinkar_cart');
        if (saved) this.items = JSON.parse(saved);
        this.updateUI();
    },
    add(item) {
        const existing = this.items.find(i => i.id === item.id);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({ ...item, qty: 1 });
        }
        this.save();
    },
    remove(id) {
        this.items = this.items.filter(i => i.id !== id);
        this.save();
        if (new URLSearchParams(window.location.search).get('view') === 'cart') {
            renderCart();
        }
    },
    save() {
        localStorage.setItem('sinkar_cart', JSON.stringify(this.items));
        this.updateUI();
    },
    clear() {
        this.items = [];
        this.save();
        if (new URLSearchParams(window.location.search).get('view') === 'cart') {
            renderCart();
        }
    },
    updateUI() {
        const badge = document.getElementById('nav-cart-count');
        if (badge) {
            const count = this.items.reduce((a, b) => a + b.qty, 0);
            badge.innerText = \`Cart (\${count})\`;
        }
    },
    processCheckout() {
        if (this.items.length === 0) {
            alert('Cart is empty');
            return;
        }
        if (!STORE_EMAIL) {
            alert('Store owner has not configured an email address.');
            return;
        }
        
        const name = document.getElementById('cust-name').value;
        const email = document.getElementById('cust-email').value;
        const phone = document.getElementById('cust-phone').value;
        const address = document.getElementById('cust-address').value;

        if (!name || !email || !phone || !address) {
            alert("Please fill in all fields.");
            return;
        }

        const subjectRaw = "New Order Request from " + name;
        let bodyRaw = "Hello,\\n\\nI would like to order the following items:\\n\\n";
        
        let total = 0;
        this.items.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            bodyRaw += \`- \${item.title} (x\${item.qty}) - \${item.currency} \${itemTotal.toFixed(2)}\\n\`;
        });
        
        bodyRaw += \`\\nTotal: \${this.items[0].currency} \${total.toFixed(2)}\\n\`;
        bodyRaw += \`\\nCustomer Details:\\nName: \${name}\\nEmail: \${email}\\nPhone: \${phone}\\nAddress: \${address}\\n\`;
        bodyRaw += "\\nPlease contact me to arrange payment and delivery.";
        
        const mailto = \`mailto:\${STORE_EMAIL}?subject=\${encodeURIComponent(subjectRaw)}&body=\${encodeURIComponent(bodyRaw)}\`;
        
        try {
            const link = document.createElement('a');
            link.href = mailto;
            link.click();
        } catch (e) {
            console.error("Mailto failed", e);
        }

        this.showFallback(subjectRaw, bodyRaw);
    },

    showFallback(subject, body) {
        const container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;justify-content:center;align-items:center;backdrop-filter:blur(2px);';
        
        const content = document.createElement('div');
        content.style.cssText = 'background:white;padding:2rem;border-radius:12px;max-width:600px;width:90%;max-height:90vh;overflow:auto;box-shadow:0 10px 25px rgba(0,0,0,0.2);';
        
        content.innerHTML = \`
            <h3 style="margin-top:0;">Order Ready</h3>
            <p>We've attempted to open your email client. If it didn't open, please copy the details below and email them to <strong>\${STORE_EMAIL}</strong>.</p>
            
            <div style="margin-bottom:1rem;">
                <label style="font-weight:bold;display:block;margin-bottom:0.5rem;">Subject</label>
                <input type="text" value="\${subject.replace(/"/g, '&quot;')}" style="width:100%;padding:0.5rem;border:1px solid #ddd;border-radius:4px;" readonly onclick="this.select()">
            </div>
            
            <div style="margin-bottom:1rem;">
                <label style="font-weight:bold;display:block;margin-bottom:0.5rem;">Message Body</label>
                <textarea style="width:100%;height:200px;padding:0.5rem;border:1px solid #ddd;border-radius:4px;font-family:monospace;" readonly onclick="this.select()">\${body}</textarea>
            </div>
            
            <div style="text-align:right;">
                <button id="close-fallback" style="padding:0.75rem 1.5rem;background:#333;color:white;border:none;border-radius:4px;cursor:pointer;">Close</button>
            </div>
        \`;
        
        container.appendChild(content);
        document.body.appendChild(container);
        document.getElementById('close-fallback').onclick = () => document.body.removeChild(container);
    }
};

async function init() {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article');
    const view = params.get('view');
    
    Cart.init();

    if (view === 'cart') {
        renderCart();
    } else if (article) {
        await renderArticle(article);
    } else {
        await renderHome();
    }
}

function renderCart() {
    const container = document.getElementById('view-container');
    if (Cart.items.length === 0) {
        container.innerHTML = \`
            <div class="container" style="padding: 4rem 0; text-align: center;">
                <h2>Your Cart is Empty</h2>
                <p class="mb-4">Looks like you haven't added anything yet.</p>
                <a href="index.html" class="btn-primary">Start Shopping</a>
            </div>
        \`;
        return;
    }

    let total = 0;
    const itemsHtml = Cart.items.map(item => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return \`
            <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #eee;">
                <div>
                    <h4 style="margin:0">\${item.title}</h4>
                    <div class="small text-muted">\${item.currency} \${item.price} x \${item.qty}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold;">\${item.currency} \${itemTotal.toFixed(2)}</div>
                    <button onclick="Cart.remove('\${item.id}')" style="color: red; background: none; border: none; cursor: pointer; font-size: 0.8rem; text-decoration: underline;">Remove</button>
                </div>
            </div>
        \`;
    }).join('');

    container.innerHTML = \`
        <div class="container" style="padding: 2rem 0;">
            <h1 class="mb-4">Shopping Cart</h1>
            
            <div class="row" style="display: flex; flex-wrap: wrap; gap: 2rem;">
                <div class="col-md-7" style="flex: 2; min-width: 300px;">
                    <div class="card p-3 mb-4">
                        \${itemsHtml}
                        <div class="cart-total" style="margin-top: 1rem; text-align: right; font-size: 1.2rem; font-weight: bold;">
                            Total: \${Cart.items[0].currency} \${total.toFixed(2)}
                        </div>
                        <div style="margin-top: 1rem; text-align: right;">
                            <button onclick="Cart.clear()" style="background: none; border: none; color: #666; text-decoration: underline; cursor: pointer;">Clear Cart</button>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-5" style="flex: 1; min-width: 300px;">
                    <div class="card p-4 bg-light">
                        <h3 class="mb-3">Checkout Details</h3>
                        <div class="mb-3">
                            <label class="form-label">Full Name</label>
                            <input type="text" id="cust-name" class="form-control" placeholder="John Doe">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email Address</label>
                            <input type="email" id="cust-email" class="form-control" placeholder="john@example.com">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" id="cust-phone" class="form-control" placeholder="+1 234 567 8900">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Delivery Address</label>
                            <textarea id="cust-address" class="form-control" rows="3" placeholder="123 Main St, City, Country"></textarea>
                        </div>
                        
                        <button onclick="Cart.processCheckout()" class="btn-primary w-100" style="width: 100%; padding: 1rem; font-size: 1.1rem; margin-top: 1rem;">
                            Send Order Request
                        </button>
                        <p class="small text-muted mt-2 text-center">
                            This will open your email client to send the order details to the store owner.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    \`;
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
        
        const price = metadata.price || '0.00';
        const currency = metadata.currency || 'USD';
        const stock = metadata.stock || '0';

        const html = \`
            <div class="container">
                <div class="product-detail">
                    <div class="product-detail-image">
                        \${metadata.coverImage ? \`<img src="\${metadata.coverImage}" alt="\${title}" style="max-width:100%; height:auto; border-radius:8px;">\` : '<i class="fas fa-box-open"></i>'}
                    </div>
                    <div class="product-detail-info">
                        <h1>\${title}</h1>
                        <div class="product-detail-price">\${currency} \${price}</div>
                        <div class="small text-muted mb-3">\${stock > 0 ? 'In Stock (' + stock + ')' : 'Out of Stock'}</div>
                        
                        <button class="btn-add-cart" onclick="Cart.add({id: '\${filename}', title: '\${title.replace(/'/g, "\\\\'")}', price: \${price}, currency: '\${currency}'})" \${stock <= 0 ? 'disabled' : ''}>
                            \${stock > 0 ? 'Add to Cart' : 'Sold Out'}
                        </button>
                        
                        <div class="product-detail-desc" style="margin-top: 2rem;">
                            \${content}
                        </div>
                        
                        \${metadata.features ? \`
                        <div class="mt-4">
                            <h5>Features</h5>
                            <ul>
                                \${metadata.features.split(',').map(f => \`<li>\${f.trim()}</li>\`).join('')}
                            </ul>
                        </div>
                        \` : ''}

                        <a href="index.html" style="display: inline-block; margin-top: 1rem;">&larr; Back to Shop</a>
                    </div>
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
            <h2>\${SITE_DESC}</h2>
            <button onclick="document.getElementById('article-list').scrollIntoView({behavior: 'smooth'})">Shop Now</button>
        </section>
        <div id="article-list" class="product-grid">Loading products...</div>
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
            const price = a.price || '0.00';
            const currency = a.currency || 'USD';
            const coverImage = fixAssetPath(a.coverImage, a.file);
            
            return \`
                <div class="article-card">
                    <div class="product-image-placeholder" style="\${coverImage ? \`background:url('\${coverImage}') center/cover\` : ''}">
                        \${!coverImage ? '<i class="fas fa-box-open"></i>' : ''}
                    </div>
                    <div class="card-body">
                        <h4><a href="?article=\${a.file}">\${a.title}</a></h4>
                        <span class="price-tag">\${currency} \${price}</span>
                        <a href="?article=\${a.file}" class="btn-buy">View Details</a>
                    </div>
                </div>
            \`;
        }).join('');
    }
}

document.addEventListener('DOMContentLoaded', init);
`;
  }
};

(window as any).SinkarGenerators.Themes.store = StoreTheme;

