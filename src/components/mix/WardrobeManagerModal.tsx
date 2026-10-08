import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UserWardrobeItem } from '../../types';
import { X, Plus, Trash2, Upload, Check, AlertCircle, Sparkles, CheckSquare, Square } from 'lucide-react';

interface WardrobeManagerModalProps {
  onClose: () => void;
  onMixWithTraditional?: (selectedItems: UserWardrobeItem[]) => void;
}

export type WardrobeCategory = 'jacket' | 'shirt' | 'pants' | 'jewelry' | 'accessory' | 'bag' | 'shoes' | 'other';

export const CATEGORY_LABELS: Record<WardrobeCategory, string> = {
  jacket: 'Áo khoác / Blazer',
  shirt: 'Áo sơ mi / Croptop / Áo thun',
  pants: 'Quần / Chân váy',
  jewelry: 'Trang sức (Kiềng, hoa tai, vòng, ngọc)',
  accessory: 'Phụ kiện (Nón, quạt, khăn lụa, kính)',
  bag: 'Túi xách / Ví',
  shoes: 'Giày / Guốc / Boots',
  other: 'Món đồ khác'
};

export const WardrobeManagerModal: React.FC<WardrobeManagerModalProps> = ({ 
  onClose,
  onMixWithTraditional
}) => {
  const { wardrobeItems, addWardrobeItem, removeWardrobeItem } = useApp();

  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategory] = useState<WardrobeCategory>('jacket');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  // Single front upload slot (no 3D needed)
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chỉ tải tệp hình ảnh (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setter(uploadEvent.target?.result as string);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = () => {
    if (!itemName.trim()) {
      setErrorMsg('Vui lòng nhập tên món đồ của bạn.');
      return;
    }
    if (!frontImage) {
      setErrorMsg('Vui lòng tải lên ít nhất ảnh mặt trước của món đồ.');
      return;
    }

    const res = addWardrobeItem({
      name: itemName.trim(),
      category: category as any,
      frontImage: frontImage || undefined,
    });

    if (!res.success) {
      setErrorMsg(res.message || 'Không thể thêm món đồ.');
      return;
    }

    // Reset form
    setItemName('');
    setCategory('jacket');
    setFrontImage(null);
    setIsAddingNew(false);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative flex flex-col w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-2xl overflow-hidden border border-[#E9DFD1] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E9DFD1] bg-[#F5EDE1]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B2226]">
              Bộ Sưu Tập Riêng Của Bạn
            </span>
            <h3 className="font-heritage text-xl font-bold text-[#2C241D]">
              Tủ Đồ Của Tôi ({wardrobeItems.length} món)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form to add item */}
          {isAddingNew ? (
            <div className="p-5 rounded-2xl bg-[#F8F3EC] border border-[#DFCFC0] space-y-4 mb-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-heritage font-bold text-sm text-[#2C241D]">
                  Thêm Món Đồ Mới
                </h4>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Hủy
                </button>
              </div>

              {/* Name & Category */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                    Tên món đồ
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="VD: Blazer da oversize, Túi gấm..."
                    className="w-full px-3 py-2 bg-white border border-[#D8C7B3] rounded-xl text-xs focus:ring-1 focus:ring-[#9B2226] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3E35] mb-1">
                    Loại trang phục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
                    className="w-full px-3 py-2 bg-white border border-[#D8C7B3] rounded-xl text-xs focus:ring-1 focus:ring-[#9B2226] focus:outline-none"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
                      <option key={catKey} value={catKey}>
                        {catLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* CHỈ CẦN CHỤP / TẢI ẢNH MẶT TRƯỚC */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3E35] mb-2">
                  Ảnh mặt trước món đồ (Chỉ cần 1 ảnh mặt trước rõ nét):
                </label>

                <div
                  onClick={() => frontInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all aspect-4/3 max-w-sm mx-auto ${
                    frontImage
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-[#CBB9A1] bg-white hover:bg-stone-50'
                  }`}
                >
                  {frontImage ? (
                    <>
                      <img
                        src={frontImage}
                        alt="Ảnh mặt trước"
                        className="w-full h-full object-contain rounded-xl"
                      />
                      <div className="absolute top-2 right-2 p-1.5 bg-emerald-600 text-white rounded-full shadow-md">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                      <span className="absolute bottom-2 px-2.5 py-1 bg-black/60 text-white text-[10px] rounded-lg">
                        Bấm để đổi ảnh khác
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#800E13] mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-[#4A3E35]">Chụp hoặc tải ảnh mặt trước</span>
                      <span className="text-[10px] text-[#9C8B7D] mt-0.5">Chỉ cần 1 ảnh mặt trước rõ nét để phối đồ cùng cổ phục</span>
                    </>
                  )}
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, setFrontImage)}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-5 py-2 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-medium rounded-xl transition-all shadow-sm"
                >
                  Lưu vào tủ đồ
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingNew(true)}
              className="w-full mb-6 py-3.5 px-4 rounded-2xl border-2 border-dashed border-[#CBB9A1] hover:border-[#800E13] hover:bg-[#FAF5EE] text-[#800E13] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs hover:shadow-xs group"
            >
              <div className="p-1 rounded-lg bg-[#800E13]/10 text-[#800E13] group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
              <span>+ Thêm món đồ mới (Trang phục, Trang sức, Phụ kiện, Giày...)</span>
            </button>
          )}

          {/* List of currently uploaded items */}
          <div className="space-y-3">
            {wardrobeItems.length === 0 ? (
              <div className="text-center py-8 text-[#786454]">
                <p className="text-xs">Chưa có món đồ cá nhân nào được thêm.</p>
                <p className="text-[11px] text-[#9C8B7D] mt-1">
                  Hãy bấm nút "Thêm đồ của bạn" để phối túi xách, áo khoác hay giày của riêng bạn với cổ phục Việt.
                </p>
              </div>
            ) : (
              wardrobeItems.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemIds(prev =>
                        prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                      );
                    }}
                    className={`flex items-center justify-between p-3.5 bg-white border-2 rounded-2xl shadow-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#800E13] ring-2 ring-[#800E13]/20 bg-amber-50/20'
                        : 'border-[#E9DFD1] hover:border-[#D4A373]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <div className="text-[#800E13]">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#800E13]" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-300" />
                        )}
                      </div>

                      <div className="w-12 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                        {item.frontImage ? (
                          <img
                            src={item.frontImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                            No pic
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#8C7A6B]">
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        <h4 className="font-semibold text-xs sm:text-sm text-[#2C241D]">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-medium ${isSelected ? 'text-[#800E13] font-bold' : 'text-emerald-700'}`}>
                            {isSelected ? '✓ Đã chọn phối cùng cổ phục' : 'Nhấp để chọn món này'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => removeWardrobeItem(item.id)}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Xóa món đồ này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F8F3EC] border-t border-[#E9DFD1] flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-100 text-[#6C584C] border border-[#D5C2AF] text-xs font-medium rounded-xl transition-colors"
          >
            Đóng
          </button>

          {wardrobeItems.length > 0 && (
            <button
              onClick={() => {
                const selected = wardrobeItems.filter(i => selectedItemIds.includes(i.id));
                const finalSelected = selected.length > 0 ? selected : wardrobeItems;
                onMixWithTraditional?.(finalSelected);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#800E13] hover:bg-[#9B2226] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#800E13]/25"
            >
              <Sparkles className="w-4 h-4 text-[#E9C46A]" />
              <span>
                Phối cùng trang phục truyền thống {selectedItemIds.length > 0 ? `(${selectedItemIds.length} món)` : ''}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
