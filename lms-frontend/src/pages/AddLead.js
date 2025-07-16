import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeadForm from '../components/LeadForm';

const AddLead = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/leads');
  };

  const handleCancel = () => {
    navigate('/leads');
  };

  return (
    <LeadForm onSuccess={handleSuccess} onCancel={handleCancel} />
  );
};

export default AddLead; 