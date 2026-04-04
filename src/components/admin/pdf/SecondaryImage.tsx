'use client';
import React from 'react';

const SecondaryImage = ({ record }: { record: any }) => {
  const images = record.gallery_images_url || [];
  return (
    <div className="d-flex gap-2">
      {images.map((img: string, index: number) => (
        <img 
          key={index} 
          src={img} 
          alt={`Gallery Image ${index + 1}`} 
          className="secondary-img" 
        />
      ))}
    </div>
  );
};

export default SecondaryImage;
