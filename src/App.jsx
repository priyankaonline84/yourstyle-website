import React, { useEffect, useMemo, useState } from "react";
import { supabase, supabaseReady, whatsappNumber, whatsappLink } from "./supabase";
import { ArrowRight, Instagram, Menu, Search, ShoppingBag, X, LogIn, LogOut, Plus, Pencil, Trash2, Upload, ChevronDown } from "lucide-react";

const money = (v) => `₹${Number(v || 0).toLocaleString("en-IN")}`;

function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState({});
  const [banner, setBanner] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function loadCatalogue() {
    if (!supabaseReady) { setLoading(false); return; }
    setLoading(true);
    const [{ data: cats }, { data: prods }, { data: banners }] = await Promise.all([
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("products").select("*, categories(name)").eq("is_published", true).order("sort_order").order("created_at", { ascending: false }),
      supabase.from("homepage_banners").select("*").eq("is_active", true).order("sort_order").limit(1)
    ]);
    setCategories(cats || []);
    setProducts(prods || []);
    setBanner(banners?.[0] || null);
    const ids = (prods || []).map(p => p.id);
    if (ids.length) {
      const { data: imgs } = await supabase.from("product_images").select("*").in("product_id", ids).order("sort_order");
      const grouped = {};
      (imgs || []).forEach(img => { (grouped[img.product_id] ||= []).push(img); });
      setImages(grouped);
    } else setImages({});
    setLoading(false);
  }

  useEffect(() => {
    loadCatalogue();
    if (supabaseReady) {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
      return () => listener.subscription.unsubscribe();
    }
  }, []);

  const filtered = useMemo(() => products.filter(p => {
    const categoryMatch = activeCategory === "all" || p.category_id === activeCategory;
    const q = search.trim().toLowerCase();
    const searchMatch = !q || `${p.name} ${p.sku} ${p.description || ""}`.toLowerCase().includes(q);
    return categoryMatch && searchMatch;
  }), [products, activeCategory, search]);

  const featured = products.filter(p => p.is_featured).slice(0, 4);
  const newArrivals = products.filter(p => p.is_new_arrival).slice(0, 4);
  const showNotice = (msg) => { setNotice(msg); window.setTimeout(() => setNotice(""), 3500); };

  return <div className="site-shell">
    <div className="announcement">A little something lovely, at prices you'll love</div>
    <header className="header">
      <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">{menuOpen ? <X/> : <Menu/>}</button>
      <a className="wordmark" href="#" onClick={() => { setActiveCategory("all"); setSelected(null); }}>your<span>style</span><small>STYLE THAT FEELS LIKE YOU</small></a>
      <nav className={menuOpen ? "nav open" : "nav"}>
        <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
        <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
        <a href="#new-arrivals" onClick={() => setMenuOpen(false)}>New Arrivals</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>Our Story</a>
      </nav>
      <div className="header-actions">
        <label className="searchbox"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search styles..." /></label>
        <button className="admin-link" onClick={() => setAdminOpen(true)}><LogIn size={16}/> Admin</button>
      </div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A little joy in every find</p>
          <h1>Find your style.<br/><em>Feel gorgeous.</em></h1>
          <p className="hero-text">Lovely everyday finds, feel-good prices and little surprises picked just for you.</p>
          <a className="primary-button" href="#shop">EXPLORE THE COLLECTION <ArrowRight size={16}/></a>
          <div className="hero-note"><span>✦</span> Genuine style. Great deals. Gorgeous you.</div>
        </div>
        <div className="hero-art" style={banner?.desktop_image_url ? {backgroundImage:`linear-gradient(90deg, rgba(37,20,25,.06), rgba(37,20,25,.02)), url(${banner.desktop_image_url})`} : {}}>
          {!banner?.desktop_image_url && <div className="hero-placeholder"><span className="hero-kicker">THE EVERYDAY EDIT</span><div className="hero-orb orb-one"></div><div className="hero-orb orb-two"></div><div className="hero-caption">Little things.<br/><i>Lovely feelings.</i></div></div>}
        </div>
      </section>

      <section className="benefits">
        <div><span>♡</span><p><b>Lovely finds</b><small>Thoughtfully picked</small></p></div>
        <div><span>✧</span><p><b>Feel-good prices</b><small>Style within reach</small></p></div>
        <div><span>🎁</span><p><b>A little surprise</b><small>A gift with every order</small></p></div>
      </section>

      <section id="categories" className="section categories-section">
        <div className="section-heading"><div><p className="eyebrow">Browse by mood</p><h2>Find your <em>favourite</em></h2></div><a href="#shop" className="text-link">VIEW ALL <ArrowRight size={15}/></a></div>
        <div className="category-grid">
          {categories.length ? categories.slice(0,6).map((c,i) => <button className="category-item" key={c.id} onClick={() => {setActiveCategory(c.id); document.querySelector("#shop")?.scrollIntoView({behavior:"smooth"});}}>
            <div className={`category-image category-tone-${i%6}`} style={c.image_url ? {backgroundImage:`url(${c.image_url})`} : {}}>{!c.image_url && <span>{c.name.slice(0,1)}</span>}</div><b>{c.name}</b>
          </button>) : ["Apparel","Jewellery","Bags","Accessories","Perfume","Home & Lifestyle"].map((c,i) => <div className="category-item" key={c}><div className={`category-image category-tone-${i}`}><span>{c.slice(0,1)}</span></div><b>{c}</b></div>)}
        </div>
      </section>

      {featured.length > 0 && <ProductSection title="A few favourites" eyebrow="Loved for a reason" items={featured} images={images} onSelect={setSelected}/>}
      <section id="new-arrivals" className="new-arrivals-band">
        <div><p className="eyebrow">Freshly picked</p><h2>New things to <em>love</em></h2><p>Discover the latest little finds before they're gone.</p><a href="#shop" className="light-button">SHOP NEW ARRIVALS <ArrowRight size={15}/></a></div>
        <div className="band-decoration"><span>NEW</span><b>ARRIVALS</b><i>♡</i></div>
      </section>

      <section id="shop" className="section shop-section">
        <div className="section-heading"><div><p className="eyebrow">The YourStyle edit</p><h2>Shop the <em>collection</em></h2></div><span className="product-count">{products.length} lovely finds</span></div>
        <div className="filter-row">
          <button className={activeCategory==="all"?"filter active":"filter"} onClick={() => setActiveCategory("all")}>All products</button>
          {categories.map(c => <button key={c.id} className={activeCategory===c.id?"filter active":"filter"} onClick={() => setActiveCategory(c.id)}>{c.name}</button>)}
        </div>
        {loading ? <div className="empty-state">Gathering lovely finds for you...</div> : !supabaseReady ? <div className="setup-state"><b>YourStyle catalogue is being set up.</b><p>Once the Supabase connection is added, your products will appear here.</p></div> : filtered.length ? <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} image={images[p.id]?.[0]?.image_url} onSelect={setSelected}/>)}</div> : <div className="empty-state">No products here just yet. Check back soon!</div>}
      </section>

      <section id="about" className="story-strip"><div className="story-mark">ys.</div><div><p className="eyebrow">A happy place for happy finds</p><h2>Good style should feel <em>good.</em></h2><p>We're here for the little things that make everyday feel a little more you.</p></div></section>
    </main>
    <footer className="footer"><a className="wordmark footer-mark" href="#">your<span>style</span></a><p>Genuine style. Great deals. Gorgeous you.</p><div><a href="#shop">Shop</a><a href="#categories">Categories</a><a href="#about">Our Story</a></div><small>© {new Date().getFullYear()} YourStyle. Made with a little love.</small></footer>

    {selected && <ProductModal product={selected} imageList={images[selected.id] || []} onClose={() => setSelected(null)}/>}
    {adminOpen && <AdminPanel session={session} onClose={() => setAdminOpen(false)} onRefresh={loadCatalogue} notify={showNotice}/>}
    {notice && <div className="toast">{notice}</div>}
    {!whatsappNumber && <div className="config-hint">Setup required: add your WhatsApp Business number in the site environment settings.</div>}
  </div>;
}

function ProductSection({title, eyebrow, items, images, onSelect}) {
  return <section className="section compact-section"><div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div><div className="product-grid">{items.map(p=><ProductCard key={p.id} product={p} image={images[p.id]?.[0]?.image_url} onSelect={onSelect}/>)}</div></section>;
}

function ProductCard({product, image, onSelect}) {
  return <article className="product-card">
    <button className="product-image" onClick={() => onSelect(product)}>{image ? <img src={image} alt={product.name}/> : <div className="image-placeholder"><ShoppingBag size={30}/><span>YOURSTYLE</span></div>}
      {product.is_new_arrival && <span className="ribbon">NEW</span>}
      {product.original_price && Number(product.original_price)>Number(product.price) && <span className="sale-tag">SPECIAL PRICE</span>}
    </button>
    <div className="product-info"><button className="product-name" onClick={() => onSelect(product)}>{product.name}</button><div className="price-line"><b>{money(product.price)}</b>{product.original_price && Number(product.original_price)>Number(product.price) && <del>{money(product.original_price)}</del>}</div><a className="whatsapp-button" href={whatsappNumber ? whatsappLink(product) : "#"} target="_blank" rel="noreferrer" onClick={e=>{if(!whatsappNumber){e.preventDefault();alert("WhatsApp number will be added during setup.");}}}>ENQUIRE ON WHATSAPP <ArrowRight size={14}/></a></div>
  </article>;
}

function ProductModal({product, imageList, onClose}) {
  const [active, setActive] = useState(0);
  const imgs = imageList.map(x=>x.image_url);
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="product-modal" onMouseDown={e=>e.stopPropagation()}><button className="close-button" onClick={onClose}><X/></button><div className="modal-image">{imgs.length ? <img src={imgs[active]} alt={product.name}/> : <div className="image-placeholder"><ShoppingBag/></div>}{imgs.length>1 && <div className="image-dots">{imgs.map((_,i)=><button className={active===i?"dot selected":"dot"} key={i} onClick={()=>setActive(i)}/>)}</div>}</div><div className="modal-info"><p className="eyebrow">{product.categories?.name || "YOURSTYLE FIND"}</p><h2>{product.name}</h2><div className="modal-price">{money(product.price)} {product.original_price && <del>{money(product.original_price)}</del>}</div><p>{product.description || "A lovely find, picked for your everyday style."}</p>{product.sizes?.length>0 && <p><b>Sizes:</b> {product.sizes.join(", ")}</p>}{product.colors?.length>0 && <p><b>Colours:</b> {product.colors.join(", ")}</p>}<p className="sku">SKU: {product.sku}</p><a className="primary-button" href={whatsappNumber ? whatsappLink(product) : "#"} target="_blank" rel="noreferrer">ENQUIRE ON WHATSAPP <ArrowRight size={16}/></a></div></div></div>;
}

function AdminPanel({session, onClose, onRefresh, notify}) {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [allProducts,setAllProducts]=useState([]);
  const [cats,setCats]=useState([]);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({sku:"",name:"",slug:"",category_id:"",description:"",price:"",original_price:"",sizes:"",colors:"",stock_status:"available",is_featured:false,is_new_arrival:false,is_published:false});
  const [photo,setPhoto]=useState(null);
  const [tab,setTab]=useState("products");

  async function loadAdmin() {
    const [{data:p},{data:c}] = await Promise.all([supabase.from("products").select("*").order("created_at",{ascending:false}),supabase.from("categories").select("*").order("sort_order")]);
    setAllProducts(p||[]); setCats(c||[]);
  }
  useEffect(()=>{if(session) loadAdmin();},[session]);
  async function login(e){e.preventDefault();setBusy(true);const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error)notify(error.message);else{setPassword("");notify("Signed in successfully.");}}
  async function logout(){await supabase.auth.signOut();setAllProducts([]);notify("Signed out.");}
  function resetForm(){setEditing(null);setPhoto(null);setForm({sku:"",name:"",slug:"",category_id:"",description:"",price:"",original_price:"",sizes:"",colors:"",stock_status:"available",is_featured:false,is_new_arrival:false,is_published:false});}
  function editProduct(p){setEditing(p.id);setPhoto(null);setForm({...p,sizes:(p.sizes||[]).join(", "),colors:(p.colors||[]).join(", "),price:String(p.price??""),original_price:String(p.original_price??"")});setTab("products");}
  async function saveProduct(e){
    e.preventDefault();setBusy(true);
    const slug=(form.slug||form.name).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
    const payload={sku:form.sku.trim(),name:form.name.trim(),slug,category_id:form.category_id||null,description:form.description||null,price:Number(form.price),original_price:form.original_price?Number(form.original_price):null,sizes:form.sizes.split(",").map(x=>x.trim()).filter(Boolean),colors:form.colors.split(",").map(x=>x.trim()).filter(Boolean),stock_status:form.stock_status,is_featured:form.is_featured,is_new_arrival:form.is_new_arrival,is_published:form.is_published,updated_at:new Date().toISOString()};
    let result;
    if(editing) result=await supabase.from("products").update(payload).eq("id",editing).select().single();
    else result=await supabase.from("products").insert(payload).select().single();
    if(result.error){setBusy(false);notify(result.error.message);return;}
    if(photo && result.data){
      const ext=photo.name.split(".").pop().toLowerCase();const path=`products/${result.data.id}/${Date.now()}.${ext}`;
      const upload=await supabase.storage.from("yourstyle-images").upload(path,photo,{upsert:true,contentType:photo.type});
      if(upload.error){setBusy(false);notify("Product saved, but image upload failed: "+upload.error.message);return;}
      const {data:publicUrl}=supabase.storage.from("yourstyle-images").getPublicUrl(path);
      const imageInsert=await supabase.from("product_images").insert({product_id:result.data.id,image_url:publicUrl.publicUrl,alt_text:result.data.name,sort_order:0});
      if(imageInsert.error){setBusy(false);notify("Product saved, but image record failed: "+imageInsert.error.message);return;}
    }
    setBusy(false);resetForm();await loadAdmin();await onRefresh();notify("Product saved.");
  }
  async function removeProduct(p){if(!confirm(`Delete "${p.name}"?`))return;const {error}=await supabase.from("products").delete().eq("id",p.id);if(error)notify(error.message);else{await loadAdmin();await onRefresh();notify("Product deleted.");}}
  async function addCategory(e){e.preventDefault();const name=e.target.category.value.trim();if(!name)return;const slug=name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");const {error}=await supabase.from("categories").insert({name,slug,is_active:true});if(error)notify(error.message);else{e.target.reset();await loadAdmin();notify("Category added.");}}
  if(!supabaseReady) return <div className="modal-backdrop"><div className="admin-panel"><button className="close-button" onClick={onClose}><X/></button><h2>Admin setup</h2><p>Add your Supabase project URL and public anon key to the environment variables before signing in.</p></div></div>;
  return <div className="modal-backdrop admin-backdrop" onMouseDown={onClose}><div className="admin-panel" onMouseDown={e=>e.stopPropagation()}><button className="close-button" onClick={onClose}><X/></button>
    <div className="admin-heading"><div><p className="eyebrow">YOURSTYLE CONTROL ROOM</p><h2>Admin dashboard</h2></div>{session&&<button className="outline-button" onClick={logout}><LogOut size={15}/> Sign out</button>}</div>
    {!session ? <form className="login-form" onSubmit={login}><p>Sign in with the admin email and password you created in Supabase.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="primary-button" disabled={busy}>{busy?"PLEASE WAIT":"SIGN IN"}</button></form> :
    <><div className="admin-tabs"><button className={tab==="products"?"active":""} onClick={()=>setTab("products")}>Products</button><button className={tab==="categories"?"active":""} onClick={()=>setTab("categories")}>Categories</button></div>
    {tab==="products" ? <div className="admin-content"><form className="product-form" onSubmit={saveProduct}><h3>{editing?"Edit product":"Add a product"}</h3><div className="form-grid"><label>SKU<input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} required/></label><label>Product name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label><label>URL slug<input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="Auto-created if blank"/></label><label>Category<select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Choose category</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Price (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required/></label><label>Original price (₹)<input type="number" min="0" step="0.01" value={form.original_price} onChange={e=>setForm({...form,original_price:e.target.value})}/></label><label>Sizes (comma separated)<input value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} placeholder="S, M, L"/></label><label>Colours (comma separated)<input value={form.colors} onChange={e=>setForm({...form,colors:e.target.value})} placeholder="Black, Pink"/></label><label>Stock status<select value={form.stock_status} onChange={e=>setForm({...form,stock_status:e.target.value})}><option value="available">Available</option><option value="sold_out">Sold out</option><option value="coming_soon">Coming soon</option></select></label><label>Product photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></label></div><label>Description<textarea rows="3" value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})}/></label><div className="check-row"><label><input type="checkbox" checked={form.is_featured} onChange={e=>setForm({...form,is_featured:e.target.checked})}/> Featured</label><label><input type="checkbox" checked={form.is_new_arrival} onChange={e=>setForm({...form,is_new_arrival:e.target.checked})}/> New arrival</label><label><input type="checkbox" checked={form.is_published} onChange={e=>setForm({...form,is_published:e.target.checked})}/> Publish</label></div><div className="form-actions"><button className="primary-button" disabled={busy}>{busy?"SAVING...":editing?"UPDATE PRODUCT":"SAVE PRODUCT"}</button>{editing&&<button type="button" className="outline-button" onClick={resetForm}>Cancel edit</button>}</div></form>
    <div className="admin-list"><h3>Products ({allProducts.length})</h3>{allProducts.map(p=><div className="admin-product" key={p.id}><div><b>{p.name}</b><small>{p.sku} · {money(p.price)} · {p.is_published?"Published":"Draft"}</small></div><div><button title="Edit" onClick={()=>editProduct(p)}><Pencil size={16}/></button><button title="Delete" onClick={()=>removeProduct(p)}><Trash2 size={16}/></button></div></div>)}</div></div> :
    <div className="admin-content"><form className="category-form" onSubmit={addCategory}><h3>Add category</h3><label>Category name<input name="category" placeholder="e.g. Apparel" required/></label><button className="primary-button">ADD CATEGORY</button></form><div className="admin-list"><h3>Existing categories ({cats.length})</h3>{cats.map(c=><div className="admin-product" key={c.id}><b>{c.name}</b><small>{c.slug}</small></div>)}</div></div>}
    </>}
  </div></div>;
}

export default App;
