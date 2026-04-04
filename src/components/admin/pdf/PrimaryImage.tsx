'use client';
import React from 'react';

const PrimaryImage = ({ record }: { record: any }) => {
  const imageUrl = record.primary_image_url || record.image_url || '/placeholder-img.jpg';
  return (
    <img 
      className='w-100 pri-img' 
      src={imageUrl} 
      alt={record.name || 'Product Image'} 
    />
  );
};

export default PrimaryImage;
