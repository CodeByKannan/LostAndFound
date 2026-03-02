import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { FiSearch, FiAlertCircle, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export default function Home() {
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, resolved: 0 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/items?limit=6&sort=-createdAt&status=active')
      .then(r => setRecent(r.data.items));
    Promise.all([
      axios.get('/api/items?type=lost&status=active&limit=1'),
      axios.get('/api/items?type=found&status=active&limit=1'),
      axios.get('/api/items?status=resolved&limit=1'),
    ]).then(([lost, found, resolved]) =>
      setStats({ lost: lost.data.total, found: found.data.total, resolved: resolved.data.total })
    );
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-24 sm:px-6 text-center">
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-4 leading-tight">
            Lost something on<br />campus? <span className="text-accent-400">We've got you.</span>
          </h1>
          <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto">
            Reuniting the campus community with their belongings. Post lost & found items, submit claims, and get notified of matches.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/items?search=${search}`; }} className="flex gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for your item…" className="w-full pl-11 pr-4 py-3.5 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm" />
            </div>
            <button type="submit" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors">Search</button>
          </form>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/items?type=lost" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">Browse Lost Items</Link>
            <Link to="/post" className="bg-white text-primary-700 hover:bg-primary-50 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">Post an Item</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 text-red-600 mb-1"><FiAlertCircle size={20} /><span className="font-display text-3xl font-bold">{stats.lost}</span></div>
              <p className="text-sm text-slate-500">Items Looking for Owners</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1"><FiCheckCircle size={20} /><span className="font-display text-3xl font-bold">{stats.found}</span></div>
              <p className="text-sm text-slate-500">Found Items Waiting</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-primary-600 mb-1"><FiTrendingUp size={20} /><span className="font-display text-3xl font-bold">{stats.resolved}</span></div>
              <p className="text-sm text-slate-500">Successfully Reunited</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent items */}
      <section className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">Recent Postings</h2>
          <Link to="/items" className="text-sm text-primary-600 font-semibold hover:underline">View all →</Link>
        </div>
        {recent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recent.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-10">No items posted yet. Be the first!</p>
        )}
      </section>
    </div>
  );
}
