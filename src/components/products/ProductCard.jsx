import { useState } from 'react'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import { FiPlus } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import ProductImage from './ProductImage'
export default function ProductCard({product}){
 const {addItem}=useCart(),{user}=useAuth()
 const [adding,setAdding]=useState(false)
 const discount=Number(product.compare_at_price)>Number(product.price)?Math.round((1-product.price/product.compare_at_price)*100):0
 async function add(){if(!user)return toast.error('Sign in to add gifts to your cart');setAdding(true);try{await addItem(product.id,1);toast.success(product.name+' added to cart')}catch(e){toast.error(e.message)}finally{setAdding(false)}}
 return <article className="product-card"><Link to={'/product/'+product.id} className="product-image">{discount>0&&<span className="discount-badge">?{discount}%</span>}<ProductImage src={product.image_url} alt={product.name} loading="lazy"/></Link><div className="product-info"><p className="product-category">{product.categories?.name||'Gifts'}</p><Link to={'/product/'+product.id}><h3>{product.name}</h3></Link><p className="product-description">{product.description||'A thoughtful gift for a special someone.'}</p><div className="product-price">${Number(product.price).toFixed(2)}{discount>0&&<del>${Number(product.compare_at_price).toFixed(2)}</del>}</div><button onClick={add} disabled={adding||product.stock===0}>{product.stock===0?'Sold out':adding?'Adding?':<><FiPlus/> Add to cart</>}</button></div></article>
}