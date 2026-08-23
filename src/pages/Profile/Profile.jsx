import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Building2,
  CreditCard,
  PhoneCall,
  FileCheck,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Shield,
  Download,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { updatePersonalInfo, addEmergencyContact, removeEmergencyContact } from '../../redux/slices/profileSlice';
import Modal from '../../Components/Common/Modal';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const profile = useSelector((state) => state.profile);

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: profile.personalInfo.fullName,
    primaryPhone: profile.personalInfo.primaryPhone,
    personalEmail: profile.personalInfo.personalEmail,
    currentAddress: profile.personalInfo.currentAddress,
    maritalStatus: profile.personalInfo.maritalStatus,
    bloodGroup: profile.personalInfo.bloodGroup,
  });

  const [emergencyForm, setEmergencyForm] = useState({
    name: '',
    relation: 'Spouse',
    phone: '',
    location: 'Gurugram',
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    dispatch(updatePersonalInfo(editForm));
    setIsEditModalOpen(false);
  };

  const handleAddEmergency = (e) => {
    e.preventDefault();
    dispatch(addEmergencyContact(emergencyForm));
    setIsEmergencyModalOpen(false);
    setEmergencyForm({
      name: '',
      relation: 'Spouse',
      phone: '',
      location: 'Gurugram',
    });
  };

  const tabs = [
    { id: 'personal', name: 'Personal Information', icon: User },
    { id: 'employment', name: 'Job & Reporting', icon: Building2 },
    { id: 'payroll', name: 'Bank & Statutory Details', icon: CreditCard },
    { id: 'emergency', name: 'Emergency Contacts', icon: PhoneCall },
    { id: 'documents', name: 'Documents & Dossier', icon: FileCheck },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Profile Hero Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="h-20 w-20 rounded-3xl object-cover border-2 border-blue-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] border-2 border-white font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-heading text-2xl font-extrabold text-slate-900">
                  {profile.personalInfo.fullName}
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                  {profile.employment.employeeId}
                </span>
              </div>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                {profile.employment.designation}
              </p>
              <p className="text-xs text-slate-500">
                {profile.employment.department} • {profile.employment.workLocation}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-95"
          >
            <Edit2 size={14} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={15} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        {/* 1. Personal Information Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-heading text-base font-bold text-slate-900">
              Personal & Contact Details
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Date of Birth</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">14 Aug 1992</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Gender</span>
                <span className="font-semibold text-slate-900 mt-1 block">Male</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Blood Group</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.personalInfo.bloodGroup}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Marital Status</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.personalInfo.maritalStatus}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Primary Contact Phone</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.personalInfo.primaryPhone}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Personal Email</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.personalInfo.personalEmail}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold block text-[10px] uppercase mb-1.5">
                Current Residential Address
              </span>
              <div className="rounded-2xl bg-slate-50 p-4 text-xs font-semibold text-slate-900 border border-slate-100">
                {profile.personalInfo.currentAddress}
              </div>
            </div>
          </div>
        )}

        {/* 2. Employment & Org Hierarchy Tab */}
        {activeTab === 'employment' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-heading text-base font-bold text-slate-900">
              Employment Records & Designation
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Employee Code</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.employment.employeeId}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Official Designation</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.employment.designation}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Department</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.employment.department}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Joining Date</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.employment.joiningDate}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Employment Type</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.employment.employmentType}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Direct Reporting Manager</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.employment.reportingManager}</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Bank & Statutory Details Tab */}
        {activeTab === 'payroll' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-heading text-base font-bold text-slate-900">
              Statutory Credentials & Direct Deposit Bank
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Primary Salary Bank</span>
                <span className="font-semibold text-slate-900 mt-1 block">{profile.bankAndPayroll.bankName}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Account Number</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.bankAndPayroll.accountNumber}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Bank IFSC Code</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.bankAndPayroll.ifscCode}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Income Tax PAN</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.bankAndPayroll.panNumber}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">National Aadhaar ID</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.bankAndPayroll.aadhaarNumber}</span>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Provident Fund (UAN)</span>
                <span className="font-semibold text-slate-900 mt-1 block font-mono">{profile.bankAndPayroll.pfUanNumber}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Emergency Contacts Tab */}
        {activeTab === 'emergency' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base font-bold text-slate-900">
                Emergency Contact Directory
              </h2>
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <Plus size={14} /> Add Contact
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {profile.emergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-heading text-sm font-bold text-slate-900">{contact.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold">{contact.relation}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">📞 {contact.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeEmergencyContact(idx))}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Documents & Dossier Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-heading text-base font-bold text-slate-900">
              Verified Compliance Dossier & Contracts
            </h2>

            <div className="space-y-3">
              {profile.documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading text-xs sm:text-sm font-bold text-slate-900">{doc.name}</h3>
                      <p className="text-[11px] text-slate-500">{doc.type} • {doc.size} • Uploaded {doc.uploadDate}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Downloading verified document: ${doc.name}`)}
                    className="flex items-center gap-1 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs transition"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Update Personal Information"
        subtitle="Edit your contact and residential address details"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Primary Phone Number
              </label>
              <input
                type="tel"
                required
                value={editForm.primaryPhone}
                onChange={(e) => setEditForm({ ...editForm, primaryPhone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Personal Email
              </label>
              <input
                type="email"
                required
                value={editForm.personalEmail}
                onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Blood Group
              </label>
              <input
                type="text"
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Residential Address
            </label>
            <textarea
              rows={3}
              value={editForm.currentAddress}
              onChange={(e) => setEditForm({ ...editForm, currentAddress: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Emergency Contact Modal */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Add Emergency Contact"
        subtitle="Provide contact details of immediate next of kin"
      >
        <form onSubmit={handleAddEmergency} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Contact Full Name *
            </label>
            <input
              type="text"
              required
              value={emergencyForm.name}
              onChange={(e) => setEmergencyForm({ ...emergencyForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Relationship *
              </label>
              <select
                value={emergencyForm.relation}
                onChange={(e) => setEmergencyForm({ ...emergencyForm, relation: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Emergency Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00000"
                value={emergencyForm.phone}
                onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Add Contact
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
