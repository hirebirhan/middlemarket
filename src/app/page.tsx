import Link from "next/link";

const CATEGORIES = [
  { icon: "📱", name: "Electronics" },
  { icon: "🛠️", name: "Home services" },
  { icon: "🚗", name: "Vehicles & parts" },
  { icon: "🎨", name: "Design & creative" },
  { icon: "📦", name: "Wholesale goods" },
  { icon: "💻", name: "Tech & IT services" },
  { icon: "🏠", name: "Real estate help" },
  { icon: "✂️", name: "Personal services" },
];

const STEPS = [
  {
    n: "1",
    title: "Post a request",
    body: "Describe the product or service you need, with details and an optional budget. It takes less than a minute.",
  },
  {
    n: "2",
    title: "Sellers compete",
    body: "Verified sellers browse open requests and submit their best price along with a pitch — timeline, quality, and what's included.",
  },
  {
    n: "3",
    title: "We mediate the price",
    body: "Our team reviews every single offer before you see it. Overpriced offers get adjusted or rejected, so what reaches you is competitive and rational.",
  },
  {
    n: "4",
    title: "Accept & track",
    body: "Accept the offer you like and we track the order from pending to delivered — with a clear status at every step.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="text-center pt-16 pb-12">
        <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wide uppercase rounded-full px-4 py-1.5 mb-6">
          Products · Services · Fair prices
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
          Get what you need at a{" "}
          <span className="text-indigo-600">fair, mediated price</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
          MiddleMarket sits between buyers and sellers. You post what you want, sellers
          compete for your business, and every price is reviewed by our team before it ever
          reaches you — no haggling, no overpaying.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register?role=BUYER"
            className="bg-indigo-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
          >
            I want to buy →
          </Link>
          <Link
            href="/register?role=SELLER"
            className="bg-white border-2 border-indigo-600 text-indigo-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-indigo-50 transition"
          >
            I want to sell
          </Link>
        </div>
        <div className="flex justify-center gap-10 mt-12 text-sm text-slate-500">
          <div>
            <p className="text-2xl font-bold text-slate-900">100%</p>
            <p>offers price-reviewed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">2 min</p>
            <p>to post a request</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">0 fees</p>
            <p>for buyers to post</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-2">
          Anything, from products to services
        </h2>
        <p className="text-slate-500 text-center mb-8">
          If someone can sell it, you can request it.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <div
              key={c.name}
              className="bg-white border rounded-xl p-4 flex items-center gap-3 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <span className="text-2xl">{c.icon}</span>
              <span className="text-sm font-medium">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 border-t">
        <h2 className="text-2xl font-bold text-center mb-2">How it works</h2>
        <p className="text-slate-500 text-center mb-10">
          A human in the middle keeps every deal honest.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-white border rounded-xl p-6 relative">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why mediated */}
      <section className="py-12 border-t">
        <div className="bg-indigo-600 rounded-2xl px-8 py-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Why a mediated marketplace?</h2>
          <p className="max-w-2xl mx-auto text-indigo-100 mb-8">
            Open marketplaces leave you guessing whether a price is fair. Here, a real
            reviewer compares every offer against the market and the buyer&apos;s budget —
            adjusting or rejecting anything unreasonable before you ever see it.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-indigo-700 font-semibold px-8 py-3 rounded-xl hover:bg-indigo-50 transition"
          >
            Get started free
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-slate-400">
        MiddleMarket — connecting what people want with who can offer it, at a rational price.
      </footer>
    </div>
  );
}
