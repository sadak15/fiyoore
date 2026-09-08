import AdvertisingCarousel from '../components/home/AdvertisingCarousel'
import { Link } from 'react-router'
import { FiArrowRight, FiGift, FiHeart, FiShield } from 'react-icons/fi'
import useCatalog from '../lib/useCatalog'
import ProductCard from '../components/products/ProductCard'
import ProductImage from '../components/products/ProductImage'
export default function HomePage() {
 const { categories, products, loading, error } = useCatalog()
 const deals = products.filter(p => Number(p.compare_at_price) > Number(p.price))
 return <>
 <div className="store-container"><AdvertisingCarousel />
 <section className="category-section"><div className="section-heading"><div><span className="eyebrow">SOMETHING FOR EVERYONE</span><h2>Shop by category</h2></div></div><div className="category-row">{categories.map(c=><Link key={c.id} to={'/shop?category='+c.id} className="category-item"><span><ProductImage src={c.image_url} alt={c.name}/></span><strong>{c.name}</strong></Link>)}</div>{!loading && !categories.length && <p className="empty-state">Your gift categories will appear here once added.</p>}</section>
 <section className="latest-section"><div className="section-heading"><div><span className="eyebrow">JUST ARRIVED</span><h2>Latest products</h2></div></div>{error ? <p role="alert" className="empty-state">We could not load the catalog. Please try again shortly.</p> : loading ? <p className="empty-state">Loading gifts?</p> : products.length ? <div className="product-grid">{products.slice(0,10).map(p=><ProductCard key={p.id} product={p}/>)}</div> : <p className="empty-state">Something lovely is on its way. Check back for our first gifts.</p>}</section></div>
 <section className="deals-section"><div className="store-container"><div className="section-heading"><div><span className="eyebrow">A LITTLE EXTRA JOY</span><h2>Deals of the day</h2></div><Link to="/shop?deals=true">Shop the offers <FiArrowRight/></Link></div>{deals.length ? <div className="product-grid">{deals.slice(0,5).map(p=><ProductCard key={p.id} product={p}/>)}</div> : <p className="deals-empty">Good things are worth waiting for. New offers will appear here soon.</p>}</div></section>
 <div className="store-container service-strip">{[[FiGift,'Made for every occasion','Big milestones or little just-becauses.'],[FiHeart,'Thoughtfully selected','Gifts that feel a little more personal.'],[FiShield,'Shop with confidence','Your next special moment starts here.']].map(([Icon,title,copy])=><div key={title}><Icon/><span><strong>{title}</strong><small>{copy}</small></span></div>)}</div></>
}