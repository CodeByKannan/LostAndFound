import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useState } from 'react';
import ItemForm from '../components/ItemForm';

export default function PostItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (fd) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/items', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item posted successfully!');
      navigate(`/items/${data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post item');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Post an Item</h1>
      <p className="text-slate-500 mb-8">Fill out the form below to report a lost or found item on campus.</p>
      <div className="card p-8">
        <ItemForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
