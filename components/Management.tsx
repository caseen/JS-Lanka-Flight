import React, { useState } from 'react';
import { Plus, Trash2, Phone, Search, User, Truck, UserCheck, AlertTriangle, Edit, X, UserPlus, Save } from 'lucide-react';
import { Customer, Supplier } from '../types';

interface ManagementProps {
  type: 'Customer' | 'Supplier';
  items: (Customer | Supplier)[];
  onAdd: (item: any) => void;
  onUpdate: (item: any) => void;
  onDelete: (id: string) => void;
}

const Management: React.FC<ManagementProps> = ({ type, items, onAdd, onUpdate, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: ''
  });

  // Deletion State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartAdd = () => {
    setEditingItem(null);
    setFormData({ name: '', contact: '', phone: '' });
    setShowModal(true);
  };

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      phone: (item as any).phone || '',
      contact: (item as any).contact || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      const updatedItem = {
        ...editingItem,
        name: formData.name,
        ...(type === 'Customer' ? { phone: formData.phone } : { contact: formData.contact })
      };
      onUpdate(updatedItem);
    } else {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        ...(type === 'Customer' ? { phone: formData.phone } : { contact: formData.contact })
      };
      onAdd(newItem);
    }
    setFormData({ name: '', contact: '', phone: '' });
    handleCloseModal();
  };

  const initiateDelete = (id: string) => {
    setDeleteModal({ isOpen: true, itemId: id });
  };

  const handleConfirmDelete = () => {
    if (deleteModal.itemId) {
      onDelete(deleteModal.itemId);
      setDeleteModal({ isOpen: false, itemId: null });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn relative pb-20">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Delete {type}</h3>
                <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete this {type.toLowerCase()}? This will permanently remove the record from the database.</p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button 
                  onClick={handleConfirmDelete}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 transition-all active:scale-95 text-xs tracking-widest uppercase"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, itemId: null })}
                  className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all text-xs tracking-widest uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Popup Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="bg-slate-50 p-6 lg:p-8 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                    {editingItem ? <Edit size={20} /> : <UserPlus size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                      {editingItem ? `Edit ${type}` : `Add New ${type}`}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Information Profile</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {type === 'Customer' ? 'Full Name / Agent' : 'Company / Supplier Name'}
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter name..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    {type === 'Customer' ? 'Phone Number' : 'Contact Person / Phone'}
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="+94 77 ..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 pl-10 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                      value={type === 'Customer' ? formData.phone : formData.contact}
                      onChange={e => setFormData({ ...formData, [type === 'Customer' ? 'phone' : 'contact']: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  type="submit" 
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs tracking-widest uppercase"
                >
                  <Save size={18} />
                  {editingItem ? 'Update profile' : `Save ${type.toLowerCase()}`}
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all text-xs tracking-widest uppercase"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder={`Search ${type} list...`}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleStartAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-100 font-bold text-xs uppercase tracking-widest"
        >
          <Plus size={18} /> Add New {type}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group overflow-hidden">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {type === 'Customer' ? <User className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} /> : <Truck className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />}
              </div>
              <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                  title={`Edit ${type}`}
                >
                  <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button 
                  onClick={() => initiateDelete(item.id)}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title={`Delete ${type}`}
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
            
            <h4 className="text-sm sm:text-base font-black text-slate-800 mb-2 sm:mb-3 uppercase tracking-tight truncate">{item.name}</h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                  <Phone size={12} className="text-slate-400 sm:w-[14px] sm:h-[14px]" />
                </div>
                <span className="font-bold truncate">{(item as any).phone || (item as any).contact}</span>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-50 flex justify-between items-center text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                <UserCheck size={10} className="text-emerald-500 sm:w-3 sm:h-3" />
                <span className="hidden xs:inline">Verified</span>
              </div>
              <span className="text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">Active</span>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 shadow-sm">
            <div className="bg-slate-50 p-5 rounded-full mb-4">
              {type === 'Customer' ? <User size={48} className="text-slate-200" /> : <Truck size={48} className="text-slate-200" />}
            </div>
            <p className="font-black text-sm uppercase tracking-widest text-slate-500">No {type.toLowerCase()} records found</p>
            <p className="text-[10px] uppercase font-bold text-slate-300 mt-1">Start by adding a new {type.toLowerCase()} to the system</p>
            <button 
              onClick={handleStartAdd}
              className="mt-6 px-8 py-2 border-2 border-slate-100 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
              Add {type}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;