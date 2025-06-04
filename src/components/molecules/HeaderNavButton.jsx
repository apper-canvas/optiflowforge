import React from 'react';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';

const HeaderNavButton = ({ iconName, onClick }) => {
  return (
    <Button variant="ghost" onClick={onClick} className="p-2">
      <Icon name={iconName} className="w-5 h-5 text-surface-600" />
    </Button>
  );
};

export default HeaderNavButton;