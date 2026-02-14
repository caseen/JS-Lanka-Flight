
import React, { useState } from 'react';
import { Plus, Trash2, Phone, Search, User, Truck, UserCheck, AlertTriangle, Edit, X } from 'lucide-react';
import { Customer, Supplier } from '../types';

interface ManagementProps {
  type: 'Customer' | 'Supplier';
  items: (Customer | Supplier)[];
  onAdd: (item: any) => void;
  onUpdate: (item: any) => void;
  onDelete: (id: string) => void;
}

const Management: React.FC<ManagementProps> = ({ type, items, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
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
    setIsAdding(true);
  };

  const handleStartEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      phone: (item as any).phone || '',
      contact: (item as any).contact || ''
    });
    setIsAdding(true);
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
    setIsAdding(false);
    setEditingItem(null);
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
    <div className="space-y-6 animate-fadeIn relative">
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="p-8 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800">Delete {type}</h3>
                <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete this {type.toLowerCase()}? This will permanently remove the record.</p>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <button 
                  onClick={handleConfirmDelete}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 transition-all active:scale-95"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, itemId: null })}
                  className="w-full py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder={`Search ${type}s...`}
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {!isAdding && (
          <button 
            onClick={handleStartAdd}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-200 font-bold"
          >
            <Plus size={20} /> Add New {type}
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border shadow-md animate-slideDown">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">{editingItem ? `Edit ${type}` : `Add New ${type}`}</h3>
            <button type="button" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name / Company Name</label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {type === 'Customer' ? 'Phone Number' : 'Contact Person / Phone'}
              </label>
              <input
                type="text"
                required
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                value={type === 'Customer' ? formData.phone : formData.contact}
                onChange={e => setFormData({ ...formData, [type === 'Customer' ? 'phone' : 'contact']: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setIsAdding(false); setEditingItem(null); }} className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 rounded-lg font-bold transition-colors">
              {editingItem ? 'Update' : 'Save'} {type}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {type === 'Customer' ? <User size={24} /> : <Truck size={24} />}
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleStartEdit(item)}
                  className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title={`Edit ${type}`}
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => initiateDelete(item.id)}
                  className="p-2 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm"
                  title={`Delete ${type}`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h4 className="text-lg font-bold text-slate-800 mb-3">{item.name}</h4>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <span className="font-medium">{(item as any).phone || (item as any).contact}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-1">
                <UserCheck size={12} className="text-emerald-500" />
                <span>Verified</span>
              </div>
              <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded">Active</span>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && !isAdding && (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed flex flex-col items-center justify-center text-slate-400">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              {type === 'Customer' ? <User size={40} className="text-slate-200" /> : <Truck size={40} className="text-slate-200" />}
            </div>
            <p className="font-medium">No {type.toLowerCase()}s recorded yet.</p>
            <p className="text-sm">Add your first {type.toLowerCase()} to manage your bookings.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Management;
