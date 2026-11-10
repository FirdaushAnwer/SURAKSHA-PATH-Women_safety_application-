/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Phone,
  MessageSquare,
  Shield,
  Trash2,
  CheckCircle2,
  Star,
  X,
  AlertCircle
} from 'lucide-react';
import { AppTheme } from '../utils/themeConfig';

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

const DEFAULT_CONTACTS: EmergencyContact[] = [
  { id: 'c1', name: 'Maa (Mother)', relation: 'Mother', phone: '+91 98112-90142', isPrimary: true },
  { id: 'c2', name: 'Aarav (Brother)', relation: 'Brother', phone: '+91 99201-44120', isPrimary: false },
  { id: 'c3', name: 'Girls Hostel Warden Desk', relation: 'Campus Warden', phone: '011-27667000', isPrimary: false },
  { id: 'c4', name: 'Delhi Police Pink Booth Desk #4', relation: 'Police Haven', phone: '112', isPrimary: false },
];

interface EmergencyContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  tripCode: string;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  theme,
  tripCode,
}) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    try {
      const saved = localStorage.getItem('surakshapath_contacts');
      return saved ? JSON.parse(saved) : DEFAULT_CONTACTS;
    } catch (_) {
      return DEFAULT_CONTACTS;
    }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState('Sister');
  const [newPhone, setNewPhone] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('surakshapath_contacts', JSON.stringify(contacts));
    } catch (_) {}
  }, [contacts]);

  if (!isOpen) return null;

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `c_${Date.now()}`,
      name: newName.trim(),
      relation: newRelation,
      phone: newPhone.trim(),
      isPrimary: contacts.length === 0,
    };

    setContacts((prev) => [...prev, newContact]);
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSetPrimary = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className={`w-full max-w-sm rounded-3xl ${theme.bgCard} border ${theme.borderHighlight} p-5 shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Emergency Guardians</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full border border-rose-500/30 font-mono">
                  {contacts.length}
                </span>
              </h2>
              <p className={`text-[10px] ${theme.textMuted}`}>
                Auto-alerted when you trigger SOS or timer expires
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-3 rounded-2xl ${
                contact.isPrimary ? 'bg-rose-500/10 border-rose-500/40 ring-1 ring-rose-500/30' : 'bg-black/25 border-slate-800'
              } border transition space-y-2 text-xs`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full ${contact.isPrimary ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300'} flex items-center justify-center font-bold text-xs`}>
                    {contact.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{contact.name}</span>
                      {contact.isPrimary && (
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] ${theme.textMuted} font-mono`}>
                      {contact.relation} · {contact.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!contact.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(contact.id)}
                      className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                      title="Set as Primary Guardian"
                    >
                      <Star size={13} />
                    </button>
                  )}
                  {contacts.length > 1 && (
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                      title="Remove Contact"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Phone size={11} className="text-emerald-400" />
                  <span>Call</span>
                </a>

                <a
                  href={`sms:${contact.phone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(
                    `Hi, I'm sharing my SurakshaPath live safe-trip track with you: https://surakshapath.org/live/${tripCode}`
                  )}`}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <MessageSquare size={11} className="text-sky-400" />
                  <span>Send Link</span>
                </a>
              </div>
            </div>
          ))}

          {/* Add New Contact Form */}
          {isAdding ? (
            <form onSubmit={handleAddContact} className="p-3 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-2.5 text-xs animate-fade-in">
              <div className="font-bold text-rose-300 text-xs">Add New Trusted Guardian</div>
              <input
                type="text"
                placeholder="Contact Name (e.g., Dipti Di)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="Sister">Sister</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Friend">Bestie / Friend</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Security">Security / Police</option>
                </select>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className={`flex-1 py-1.5 rounded-xl ${theme.accentBg} text-white font-bold text-xs cursor-pointer`}
                >
                  Save Guardian
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 rounded-2xl border border-dashed border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Add Another Trusted Guardian</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
