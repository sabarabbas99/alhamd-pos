import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Barcode,
  X,
  PlusCircle,
  FolderPlus,
  Layers,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

// Popular 25 Pakistani Karyana items for instant 1-click import
const PAKISTANI_POPULAR_PACK = [
  { name: 'Mezan Cooking Oil 1L Pouch', category: 'Oil & Ghee', purchasePrice: 485, salePrice: 525, stock: 24, minStock: 6, unit: 'pouch', barcode: '8966001001' },
  { name: 'Habib Banaspati Ghee 1kg Pouch', category: 'Oil & Ghee', purchasePrice: 480, salePrice: 520, stock: 20, minStock: 6, unit: 'pouch', barcode: '8966001002' },
  { name: 'Kisan Cooking Oil 1L Pouch', category: 'Oil & Ghee', purchasePrice: 475, salePrice: 515, stock: 18, minStock: 6, unit: 'pouch', barcode: '8966001003' },
  { name: 'Chakki Aata Desi 10kg Bag', category: 'Daalein & Chawal', purchasePrice: 1250, salePrice: 1380, stock: 15, minStock: 5, unit: 'bag', barcode: '8966002001' },
  { name: 'Dal Maash Dhuli 1kg', category: 'Daalein & Chawal', purchasePrice: 440, salePrice: 490, stock: 12, minStock: 4, unit: 'kg', barcode: '8966002002' },
  { name: 'Kala Chana 1kg', category: 'Daalein & Chawal', purchasePrice: 210, salePrice: 250, stock: 25, minStock: 6, unit: 'kg', barcode: '8966002003' },
  { name: 'Baisan (Gram Flour) 1kg', category: 'Daalein & Chawal', purchasePrice: 240, salePrice: 280, stock: 20, minStock: 5, unit: 'kg', barcode: '8966002004' },
  { name: 'National Korma Masala', category: 'Masalay', purchasePrice: 110, salePrice: 130, stock: 35, minStock: 8, unit: 'pack', barcode: '8966003001' },
  { name: 'National Chaat Masala 100g', category: 'Masalay', purchasePrice: 95, salePrice: 115, stock: 25, minStock: 6, unit: 'pack', barcode: '8966003002' },
  { name: 'Shan Nihari Masala', category: 'Masalay', purchasePrice: 115, salePrice: 135, stock: 20, minStock: 6, unit: 'pack', barcode: '8966003003' },
  { name: 'Shan Karahi Masala', category: 'Masalay', purchasePrice: 115, salePrice: 135, stock: 25, minStock: 6, unit: 'pack', barcode: '8966003004' },
  { name: 'Kala Zeera 100g Pkt', category: 'Masalay', purchasePrice: 160, salePrice: 200, stock: 15, minStock: 4, unit: 'pack', barcode: '8966003005' },
  { name: 'Dhaniya Sabut 250g', category: 'Masalay', purchasePrice: 120, salePrice: 160, stock: 18, minStock: 5, unit: 'pack', barcode: '8966003006' },
  { name: 'Tarang Tea Whitener 225ml', category: 'Chai & Doodh', purchasePrice: 75, salePrice: 85, stock: 48, minStock: 12, unit: 'pack', barcode: '8966004001' },
  { name: 'Rooh Afza Sharbat 800ml Bottle', category: 'Beverages', purchasePrice: 380, salePrice: 420, stock: 16, minStock: 4, unit: 'bottle', barcode: '8966005001' },
  { name: 'Tang Orange 375g Pouch', category: 'Beverages', purchasePrice: 320, salePrice: 360, stock: 14, minStock: 4, unit: 'pouch', barcode: '8966005002' },
  { name: 'Kolson Macaroni Large 400g', category: 'Biscuits & Snacks', purchasePrice: 130, salePrice: 155, stock: 20, minStock: 5, unit: 'pack', barcode: '8966006001' },
  { name: 'Bake Parlor Spaghetti 400g', category: 'Biscuits & Snacks', purchasePrice: 135, salePrice: 160, stock: 18, minStock: 5, unit: 'pack', barcode: '8966006002' },
  { name: 'Sooper Biscuit Family Pack', category: 'Biscuits & Snacks', purchasePrice: 90, salePrice: 100, stock: 36, minStock: 10, unit: 'pack', barcode: '8966006003' },
  { name: 'Rio Strawberry Family Pack', category: 'Biscuits & Snacks', purchasePrice: 90, salePrice: 100, stock: 30, minStock: 10, unit: 'pack', barcode: '8966006004' },
  { name: 'Safeguard Bar Soap 115g', category: 'Soap & Surf', purchasePrice: 125, salePrice: 145, stock: 35, minStock: 8, unit: 'bar', barcode: '8966007001' },
  { name: 'Dettol Soap Original 105g', category: 'Soap & Surf', purchasePrice: 130, salePrice: 150, stock: 30, minStock: 8, unit: 'bar', barcode: '8966007002' },
  { name: 'Express Power Washing Powder 1kg', category: 'Soap & Surf', purchasePrice: 280, salePrice: 310, stock: 22, minStock: 6, unit: 'pack', barcode: '8966007003' },
  { name: 'Harpic Toilet Cleaner 500ml', category: 'Soap & Surf', purchasePrice: 290, salePrice: 330, stock: 15, minStock: 4, unit: 'bottle', barcode: '8966007004' },
  { name: 'National Tomato Ketchup 500g', category: 'Miscellaneous', purchasePrice: 240, salePrice: 280, stock: 18, minStock: 5, unit: 'pouch', barcode: '8966008001' },
];

export default function StockManager() {
  const {
    products,
    categories,
    addCategory,
    addProduct,
    addMultipleProducts,
    updateProduct,
    deleteProduct,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  // Single Add / Edit Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // New Category inline creation state inside Single Add
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'Daalein & Chawal',
    barcode: '',
    purchasePrice: '',
    salePrice: '',
    stock: '',
    minStock: 5,
    unit: 'kg',
  });

  // Bulk Add Modal state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    { name: '', category: 'Daalein & Chawal', purchasePrice: '', salePrice: '', stock: '', unit: 'kg' },
    { name: '', category: 'Oil & Ghee', purchasePrice: '', salePrice: '', stock: '', unit: 'pouch' },
    { name: '', category: 'Masalay', purchasePrice: '', salePrice: '', stock: '', unit: 'pack' },
  ]);
  const [bulkText, setBulkText] = useState('');
  const [bulkMode, setBulkMode] = useState('grid'); // 'grid' | 'text' | 'preset'
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  const filtered = products.filter((p) => {
    const matchesCat = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Single Add handler
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setShowNewCatInput(false);
    setNewCatName('');
    setForm({
      name: '',
      category: categories.find((c) => c !== 'All') || 'Daalein & Chawal',
      barcode: '',
      purchasePrice: '',
      salePrice: '',
      stock: '',
      minStock: 5,
      unit: 'kg',
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setShowNewCatInput(false);
    setNewCatName('');
    setForm({
      name: p.name,
      category: p.category,
      barcode: p.barcode || '',
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      stock: p.stock,
      minStock: p.minStock || 5,
      unit: p.unit || 'unit',
    });
    setShowAddModal(true);
  };

  // Inline Category Save
  const handleSaveInlineCategory = () => {
    if (!newCatName.trim()) return;
    const added = addCategory(newCatName.trim());
    if (added) {
      setForm((prev) => ({ ...prev, category: added }));
      setNewCatName('');
      setShowNewCatInput(false);
    }
  };

  const handleSaveSingleProduct = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.salePrice) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, form);
    } else {
      addProduct(form);
    }
    setShowAddModal(false);
  };

  // Bulk Operations
  const handleAddBulkRow = () => {
    setBulkRows((prev) => [
      ...prev,
      { name: '', category: 'Daalein & Chawal', purchasePrice: '', salePrice: '', stock: '', unit: 'kg' },
    ]);
  };

  const handleUpdateBulkRow = (index, field, value) => {
    setBulkRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveBulkRow = (index) => {
    setBulkRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Bulk from Grid
  const handleSaveBulkGrid = () => {
    const valid = bulkRows.filter((r) => r.name.trim() && Number(r.salePrice) > 0);
    if (valid.length === 0) {
      alert('Kam az kam aik product ka Naam aur Sale Price likhein!');
      return;
    }
    const count = addMultipleProducts(valid);
    setBulkSuccessMsg(`Zabardast! ${count} naye products stock me save ho gaye!`);
    setTimeout(() => {
      setBulkSuccessMsg('');
      setShowBulkModal(false);
      setBulkRows([
        { name: '', category: 'Daalein & Chawal', purchasePrice: '', salePrice: '', stock: '', unit: 'kg' },
        { name: '', category: 'Oil & Ghee', purchasePrice: '', salePrice: '', stock: '', unit: 'pouch' },
        { name: '', category: 'Masalay', purchasePrice: '', salePrice: '', stock: '', unit: 'pack' },
      ]);
    }, 1200);
  };

  // Save Bulk from Text / CSV
  const handleSaveBulkText = () => {
    const lines = bulkText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const parsedList = [];
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const name = parts[0];
        const salePrice = Number(parts[1]) || 0;
        const purchasePrice = Number(parts[2]) || Math.round(salePrice * 0.9);
        const stock = Number(parts[3]) || 10;
        const unit = parts[4] || 'unit';
        const category = parts[5] || 'Miscellaneous';
        if (name && salePrice > 0) {
          parsedList.push({ name, salePrice, purchasePrice, stock, unit, category });
        }
      }
    }

    if (parsedList.length === 0) {
      alert('Koi valid format nahi mila! Format check karen: Naam, Farokht Rate, Kharid Rate, Stock, Unit');
      return;
    }

    const count = addMultipleProducts(parsedList);
    setBulkSuccessMsg(`Shandar! ${count} items text se import ho gaye!`);
    setTimeout(() => {
      setBulkSuccessMsg('');
      setBulkText('');
      setShowBulkModal(false);
    }, 1200);
  };

  // Import Ready-Made Pakistani Pack
  const handleImportPakistaniPack = () => {
    const existingNames = new Set(products.map((p) => p.name.toLowerCase().trim()));
    const toAdd = PAKISTANI_POPULAR_PACK.filter(
      (item) => !existingNames.has(item.name.toLowerCase().trim())
    );

    if (toAdd.length === 0) {
      alert('Pakistani pack ke tamam items pehle se hi stock me mojood hain!');
      return;
    }

    const count = addMultipleProducts(toAdd);
    setBulkSuccessMsg(`Mubarak! Pakistan ke mashhoor ${count} karyana items stock me add ho gaye!`);
    setTimeout(() => {
      setBulkSuccessMsg('');
      setShowBulkModal(false);
    }, 1400);
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="font-['Outfit'] font-black text-xl text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Stock &amp; Items Directory</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kul <span className="font-bold text-slate-800">{products.length}</span> items registered hain dukan me.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Bulk Add Button */}
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Aik sath ziada items add karne ka fast tareeqa"
          >
            <Layers className="w-4 h-4 text-indigo-200" />
            <span>⚡ Ziada Samaan Ek Sath (Bulk Add)</span>
          </button>

          {/* Single Add Button */}
          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Naya Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Item Name, Barcode, or Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          <button
            onClick={() => setSelectedCategoryFilter('All')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              selectedCategoryFilter === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({products.length})
          </button>
          {categories.filter((c) => c !== 'All').map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Kharid Rate</th>
                <th className="p-3">Farokht Rate</th>
                <th className="p-3">Munafa (Margin)</th>
                <th className="p-3">Stock Mojood</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((p) => {
                const isLow = Number(p.stock) <= Number(p.minStock);
                const isOut = Number(p.stock) <= 0;
                const profitPerUnit = Number(p.salePrice) - Number(p.purchasePrice || 0);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-800">
                      <div>{p.name}</div>
                      {p.barcode && (
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Barcode className="w-3 h-3" />
                          <span>{p.barcode}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-500">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-mono">Rs. {p.purchasePrice || 0}</td>
                    <td className="p-3 font-bold font-mono text-slate-900">Rs. {p.salePrice}</td>
                    <td className="p-3 text-emerald-600 font-bold font-mono">
                      +Rs. {profitPerUnit}
                    </td>
                    <td className="p-3 font-bold font-mono text-sm">
                      {p.stock} <span className="text-[11px] font-normal text-slate-400">{p.unit}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          isOut
                            ? 'bg-red-100 text-red-700'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOut ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Khatam (Out)</span>
                          </>
                        ) : isLow ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>Kam Stock ({p.stock})</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Normal</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Kya aap "${p.name}" ko delete karna chahte hain?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-['Outfit'] font-black text-lg text-slate-900">
                {editingProduct ? 'Item Edit Karein' : 'Naya Item Add Karein'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Item Ka Naam *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dalda Cooking Oil 1L Pouch"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl outline-none focus:border-emerald-500 font-semibold text-slate-900"
                />
              </div>

              {/* Category Selection with Custom Category Adder */}
              <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Category Chunein</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>{showNewCatInput ? 'Band Karein' : '+ Nayi Category Banayein'}</span>
                  </button>
                </div>

                {!showNewCatInput ? (
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl outline-none font-medium"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Nayi category ka naam (e.g. Nimko & Confectionery)..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-emerald-400 rounded-lg outline-none text-xs font-semibold"
                      />
                      <button
                        type="button"
                        onClick={handleSaveInlineCategory}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Nayi category ban kar foran is item par apply ho jayegi aur list me save ho jayegi.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unit (Pouch, kg, pack, bottle)</label>
                  <input
                    type="text"
                    placeholder="kg / pack"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Barcode (Scanner se scan karein)</label>
                  <input
                    type="text"
                    placeholder="Barcode Number"
                    value={form.barcode}
                    onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kharid Rate (Cost Price)</label>
                  <input
                    type="number"
                    placeholder="Rs."
                    value={form.purchasePrice}
                    onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Farokht Rate (Sale Price) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Rs."
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-emerald-300 rounded-xl outline-none font-mono font-bold text-emerald-800 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mojooda Stock (Taadad)</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Low Stock Warning Alert</label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Changes Save Karein' : 'Item Save Karein'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ADD MODAL (Ziada Samaan Ek Sath Add Karna) */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h3 className="font-['Outfit'] font-black text-xl text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <span>Ziada Samaan Aik Sath Add Karein (Bulk Entry)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Multiple items ko tezi se system me shamil karne ke 3 aasan tareeqe.
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Success Message Banner */}
            {bulkSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-bold text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setBulkMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  bulkMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>1. Multi-Row Table (Excel Style)</span>
              </button>
              <button
                onClick={() => setBulkMode('preset')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  bulkMode === 'preset'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>2. Ready-Made Pakistani Pack (25 Items)</span>
              </button>
              <button
                onClick={() => setBulkMode('text')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  bulkMode === 'text'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>3. Copy-Paste Text / CSV</span>
              </button>
            </div>

            {/* TAB 1: GRID MODE */}
            {bulkMode === 'grid' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Item Name *</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5">Kharid Rate</th>
                        <th className="p-2.5">Farokht Rate *</th>
                        <th className="p-2.5">Stock</th>
                        <th className="p-2.5">Unit</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bulkRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="e.g. Tapal Tea 430g"
                              value={row.name}
                              onChange={(e) => handleUpdateBulkRow(idx, 'name', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:border-indigo-500 outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={row.category}
                              onChange={(e) => handleUpdateBulkRow(idx, 'category', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none bg-white"
                            >
                              {categories.filter((c) => c !== 'All').map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="Rs."
                              value={row.purchasePrice}
                              onChange={(e) => handleUpdateBulkRow(idx, 'purchasePrice', e.target.value)}
                              className="w-20 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-mono outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="Rs."
                              value={row.salePrice}
                              onChange={(e) => handleUpdateBulkRow(idx, 'salePrice', e.target.value)}
                              className="w-20 px-2 py-1.5 border border-indigo-200 rounded-lg text-xs font-mono font-bold text-indigo-700 outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              placeholder="10"
                              value={row.stock}
                              onChange={(e) => handleUpdateBulkRow(idx, 'stock', e.target.value)}
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              placeholder="kg/pack"
                              value={row.unit}
                              onChange={(e) => handleUpdateBulkRow(idx, 'unit', e.target.value)}
                              className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {bulkRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveBulkRow(idx)}
                                className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddBulkRow}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>+ Mazeed Row Shamil Karein</span>
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Khali rows save nahi hongi, sirf bhare hue items save honge.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: PRESET PACK */}
            {bulkMode === 'preset' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h4 className="font-bold text-amber-900 text-sm">
                      Ready-Made Pakistani Karyana Starter Pack (25 Super Items)
                    </h4>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Hamne Pakistan ke aam karyana store ke 25 mashhoor branded items (Mezan, Habib, Kisan, Chakki Aata, Tarang, Shan Masalas, Harpic, Safeguard, Dettol, Rio, Sooper, Kolson Pasta waghera) rate aur categories ke sath pehle se tayar kiye hain.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleImportPakistaniPack}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Tamam 25 Items 1-Click Me Stock Me Shamil Karein</span>
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-xs text-slate-700">
                    Is Pack Me Shamil Items Ki Jhalak (Preview):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 text-xs max-h-56 overflow-y-auto">
                    {PAKISTANI_POPULAR_PACK.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-[10px] text-slate-400">{item.category} • {item.unit}</div>
                        </div>
                        <div className="text-right font-mono font-bold text-emerald-700">
                          Rs. {item.salePrice}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TEXT / CSV PASTE */}
            {bulkMode === 'text' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800">Format Guide (Commas ke sath likhein ya Excel se paste karen):</p>
                  <p className="font-mono text-[11px] text-indigo-700">
                    Item Name, Sale Price, Purchase Price, Stock, Unit, Category
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Misaal: <code className="bg-white px-1 border rounded">Chini 1kg, 150, 140, 50, kg, Daalein & Chawal</code>
                  </p>
                </div>

                <textarea
                  rows={8}
                  placeholder={`Chini 1kg, 150, 140, 50, kg, Daalein & Chawal
Atta Chakki 10kg, 1350, 1250, 20, bag, Daalein & Chawal
Dalda 1L, 520, 480, 24, pouch, Oil & Ghee`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {bulkMode === 'grid' && `${bulkRows.filter((r) => r.name.trim()).length} items tayar hain`}
                {bulkMode === 'preset' && '25 Branded Items ready'}
                {bulkMode === 'text' && `${bulkText.split('\n').filter((l) => l.trim()).length} lines paste ki gayi hain`}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                {bulkMode === 'grid' && (
                  <button
                    type="button"
                    onClick={handleSaveBulkGrid}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer text-xs"
                  >
                    Tamam Bhare Hue Items Save Karein
                  </button>
                )}
                {bulkMode === 'text' && (
                  <button
                    type="button"
                    onClick={handleSaveBulkText}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md cursor-pointer text-xs"
                  >
                    Text Import &amp; Save Karein
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
