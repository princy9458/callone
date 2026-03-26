"use client"
import React from 'react';
import ProductHeader from "../header/ProductHeader";

export interface TravisMathewHeaderProps {
  totalCount: number;
  onImport: () => void;
  onExportVisible: () => void;
}

export function TravisMathewHeader({ totalCount, onImport, onExportVisible }: TravisMathewHeaderProps) {
  return (
   < ProductHeader title="Travis Mathew" description="Lifestyle apparel and layers from Travis Mathew." totalCount={totalCount} onImport={onImport} onExportVisible={onExportVisible}/>
  );
}
