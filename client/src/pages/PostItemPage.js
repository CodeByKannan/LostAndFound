import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import ItemForm from '../components/items/ItemForm';
import './FormPages.css';

const PostItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Item posted successfully!');
      navigate(`/items/${data.item._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post item');
    } finally { setLoading(false); }
  };

  return (
    <div className="form-page">
      <div className="container">
        <div className="form-page-header">
          <h1>Post an Item</h1>
          <p>Report a lost item or a found item to help connect it with its owner.</p>
        </div>
        <div className="form-card">
          <ItemForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default PostItemPage;
