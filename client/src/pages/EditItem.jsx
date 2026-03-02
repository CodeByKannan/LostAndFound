import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ItemForm from '../components/ItemForm';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`/api/items/${id}`).then(r => setItem(r.data));
  }, [id]);

  const handleSubmit = async (fd) => {
    setLoading(true);
    try {
      await axios.put(`/api/items/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item updated!');
      navigate(`/items/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item');
    } finally { setLoading(false); }
  };

  if (!item) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Edit Item</h1>
      <p className="text-slate-500 mb-8">Update the details for your posting.</p>
      <div className="card p-8">
        <ItemForm
          initialData={{ ...item, building: item.location?.building, area: item.location?.area, locationDesc: item.location?.description, dateLostFound: item.dateLostFound?.split('T')[0], tags: item.tags?.join(', '), contactEmail: item.contactInfo?.email, contactPhone: item.contactInfo?.phone }}
          onSubmit={handleSubmit} loading={loading}
        />
      </div>
    </div>
  );
}
