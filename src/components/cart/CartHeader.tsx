import React from 'react';
import { Edit2, Check } from 'lucide-react';
import { UserInterface } from '@/store/slices/users/userSlice';

interface CartHeaderProps {
  selectedRetailer: UserInterface | null;
  selectedManager: UserInterface | null;
  selectedSalesRep: UserInterface | null;
  allRetailer: UserInterface[];
  allManager: UserInterface[];
  allSaleRep: UserInterface[];
  isEditingRetailer: boolean;
  setIsEditingRetailer: (val: boolean) => void;
  isEditingManager: boolean;
  setIsEditingManager: (val: boolean) => void;
  isEditingSalesRep: boolean;
  setIsEditingSalesRep: (val: boolean) => void;
  onUpdateRetailer: (id: string) => void;
  onUpdateManager: (id: string) => void;
  onUpdateSalesRep: (id: string) => void;
  setSelectedRetailer: (val: UserInterface | null) => void;
  setSelectedManager: (val: UserInterface | null) => void;
  setSelectedSalesRep: (val: UserInterface | null) => void;
}

export const CartHeader: React.FC<CartHeaderProps> = ({
  selectedRetailer,
  selectedManager,
  selectedSalesRep,
  allRetailer,
  allManager,
  allSaleRep,
  isEditingRetailer,
  setIsEditingRetailer,
  isEditingManager,
  setIsEditingManager,
  isEditingSalesRep,
  setIsEditingSalesRep,
  onUpdateRetailer,
  onUpdateManager,
  onUpdateSalesRep,
  setSelectedRetailer,
  setSelectedManager,
  setSelectedSalesRep,
}) => {
  return (
    <div className="grid gap-6 rounded-[32px] border border-border/50 bg-background p-8 shadow-sm md:grid-cols-3">
      {/* Retailer Section */}
      <div className="relative group min-h-[100px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Retailer</span>
          {selectedRetailer && !isEditingRetailer && (
            <button
              onClick={() => setIsEditingRetailer(true)}
              className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-primary transition-colors"
            >
              <Edit2 size={12} />
            </button>
          )}
        </div>

        {!selectedRetailer || isEditingRetailer ? (
          <div className="space-y-2">
            <select
              className="w-full rounded-xl border border-border/60 bg-foreground/5 px-3 py-2 text-sm font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              value={selectedRetailer?._id || ""}
              onChange={(e) => {
                const retailer = allRetailer.find(r => r._id === e.target.value);
                setSelectedRetailer(retailer || null);
                setIsEditingRetailer(false);
                onUpdateRetailer(retailer?._id || "");
              }}
            >
              <option value="">Select Retailer</option>
              {allRetailer.map((r: any) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-black text-primary leading-tight">{selectedRetailer?.name}</h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-foreground/60">
              <div className="flex flex-col gap-0.5">
                <span className="opacity-40 uppercase tracking-tighter text-[9px]">City</span>
                <span className="text-foreground/80">{selectedRetailer?.address || "New Delhi, India"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="opacity-40 uppercase tracking-tighter text-[9px]">GSTIN NO.</span>
                <span className="flex items-center gap-1.5 text-foreground/80">
                  {selectedRetailer?.gstin || "GSTIN123456"}
                  <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Check size={9} strokeWidth={3} />
                  </div>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manager Section */}
      <div className="relative group min-h-[100px] border-l border-border/30 pl-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Manager</span>
          {selectedManager && !isEditingManager && (
            <button
              onClick={() => setIsEditingManager(true)}
              className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-primary transition-colors"
            >
              <Edit2 size={12} />
            </button>
          )}
        </div>

        {!selectedManager || isEditingManager ? (
          <select
            className="w-full rounded-xl border border-border/60 bg-foreground/5 px-3 py-2 text-sm font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            value={selectedManager?._id || ""}
            onChange={(e) => {
              const manager = allManager.find(m => m._id === e.target.value);
              setSelectedManager(manager || null);
              setIsEditingManager(false);
              onUpdateManager(manager?._id || "");
            }}
          >
            <option value="">Select Manager</option>
            {allManager.map((m: any) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        ) : (
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground/80 leading-tight">{selectedManager?.name}</h3>
            <p className="text-[11px] font-bold text-foreground/40">Assigned Manager</p>
          </div>
        )}
      </div>

      {/* Sales Rep Section */}
      <div className="relative group min-h-[100px] border-l border-border/30 pl-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Sales Representative</span>
          {selectedSalesRep && !isEditingSalesRep && (
            <button
              onClick={() => setIsEditingSalesRep(true)}
              className="p-1.5 rounded-lg hover:bg-foreground/5 text-foreground/40 hover:text-primary transition-colors"
            >
              <Edit2 size={12} />
            </button>
          )}
        </div>

        {!selectedSalesRep || isEditingSalesRep ? (
          <select
            className="w-full rounded-xl border border-border/60 bg-foreground/5 px-3 py-2 text-sm font-bold outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            value={selectedSalesRep?._id || ""}
            onChange={(e) => {
              const rep = allSaleRep.find(s => s._id === e.target.value);
              setSelectedSalesRep(rep || null);
              setIsEditingSalesRep(false);
              onUpdateSalesRep(rep?._id || "");
            }}
          >
            <option value="">Select Representative</option>
            <option value="self">Self</option>
            {allSaleRep.map((s: any) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        ) : (
          <div className="space-y-1">
            <h3 className="text-lg font-black text-foreground/80 leading-tight">{selectedSalesRep?.name || "Self"}</h3>
            <p className="text-[11px] font-bold text-foreground/40">Active Representative</p>
          </div>
        )}
      </div>
    </div>
  );
};
