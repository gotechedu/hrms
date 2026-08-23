import { createSlice } from '@reduxjs/toolkit';

const initialProfile = {
  personalInfo: {
    fullName: 'Vikramaditya Sharma',
    dob: '1992-08-14',
    gender: 'Male',
    bloodGroup: 'O+ Positive',
    maritalStatus: 'Married',
    nationality: 'Indian',
    currentAddress: 'Apartment 402, DLF CyberCity Phase 2, Gurugram, Haryana - 122002',
    permanentAddress: 'House 88, Gomti Nagar Extension, Lucknow, Uttar Pradesh - 226010',
    primaryPhone: '+91 98765 43210',
    workEmail: 'vikram.sharma@gotechedu.com',
    personalEmail: 'vikram.sharma.personal@gmail.com',
  },
  employment: {
    employeeId: 'GTE-2024-889',
    designation: 'Principal HR & People Ops Lead',
    department: 'People Operations & HR',
    joiningDate: '15 Jan 2022',
    employmentType: 'Permanent / Full-Time',
    workLocation: 'Gurugram Corporate HQ',
    reportingManager: 'Aditya Rai (Chief Executive Officer)',
    probationStatus: 'Confirmed',
  },
  bankAndPayroll: {
    bankName: 'HDFC Bank Ltd',
    accountNumber: '•••• •••• •••• 9842',
    ifscCode: 'HDFC0001234',
    panNumber: 'ABCPS1234F',
    aadhaarNumber: '•••• •••• 8891',
    pfUanNumber: '101294827163',
  },
  emergencyContacts: [
    { name: 'Dr. Sunita Sharma', relation: 'Spouse', phone: '+91 98111 44556', location: 'Gurugram' },
    { name: 'Rajesh Sharma', relation: 'Brother', phone: '+91 98222 77889', location: 'Lucknow' },
  ],
  documents: [
    { name: 'Appointment_Letter_GoTechEdu.pdf', type: 'Employment Contract', size: '2.4 MB', uploadDate: '15 Jan 2022' },
    { name: 'PAN_Card_Verified.pdf', type: 'Identity Verification', size: '850 KB', uploadDate: '15 Jan 2022' },
    { name: 'Form16_FY2023_2024.pdf', type: 'Tax Certificate', size: '1.2 MB', uploadDate: '30 Jun 2024' },
    { name: 'Master_Degree_Certificate.pdf', type: 'Academic Document', size: '3.1 MB', uploadDate: '15 Jan 2022' },
  ],
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfile,
  reducers: {
    updatePersonalInfo: (state, action) => {
      state.personalInfo = { ...state.personalInfo, ...action.payload };
    },
    updateBankInfo: (state, action) => {
      state.bankAndPayroll = { ...state.bankAndPayroll, ...action.payload };
    },
    addEmergencyContact: (state, action) => {
      state.emergencyContacts.push(action.payload);
    },
    removeEmergencyContact: (state, action) => {
      state.emergencyContacts.splice(action.payload, 1);
    },
  },
});

export const { updatePersonalInfo, updateBankInfo, addEmergencyContact, removeEmergencyContact } = profileSlice.actions;
export default profileSlice.reducer;
