import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const CATEGORIES = ['', 'Electronics', 'Clothing', 'Books', 'ID/Cards', 'Keys', 'Bags', 'Jewelry', 'Sports', 'Other'];

export default function ItemList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (type) params.set('type', type);
    if (category) params.set('category', category);
    if (search) params.set('search', search);

    axios.get(`/api/items?${params}`)
      .then(r => { setItems(r.data.items); setTotal(r.data.total); setPages(r.data.pages); })
      .finally(() => setLoading(false));
  }, [type, category, search, page]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.set('page', '1');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', localSearch);
  };

  const clearAll = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            {type === 'lost' ? '🔴 Lost Items' : type === 'found' ? '🟢 Found Items' : '📋 All Items'}
          </h1>
          <p className="text-slate-500 mt-1">{total} item{total !== 1 ? 's' : ''} found</p>
        </div>
        {(type || category || search) && (
          <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-600 transition-colors">
            <FiX size={15} /> Clear filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Search items…" className="input-field pl-9 py-2 text-sm" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-sm">Search</button>
        </form>

        <select value={type} onChange={e => setFilter('type', e.target.value)} className="input-field w-auto py-2 text-sm">
          <option value="">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <select value={category} onChange={e => setFilter('category', e.target.value)} className="input-field w-auto py-2 text-sm">
          <option value="">All Categories</option>
          {CATEGORIES.filter(Boolean).map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="card h-64 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setFilter('page', String(p))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-slate-700">No items found</p>
          <p className="text-sm mt-1">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
