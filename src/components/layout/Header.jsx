import UserDropdown from './UserDropdown'
import { useState } from 'react'
import { Link,useNavigate } from 'react-router'
import { FiGift,FiSearch,FiShoppingBag } from 'react-icons/fi'

import { useCart } from '../../context/CartContext'
import useCatalog from '../../lib/useCatalog'
export default function Header(){
 const {items}=useCart(),{categories}=useCatalog()
 const [search,setSearch]=useState(''),[category,setCategory]=useState('')
 const navigate=useNavigate()
 function submit(e){e.preventDefault();const p=new URLSearchParams();if(search.trim())p.set('q',search.trim());if(category)p.set('category',category);navigate('/shop?'+p)}
 return <header className="store-header"><div className="store-container header-inner"><Link to="/" className="brand"><FiGift/><span>Fiyoore <b>Gifts</b><small>A LITTLE GIFT. A LOT OF LOVE.</small></span></Link><form onSubmit={submit} className="store-search"><select aria-label="Search category" value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input aria-label="Search gifts" placeholder="Find something thoughtful?" value={search} onChange={e=>setSearch(e.target.value)}/><button aria-label="Search"><FiSearch size={21}/></button></form><nav className="header-actions"><Link to="/cart" className="cart-link"><FiShoppingBag size={21}/> Cart <span>{items.reduce((s,i)=>s+i.quantity,0)}</span></Link><UserDropdown /></nav></div></header>
}