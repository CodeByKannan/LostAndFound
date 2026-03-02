import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import ItemForm from '../components/items/ItemForm';
import './FormPages.css';

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`).then(({ data }) => setItem(data.item)).catch(() => { toast.error('Item not found'); navigate('/items'); });
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/items/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item updated!');
      navigate(`/items/${data.item._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  if (!item) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="form-page">
      <div className="container">
        <div className="form-page-header">
          <h1>Edit Item</h1>
          <p>Update the details for your posted item.</p>
        </div>
        <div className="form-card">
          <ItemForm initialData={item} onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default EditItemPage;
