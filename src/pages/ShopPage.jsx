import { useSearchParams } from 'react-router'
import useCatalog from '../lib/useCatalog'
import ProductCard from '../components/products/ProductCard'
export default function ShopPage(){
 const {categories,products,loading,error}=useCatalog()
 const [params,setParams]=useSearchParams()
 const category=params.get('category')||'', search=params.get('q')||'', deals=params.get('deals')==='true'
 function filter(key,value){const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);setParams(next)}
 const visible=products.filter(p=>(!category||p.category_id===category)&&(!search||(p.name+' '+(p.description||'')).toLowerCase().includes(search.toLowerCase()))&&(!deals||Number(p.compare_at_price)>Number(p.price)))
 return <section className="store-container shop-page"><span className="eyebrow">FIND THEIR NEXT FAVORITE THING</span><h1>Shop gifts</h1><div className="shop-filters"><input aria-label="Search products" placeholder="Search gifts?" value={search} onChange={e=>filter('q',e.target.value)}/><select aria-label="Filter by category" value={category} onChange={e=>filter('category',e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><label><input type="checkbox" checked={deals} onChange={e=>filter('deals',e.target.checked?'true':'')}/> On sale</label><button onClick={()=>setParams({})}>Clear filters</button></div>{loading?<p className="empty-state">Loading gifts?</p>:error?<p role="alert" className="empty-state">Unable to load products. Please try again shortly.</p>:visible.length?<div className="product-grid">{visible.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<p className="empty-state">No products found. Try another category or search.</p>}</section>
}