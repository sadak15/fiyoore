export default function ProductImage({ src, alt = '', ...props }) {
 return <img {...props} src={src || '/picture.png'} alt={alt} onError={e => { if (e.currentTarget.getAttribute('src') !== '/picture.png') e.currentTarget.src = '/picture.png' }} />
}