import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-lg text-white mb-3">
              <span className="text-xl">🔍</span> Campus L&F
            </div>
            <p className="text-sm leading-relaxed">Helping your campus community reconnect with lost belongings, one item at a time.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/items?type=lost" className="hover:text-white transition-colors">Lost Items</Link></li>
              <li><Link to="/items?type=found" className="hover:text-white transition-colors">Found Items</Link></li>
              <li><Link to="/post" className="hover:text-white transition-colors">Post an Item</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} Campus Lost & Found. Built with MERN Stack.</p>
        </div>
      </div>
    </footer>
  );
}
