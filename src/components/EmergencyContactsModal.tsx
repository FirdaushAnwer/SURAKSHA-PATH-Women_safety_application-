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
  AlertCircle,
  Share2,
  PhoneCall
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
  userCoords?: [number, number] | null;
}

export const EmergencyContactsModal: React.FC<EmergencyContactsModalProps> = ({
  isOpen,
  onClose,
  theme,
  tripCode,
  userCoords = [28.6945, 77.2060],
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

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('surakshapath_contacts', JSON.stringify(contacts));
    } catch (_) {}
  }, [contacts]);

  if (!isOpen) return null;

  const lat = userCoords ? userCoords[0].toFixed(5) : '28.6945';
  const lng = userCoords ? userCoords[1].toFixed(5) : '77.2060';
  const distressMessage = `🚨 SURAKSHA-PATH EMERGENCY ALERT: I am traveling alone and sharing my live route. Please check on me! Live map: https://surakshapath.org/live/${tripCode} | Current GPS: https://maps.google.com/?q=${lat},${lng}`;

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
      <div className={`w-full max-w-sm rounded-3xl ${theme.bgCard} border ${theme.borderHighlight} p-5 shadow-2xl text-white space-y-4 max-h-[88vh] flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center">
              <Users size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Emergency Guardians & Sisterhood</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded-full border border-rose-500/30 font-mono">
                  {contacts.length}
                </span>
              </h2>
              <p className={`text-[10px] ${theme.textMuted}`}>
                Auto-alerted when you trigger SOS or walk timer expires
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Quick Emergency Hotlines */}
        <div className="bg-slate-950/70 p-2 rounded-2xl border border-slate-800/80 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-rose-300 tracking-wider flex items-center gap-1">
            <PhoneCall size={11} /> 24/7 National Emergency Hotlines
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <a
              href="tel:112"
              className="py-1.5 px-2 bg-red-600/90 hover:bg-red-500 rounded-xl text-center text-[10px] font-bold text-white shadow-sm flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="font-mono text-xs">112</span>
              <span className="text-[9px] opacity-80">All-in-One</span>
            </a>
            <a
              href="tel:1091"
              className="py-1.5 px-2 bg-purple-700/90 hover:bg-purple-600 rounded-xl text-center text-[10px] font-bold text-white shadow-sm flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="font-mono text-xs">1091</span>
              <span className="text-[9px] opacity-80">Women Helpline</span>
            </a>
            <a
              href="tel:181"
              className="py-1.5 px-2 bg-rose-700/90 hover:bg-rose-600 rounded-xl text-center text-[10px] font-bold text-white shadow-sm flex flex-col items-center justify-center cursor-pointer"
            >
              <span className="font-mono text-xs">181</span>
              <span className="text-[9px] opacity-80">Distress Desk</span>
            </a>
          </div>
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
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Phone size={11} className="text-emerald-400" />
                  <span>Call</span>
                </a>

                {/* Direct WhatsApp SOS share */}
                <a
                  href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(distressMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-700 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <Share2 size={11} className="text-emerald-400" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href={`sms:${contact.phone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(distressMessage)}`}
                  className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                >
                  <MessageSquare size={11} className="text-sky-400" />
                  <span>SMS</span>
                </a>
              </div>
            </div>
          ))}

          {/* Add New Contact Form */}
          {isAdding ? (
            <form onSubmit={handleAddContact} className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2 text-xs animate-fade-in">
              <div className="font-bold text-white text-xs">Add New Guardian</div>
              <input
                type="text"
                placeholder="Full Name (e.g. Diya)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newRelation}
                  onChange={(e) => setNewRelation(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="Sister">Sister</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Brother">Brother</option>
                  <option value="Friend">Friend</option>
                  <option value="Partner">Partner</option>
                  <option value="Roommate">Roommate</option>
                  <option value="Colleague">Colleague</option>
                </select>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-1.5 rounded-xl ${theme.accentBg} text-white font-bold text-xs cursor-pointer shadow`}
                >
                  Save Guardian
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className={`w-full py-2.5 rounded-2xl border ${theme.borderHighlight} hover:bg-rose-500/10 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer`}
            >
              <UserPlus size={14} />
              <span>Add Another Guardian</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
