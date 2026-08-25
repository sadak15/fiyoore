import { Link } from 'react-router'

export default function HomePage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-plum-900 sm:text-5xl">
        Gifts worth <span className="text-coral-500">following</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-plum-600">
        Discover thoughtful gifts, follow the shops and friends whose taste you trust,
        and build a wishlist people can actually shop from.
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-block rounded-full bg-plum-800 px-6 py-3 font-medium text-white hover:bg-coral-500 transition-colors"
      >
        Browse the shop
      </Link>
    </section>
  )
}
