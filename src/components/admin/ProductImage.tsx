'use client';

import React, { useEffect, useState } from 'react';
import { Package2 } from 'lucide-react';
import Image from 'next/image';

interface ProductImageProps {
  brandName: string;
  rowData: any;

  alt?: string;
  className?: string;
}

export function ProductImage({ brandName, rowData,  alt = "Product Image", className = "" }: ProductImageProps) {
  const [error, setError] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [family, setFamily] = useState<string>();
  const s3_url = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/TRAVIS-Images`;
  const s3_url_ogio = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/OGIO-Images`;
  
  console.log("rowData-- pperpe",rowData)
  useEffect(() => {
    // Get the raw image source and filename
    const rawUrl = rowData?.primary_url || rowData?.primary_image_url;
    const skuValue = rowData?.sku || rowData?.baseSku;

    if (!rawUrl) return;

    // 1. If it's already an absolute URL or starts with /, use it directly
    if (typeof rawUrl === "string" && (rawUrl.startsWith('http') || rawUrl.startsWith('/'))) {
      setPrimaryImage(rawUrl);
      return;
    }

    // 2. Otherwise treatment as a filename and construct S3 URL based on brand
    if (brandName === "Travis Mathew" && typeof skuValue === "string") {
      const fam = skuValue.replace(/_[^_]*$/, '');
      const path = `${s3_url}/${fam}/${rawUrl}`;
      setPrimaryImage(path);
    } else if (brandName === "Ogio" && typeof skuValue === "string") {
      const path = `${s3_url_ogio}/${skuValue}/${rawUrl}`;
      setPrimaryImage(path);
    } else {
      setPrimaryImage(rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`);
    }
  }, [brandName, rowData, s3_url, s3_url_ogio]);

  const displaySrc = primaryImage 

  if (!displaySrc || error) {
    return (
      <div className={`flex items-center justify-center rounded-2xl bg-[#1D1D1D] text-white/20 ${className}`}>
        <Package2 className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#1D1D1D] ${className}`}>
      <Image
        src={displaySrc}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 hover:scale-110"
        onError={() => setError(true)}
        sizes="(max-width: 768px) 44px, 44px"
      />
    </div>
  );
}
