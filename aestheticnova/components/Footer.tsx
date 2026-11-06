import Link from 'next/link';

export function Footer({ contact }: { contact?: any }) {
  return (
    <footer className="border-t border-border bg-gray-900 text-gray-300 mt-auto">
      <div className="px-4 py-8 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <span className="text-indigo-400 font-extrabold text-lg">AESTHETIC</span>
            <span className="text-white font-bold">NOVA</span>
            <p className="mt-2 text-sm opacity-70">
              Curated aesthetic essentials for every moment.
            </p>
          </div>
          <div className="space-y-2">
            <span className="font-semibold text-white text-sm">Shop</span>
            <Link href="/" className="text-sm hover:text-white transition">Home</Link>
            <Link href="/products" className="text-sm hover:text-white transition">All Products</Link>
          </div>
          <div className="space-y-2">
            <span className="font-semibold text-white text-sm">Support</span>
            <a href="mailto:hello@aestheticnova.in" className="text-sm hover:text-white transition">
              Contact Us
            </a>
            <a href="/#returns" className="text-sm hover:text-white transition">
              Returns & Refunds
            </a>
          </div>
          <div className="space-y-2">
            <span className="font-semibold text-white text-sm">Follow</span>
            <a
              href="https://instagram.com/aestheticnova"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-white transition"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-xs opacity-60 text-center">
          {contact?.contact_address && <p>{contact.contact_address}</p>}
          <p>© {new Date().getFullYear()} AESTHETICNOVA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
