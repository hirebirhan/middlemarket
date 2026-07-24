import Link from "next/link";

export default function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-4xl font-bold mb-4">
        Get what you need at a <span className="text-indigo-600">fair price</span>
      </h1>
      <p className="text-slate-600 max-w-xl mx-auto mb-8">
        Post what you&apos;re looking for — a product or a service. Sellers make offers, and our
        team reviews every price to keep it competitive and rational before you accept.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/register?role=BUYER"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
        >
          I want to buy
        </Link>
        <Link
          href="/register?role=SELLER"
          className="bg-white border border-indigo-600 text-indigo-700 px-6 py-3 rounded-lg hover:bg-indigo-50"
        >
          I want to sell
        </Link>
      </div>
      <div className="grid sm:grid-cols-3 gap-6 mt-16 text-left">
        {[
          ["1. Post a request", "Buyers describe the product or service they need and an optional budget."],
          ["2. Sellers make offers", "Sellers browse open requests and submit a price and pitch."],
          ["3. We mediate the price", "Every offer is reviewed for fair pricing before the buyer accepts and an order is created."],
        ].map(([title, body]) => (
          <div key={title} className="bg-white rounded-lg border p-5">
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-slate-600">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
