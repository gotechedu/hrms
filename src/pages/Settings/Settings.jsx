import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Shield,
  Users,
  Bell,
  Building2,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  DollarSign,
  Key,
  Globe,
  Mail,
  Smartphone,
  CheckSquare,
  ShieldAlert,
} from 'lucide-react';
import { settingsApi } from '../../Service';
import notify from '../../utils/toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'payroll' | 'notifications' | 'security'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    companyName: 'GoTechEdu Enterprises Pvt Ltd',
    companyEmail: 'admin@gotechedu.com',
    companyPhone: '+91 98765 43210',
    companyAddress: 'Cyber City Tech Tower, DLF Phase 2, Gurugram, Haryana - 122002',
    currency: 'INR (₹)',
    taxSettings: {
      defaultTdsRate: 10,
      pfEmployeeRate: 12,
      pfEmployerRate: 12,
      standardHraPercent: 40,
    },
    notifications: {
      emailOnApplication: true,
      emailOnSalaryDisbursal: true,
      slackWebhookUrl: '',
    },
    security: {
      twoFactorRequired: false,
      sessionTimeoutMinutes: 120,
      passwordMinLength: 8,
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsApi.getSettings();
      if (res && res.settings) {
        setSettings(res.settings);
      }
    } catch (err) {
      console.error('Fetch Settings Error:', err);
      notify.error(err.response?.data?.message || err.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await settingsApi.updateSettings(settings);
      notify.success(res.data?.message || res.message || 'System settings saved successfully!');
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/20">
              <SettingsIcon size={18} />
            </div>
            System Settings & Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global configurations, company profile, payroll compliance rules, and system policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/settings/roles"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Users size={15} /> Manage Roles
          </Link>
          <Link
            to="/settings/permissions"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
          >
            <Shield size={15} /> Permission Matrix
          </Link>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1.5">
          {[
            { id: 'general', label: 'Company Profile', icon: Building2 },
            { id: 'payroll', label: 'Payroll & Tax Rules', icon: DollarSign },
            { id: 'notifications', label: 'Notification Alerts', icon: Bell },
            { id: 'security', label: 'Security & Auth', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-extrabold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={16} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Form */}
        <div className="md:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="mx-auto mb-2 animate-spin text-blue-600" size={24} />
              Loading configurations...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6 text-xs">
              {/* Tab 1: General Profile */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Organization & Enterprise Branding
                    </h3>
                    <p className="text-xs text-slate-500">
                      Information displayed across payslips, letters, and system notices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company Legal Name</label>
                      <input
                        type="text"
                        value={settings.companyName || ''}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Official Contact Email</label>
                      <input
                        type="email"
                        value={settings.companyEmail || ''}
                        onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Official Phone Number</label>
                      <input
                        type="text"
                        value={settings.companyPhone || ''}
                        onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Default Base Currency</label>
                      <input
                        type="text"
                        value={settings.currency || 'INR (₹)'}
                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Registered HQ Address</label>
                    <textarea
                      rows={3}
                      value={settings.companyAddress || ''}
                      onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 p-3 font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Payroll & Tax */}
              {activeTab === 'payroll' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Payroll Defaults & Statutory Compliance
                    </h3>
                    <p className="text-xs text-slate-500">
                      Default percentage slabs applied during automated salary calculations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                      <label className="block font-bold text-slate-700 mb-1">
                        Standard HRA Percentage (% of Basic)
                      </label>
                      <input
                        type="number"
                        value={settings.taxSettings?.standardHraPercent || 40}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxSettings: { ...settings.taxSettings, standardHraPercent: Number(e.target.value) },
                          })
                        }
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Default 40% for Non-Metro, 50% for Metro</span>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                      <label className="block font-bold text-slate-700 mb-1">
                        IT TDS Rate for Contractors 194J (%)
                      </label>
                      <input
                        type="number"
                        value={settings.taxSettings?.defaultTdsRate || 10}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxSettings: { ...settings.taxSettings, defaultTdsRate: Number(e.target.value) },
                          })
                        }
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Standard Section 194J Professional Services tax</span>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                      <label className="block font-bold text-slate-700 mb-1">
                        Provident Fund (EPF Employee) %
                      </label>
                      <input
                        type="number"
                        value={settings.taxSettings?.pfEmployeeRate || 12}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxSettings: { ...settings.taxSettings, pfEmployeeRate: Number(e.target.value) },
                          })
                        }
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Standard 12% statutory employee contribution</span>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                      <label className="block font-bold text-slate-700 mb-1">
                        Provident Fund (EPF Employer) %
                      </label>
                      <input
                        type="number"
                        value={settings.taxSettings?.pfEmployerRate || 12}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            taxSettings: { ...settings.taxSettings, pfEmployerRate: Number(e.target.value) },
                          })
                        }
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono bg-white"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">Company matching EPF contribution</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Notification Dispatch Channels
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configure automated alerts sent to HR and recipients.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications?.emailOnApplication || false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, emailOnApplication: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Candidate Application Alerts</span>
                        <span className="text-slate-500 text-[11px]">Send HR instant email when job or course candidates apply</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications?.emailOnSalaryDisbursal || false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, emailOnSalaryDisbursal: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Salary & Payslip Disbursement Notification</span>
                        <span className="text-slate-500 text-[11px]">Email digital payslip PDF when payment status changes to Paid</span>
                      </div>
                    </label>

                    <div className="pt-2">
                      <label className="block font-bold text-slate-700 mb-1">Slack / Discord Webhook URL</label>
                      <input
                        type="text"
                        placeholder="https://hooks.slack.com/services/..."
                        value={settings.notifications?.slackWebhookUrl || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, slackWebhookUrl: e.target.value },
                          })
                        }
                        className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Security */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Security & Authentication Controls
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enterprise login policies and session lifecycles.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security?.twoFactorRequired || false}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            security: { ...settings.security, twoFactorRequired: e.target.checked },
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">Enforce Two-Factor Authentication (2FA)</span>
                        <span className="text-slate-500 text-[11px]">Require OTP verification for Superadmin & Admin logins</span>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          JWT Session Timeout (Minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.security?.sessionTimeoutMinutes || 120}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              security: { ...settings.security, sessionTimeoutMinutes: Number(e.target.value) },
                            })
                          }
                          className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Minimum Password Length
                        </label>
                        <input
                          type="number"
                          value={settings.security?.passwordMinLength || 8}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              security: { ...settings.security, passwordMinLength: Number(e.target.value) },
                            })
                          }
                          className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Action */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
                >
                  <Save size={15} />
                  {saving ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
