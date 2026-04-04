'use client';
import React from 'react';

const VarationSkuInfo = ({ variation_sku_data }: { variation_sku_data: any[] }) => {
  if (!variation_sku_data || !variation_sku_data.length) return null;
  
  return (
    <div className="variation-info mt-3">
      <h6 className="mb-2">Variation SKUs</h6>
      <div className="d-flex flex-wrap gap-2">
        {variation_sku_data.map((item, index) => (
          <div key={index} className="variation-item border px-2 py-1 rounded">
            {item.sku} - {item.size}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VarationSkuInfo;
