import React from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Textarea from '../atoms/Textarea';

const FormField = ({ label, type = 'text', value, onChange, placeholder, options, required = false }) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return <Textarea value={value} onChange={onChange} placeholder={placeholder} />;
      case 'select':
        return <Select value={value} onChange={onChange} options={options} />;
      default:
        return <Input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} />;
    }
  };

  return (
    <div>
      <Label>{label}</Label>
      {renderInput()}
    </div>
  );
};

export default FormField;