"use client"
import React, {useState, useEffect, useMemo} from "react";
import {Loader2, X} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { setCurrentBrand } from "@/store/slices/brandSlice/brandSlice";
import { setCurrentAttribute } from "@/store/slices/attributeSlice/attributeSlice";

type CallCheckSaveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedCollections: string[]) => void;
};

export function CallCheckSaveModal({isOpen, onClose, onSave}: CallCheckSaveModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const {allBrand, isFetchedBrand} = useSelector((state: RootState) => state.brand);

  const {allAttribute,isFetchedAttribute}=useSelector((state:RootState)=>state.attribute)
  const dispatch=useDispatch<AppDispatch>()
  // Reset selected state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelected(new Set());
    }
  }, [isOpen]);

  const collections = useMemo(() => {
    if (!isFetchedBrand || allBrand.length === 0) {
      return [];
    }
    return allBrand.map((brand) => ({
      id: brand.collection ?? "",
      label: brand.name ?? "",
    }));
  }, [allBrand, isFetchedBrand]);

  const isLoading = !isFetchedBrand;

  if (!isOpen) {
    return null;
  }


  const toggleSelection = (id: string) => {
    const selectedBrand= allBrand.find((brand) => brand.collection === id);
    const selectedAttribute= allAttribute.find((attribute) => attribute.name === selectedBrand?.name);
    console.log("selectedAttribute",selectedAttribute)
    console.log("selectedBrand",selectedBrand)
    if(selectedBrand && selectedAttribute){
      dispatch(setCurrentAttribute(selectedAttribute))
      dispatch(setCurrentBrand(selectedBrand))
      setSelected(new Set([id]));
    }
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-border/60 bg-surface shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Save to Database</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-foreground/50 transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4 text-sm text-foreground/70">
            Please select the collections to associate with this dataset:
          </p>
          <div className="space-y-3">   
            {isLoading?(
              <div className="flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ):(
            collections.map((collection) => (
              <label
                key={collection.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/40 p-3 transition-colors hover:bg-surface-muted"
              >
                <input
                  type="radio"
                  name="datasetCollection"
                  checked={selected.has(collection.id)}
                  onChange={() => toggleSelection(collection.id)}
                  className="h-4 w-4 border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm font-medium text-foreground">
                  {collection.label}
                </span>
              </label>
            )))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border/60 bg-surface-muted/50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-[14px] px-4 py-2 text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-[14px] bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Save Dataset
          </button>
        </div>
      </div>
    </div>
  );
}
