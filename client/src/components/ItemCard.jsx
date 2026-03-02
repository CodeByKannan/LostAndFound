import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiEye } from 'react-icons/fi';

const categoryEmoji = {
  Electronics: '📱', Clothing: '👕', Books: '📚', 'ID/Cards': '🪪',
  Keys: '🔑', Bags: '🎒', Jewelry: '💍', Sports: '⚽', Other: '📦',
};

export default function ItemCard({ item }) {
  const isLost = item.type === 'lost';
  return (
    <Link to={`/items/${item._id}`} className="card group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        {item.images?.[0] ? (
          <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">{categoryEmoji[item.category] || '📦'}</div>
        )}
        <div className="absolute top-3 left-3">
          <span className={isLost ? 'badge-lost' : 'badge-found'}>{isLost ? '🔴 Lost' : '🟢 Found'}</span>
        </div>
        {item.status === 'resolved' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1 rounded-full">✅ Resolved</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-primary-600 transition-colors">{item.title}</h3>
          <span className="text-lg flex-shrink-0">{categoryEmoji[item.category] || '📦'}</span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 flex-1">{item.description}</p>
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-50">
          <span className="flex items-center gap-1"><FiMapPin size={11} />{item.location?.building}</span>
          <span className="flex items-center gap-1"><FiCalendar size={11} />{new Date(item.dateLostFound).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><FiEye size={11} />{item.views}</span>
        </div>
      </div>
    </Link>
  );
}
