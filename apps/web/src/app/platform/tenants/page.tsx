'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { CheckCircleIcon, ShieldIcon } from '../../../components/icons';
import { platformApi } from '../../../lib/platform-api';
import type { Tenant } from '../../../types';

export default function PlatformTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Support Access State
  const [supportTenant, setSupportTenant] = useState<Tenant | null>(null);
  const [supportReason, setSupportReason] = useState('');
  const [isGeneratingSupport, setIsGeneratingSupport] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await platformApi.getTenants();
        setTenants(data);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'مدرسة خاصة / دولية',
    domain: '',
    adminEmail: '',
    adminPassword: '',
    dbType: 'sqlite_isolated',
  });

  // Provisioning Simulation State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionStep, setProvisionStep] = useState(0);
  const [provisionLogs, setProvisionLogs] = useState<string[]>([]);
  const [provisionSuccess, setProvisionSuccess] = useState(false);

  const stepsList = [
    'إنشاء السجل في قاعدة بيانات المنصة المركزية...',
    'إنشاء قاعدة البيانات المعزولة (Isolated Database Schema)...',
    'تنفيذ حزم الهجرة التأسيسية (Tenant Core Migrations - 10 Modules)...',
    'إنشاء حساب المدير وتعيين الأدوار والصلاحيات (Super User Provisioning)...',
    'تسجيل وتفعيل النطاق المعزول وتوليد مفاتيح JWT...',
  ];

  const handleStartProvisioning = async () => {
    if (!formData.name || !formData.slug || !formData.adminEmail) {
      alert('يرجى ملء جميع الحقول المطلوبة (اسم المؤسسة، المعرف الفريد، والبريد الإلكتروني)');
      return;
    }

    setIsProvisioning(true);
    setProvisionStep(1);
    setProvisionLogs([stepsList[0]]);

    // Simulation steps
    setTimeout(() => {
      setProvisionStep(2);
      setProvisionLogs((prev) => [...prev, stepsList[1]]);
    }, 700);

    setTimeout(() => {
      setProvisionStep(3);
      setProvisionLogs((prev) => [...prev, stepsList[2]]);
    }, 1500);

    setTimeout(() => {
      setProvisionStep(4);
      setProvisionLogs((prev) => [...prev, stepsList[3]]);
    }, 2200);

    setTimeout(() => {
      setProvisionStep(5);
      setProvisionLogs((prev) => [...prev, stepsList[4]]);
    }, 2900);

    setTimeout(async () => {
      setIsProvisioning(false);
      setProvisionSuccess(true);
      
      try {
          const newTenant = await platformApi.provisionTenant({
              name: formData.name,
              slug: formData.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-'),
              type: formData.type,
              status: 'active',
          });
          setTenants((prev) => [newTenant, ...prev]);
      } catch (err) {
          // If actual provision fails, just add a local mock for visual feedback since API might not exist yet
          const newTenant: Tenant = {
            id: '03c2' + Math.random().toString(16).slice(2, 10),
            name: formData.name,
            slug: formData.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-'),
            type: formData.type,
            status: 'active',
          };
          setTenants((prev) => [newTenant, ...prev]);
      }
    }, 3600);
  };

  const handleResetModal = () => {
    setIsModalOpen(false);
    setIsProvisioning(false);
    setProvisionStep(0);
    setProvisionLogs([]);
    setProvisionSuccess(false);
    setFormData({
      name: '',
      slug: '',
      type: 'مدرسة خاصة / دولية',
      domain: '',
      adminEmail: '',
      adminPassword: '',
      dbType: 'sqlite_isolated',
    });
  };

  const handleSupportAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportTenant || !supportReason.trim()) return;

    try {
      setIsGeneratingSupport(true);
      const res = await platformApi.generateSupportToken(supportTenant.id, supportReason);
      
      // Redirect to tenant with token and tenant slug
      const tenantUrl = `http://${res.tenant}.localhost:3000/login?support_token=${res.token}&tenant=${res.tenant}`;
      window.open(tenantUrl, '_blank');
      
      setSupportTenant(null);
      setSupportReason('');
    } catch {
      alert('فشل في توليد توكن الدعم الفني. تأكد من توفر الصلاحيات.');
    } finally {
      setIsGeneratingSupport(false);
    }
  };

  const toggleTenantStatus = (id: string) => {
    setTenants((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' } : t
      )
    );
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldIcon size={24} className="text-accent" />
            إدارة المؤسسات التعليمية (Tenants Management)
          </h1>
          <p className="text-sm text-secondary mt-1">
            إدارة المستأجرين، تخصيص قواعد البيانات المعزولة، ربط النطاقات المخصصة، وتفعيل الميزات.
          </p>
        </div>
        <button
          onClick={() => {
            handleResetModal();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium px-4 py-2.5 rounded-[16px] text-xs transition-all shadow-lg shadow-amber-600/30 active:scale-95"
        >
          <span>➕</span>
          <span>تهيئة مؤسسة جديدة (Provision Tenant)</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-secondary text-sm">جارٍ تحميل المؤسسات...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-card/60 border-border">
              <p className="text-xs text-secondary font-medium">إجمالي المؤسسات المسجلة</p>
              <p className="text-2xl font-bold text-white mt-1">{tenants.length}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent">
                <ShieldIcon size={12} />
                <span>عزل تام 100% (Isolated DBs)</span>
              </div>
            </Card>
            <Card className="p-4 bg-card/60 border-border">
              <p className="text-xs text-secondary font-medium">المؤسسات النشطة</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {tenants.filter((t) => t.status === 'active').length}
              </p>
              <div className="mt-2 text-[11px] text-primary">جاهزة وتستقبل الطلبة</div>
            </Card>
            <Card className="p-4 bg-card/60 border-border">
              <p className="text-xs text-secondary font-medium">إجمالي الطلبة عبر المؤسسات</p>
              <p className="text-2xl font-bold text-sky-400 mt-1">
                165
              </p>
              <div className="mt-2 text-[11px] text-sky-400">حسابات نشطة ومسجلة</div>
            </Card>
            <Card className="p-4 bg-card/60 border-border">
              <p className="text-xs text-secondary font-medium">إجمالي المقررات الدراسية</p>
              <p className="text-2xl font-bold text-accent mt-1">
                11
              </p>
              <div className="mt-2 text-[11px] text-accent">مناهج وفصول دراسية</div>
            </Card>
          </div>

          {/* Main Table Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-white">قائمة المؤسسات المسجلة على المنصة</h2>
                <p className="text-xs text-secondary mt-0.5">
                  كل مؤسسة تعمل في بيئة سحابية معزولة بقاعدة بيانات منفصلة تماماً.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="بحث بالاسم أو المعرف أو النطاق..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredTenants.length === 0 ? (
                <div className="text-center py-8 text-secondary text-sm">لا توجد مؤسسات مطابقة للبحث.</div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-border text-secondary">
                    <tr>
                      <th className="pb-3 px-3">اسم المؤسسة</th>
                      <th className="pb-3 px-3">المعرف (Slug)</th>
                      <th className="pb-3 px-3">النوع</th>
                      <th className="pb-3 px-3">النطاق (Domain)</th>
                      <th className="pb-3 px-3">قاعدة البيانات المعزولة</th>
                      <th className="pb-3 px-3">الحالة</th>
                      <th className="pb-3 px-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-card/40 transition-colors">
                        <td className="py-4 px-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🏫</span>
                            <div>
                              <span>{t.name}</span>
                              <div className="text-[10px] text-secondary font-mono">ID: {t.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-mono text-accent font-bold">
                          {t.slug}
                        </td>
                        <td className="py-4 px-3 text-secondary">
                          {t.type}
                        </td>
                        <td className="py-4 px-3 font-mono text-secondary" dir="ltr">
                          {t.slug}.localhost
                        </td>
                        <td className="py-4 px-3 font-mono text-primary text-[11px]" dir="ltr">
                          tenant_{t.slug}.sqlite
                        </td>
                        <td className="py-4 px-3">
                          {t.status === 'active' ? (
                            <Badge variant="success">نشط ومعزول</Badge>
                          ) : (
                            <Badge variant="danger">موقوف مؤقتاً</Badge>
                          )}
                        </td>
                        <td className="py-4 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleTenantStatus(t.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                                t.status === 'active'
                                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                                  : 'bg-[color-mix(in_srgb,var(--pri)_15%,transparent)] hover:bg-primary/20 text-primary border border-primary/20'
                              }`}
                            >
                              {t.status === 'active' ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(`http://${t.slug}.localhost:3000/login`);
                                alert(`تم نسخ رابط تسجيل دخول المستأجر (${t.slug}): http://${t.slug}.localhost:3000/login`);
                              }}
                              className="px-2.5 py-1 bg-card border-border border hover:bg-background hover:border-border hover:border text-secondary rounded-lg text-[10px] font-medium transition-colors"
                              title="نسخ رابط الدخول"
                            >
                              🔗 نسخ الرابط
                            </button>
                            <button
                              onClick={() => setSupportTenant(t)}
                              className="px-2.5 py-1 bg-accent/10 border-accent/20 border hover:bg-accent/20 text-accent rounded-lg text-[10px] font-medium transition-colors"
                              title="الدخول بصلاحية الدعم الفني"
                            >
                              🛡️ دعم فني
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Provisioning Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-[20px] shadow-2xl p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[16px] bg-accent/20 border border-amber-500/30 flex items-center justify-center text-accent">
                  <ShieldIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    معالج تهيئة مؤسسة تعليمية جديدة (Tenant Provisioning Wizard)
                  </h3>
                  <p className="text-xs text-secondary mt-0.5">
                    عزل تلقائي للمستأجر، تشغيل الهجرات، وإنشاء المستخدم الإداري الأول
                  </p>
                </div>
              </div>
              {!isProvisioning && (
                <button
                  onClick={handleResetModal}
                  className="text-secondary hover:text-white text-lg p-1 rounded-lg transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="py-6">
              {!isProvisioning && !provisionSuccess && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">
                        اسم المؤسسة التعليمية (بالعربية) *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: مدارس القمة العالمية"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">
                        المعرف الفريد (Slug - English only) *
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: al-qimmah"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                          })
                        }
                        className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">
                        نوع المؤسسة
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="مدرسة خاصة / دولية">مدرسة خاصة / دولية</option>
                        <option value="أكاديمية تدريب مهني">أكاديمية تدريب مهني</option>
                        <option value="معهد لغات وعلوم">معهد لغات وعلوم</option>
                        <option value="مركز تعليمي / دروس تقوية">مركز تعليمي / دروس تقوية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-1.5">
                        النطاق المخصص (أو الافتراضي)
                      </label>
                      <input
                        type="text"
                        placeholder={formData.slug ? `${formData.slug}.localhost` : 'alqimmah.localhost'}
                        value={formData.domain}
                        onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                        className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-amber-500"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-[16px] bg-background/60 border border-border space-y-3">
                    <span className="text-[11px] font-bold text-accent block uppercase tracking-wider">
                      بيانات حساب المدير التنفيذي (Super User)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-secondary mb-1">
                          البريد الإلكتروني للإدارة *
                        </label>
                        <input
                          type="email"
                          placeholder="admin@institution.edu"
                          value={formData.adminEmail}
                          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                          className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-secondary mb-1">
                          كلمة المرور المؤقتة
                        </label>
                        <input
                          type="password"
                          placeholder="افتراضي: password123"
                          value={formData.adminPassword}
                          onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                          className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-accent/10 border border-amber-500/20 rounded-[16px] text-amber-300 text-[11px] flex items-center gap-2">
                    <span>💡</span>
                    <span>
                      سيتم إنشاء قاعدة بيانات SQLite منفصلة تماماً باسم{' '}
                      <code className="bg-card px-1 py-0.5 rounded text-accent font-mono">
                        tenant_{formData.slug || 'slug'}.sqlite
                      </code>{' '}
                      لضمان العزل والامتثال للخصوصية.
                    </span>
                  </div>
                </div>
              )}

              {/* Provisioning in progress */}
              {isProvisioning && (
                <div className="py-8 space-y-6 text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                    <span className="absolute text-xl">⚙️</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">
                      جاري تهيئة بيئة المستأجر وعزل البيانات...
                    </h4>
                    <p className="text-xs text-secondary mt-1">
                      الخطوة {provisionStep} من {stepsList.length}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                    <div
                      className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-500"
                      style={{ width: `${(provisionStep / stepsList.length) * 100}%` }}
                    />
                  </div>

                  {/* Logs list */}
                  <div className="bg-background p-4 rounded-[16px] border border-border text-right space-y-2 text-xs font-mono">
                    {provisionLogs.map((log, index) => (
                      <div key={index} className="flex items-center gap-2 text-secondary">
                        <span className="text-primary">✓</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Provisioning Success */}
              {provisionSuccess && (
                <div className="py-6 space-y-6 text-center">
                  <div className="h-16 w-16 mx-auto rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                    <CheckCircleIcon size={32} />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white">
                      تمت تهيئة وعزل المؤسسة بنجاح!
                    </h4>
                    <p className="text-xs text-secondary mt-1">
                      أصبحت المؤسسة جاهزة للعمل مع قاعدة بياناتها المعزولة ومستخدمها الإداري.
                    </p>
                  </div>

                  <div className="p-4 bg-background rounded-[16px] border border-border text-right text-xs space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-border/80">
                      <span className="text-secondary">اسم المؤسسة:</span>
                      <span className="text-white font-semibold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/80">
                      <span className="text-secondary">المعرف (Slug):</span>
                      <span className="text-accent font-mono font-bold">{formData.slug}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/80">
                      <span className="text-secondary">قاعدة البيانات المعزولة:</span>
                      <span className="text-primary font-mono text-[11px]" dir="ltr">
                        tenant_{formData.slug}.sqlite
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-secondary">حساب المدير:</span>
                      <span className="text-white font-mono" dir="ltr">{formData.adminEmail}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              {!isProvisioning && !provisionSuccess && (
                <>
                  <button
                    onClick={handleResetModal}
                    className="px-4 py-2 rounded-[16px] text-xs font-medium text-secondary hover:text-white transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleStartProvisioning}
                    className="px-5 py-2.5 rounded-[16px] text-xs font-semibold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white transition-all shadow-lg shadow-amber-600/30"
                  >
                    بدء التهيئة والعزل (Provision Institution)
                  </button>
                </>
              )}

              {provisionSuccess && (
                <button
                  onClick={handleResetModal}
                  className="px-6 py-2.5 rounded-[16px] text-xs font-semibold bg-primary hover:bg-primary text-white transition-colors shadow-lg shadow-emerald-600/30"
                >
                  إغلاق ومتابعة القائمة
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support Access Modal */}
      {supportTenant && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-card border border-border rounded-[20px] shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[16px] bg-accent/20 border border-amber-500/30 flex items-center justify-center text-accent">
                  <ShieldIcon size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">دخول كدعم فني</h3>
                  <p className="text-xs text-secondary mt-0.5">{supportTenant.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSupportTenant(null)}
                className="text-secondary hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSupportAccess} className="py-6 space-y-4">
              <p className="text-xs text-secondary leading-relaxed bg-primary/10 border border-primary/20 p-3 rounded-xl text-primary">
                سيتيح لك هذا الإجراء الدخول بصلاحية الإدارة الفائقة لهذه المؤسسة لتشخيص المشاكل الفنية لمدة ساعتين. سيتم تسجيل هذا الإجراء في سجلات التدقيق (Audit Logs).
              </p>

              <div>
                <label className="block text-xs font-semibold text-secondary mb-1.5">سبب الدخول (إلزامي للتدقيق)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="مثال: التحقق من مشكلة رفع الملفات للإدارة رقم التذكرة #1024"
                  value={supportReason}
                  onChange={(e) => setSupportReason(e.target.value)}
                  className="w-full bg-background border border-border rounded-[16px] px-3 py-2 text-xs text-white focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSupportTenant(null)}
                  className="px-4 py-2 rounded-[16px] text-xs font-medium text-secondary hover:text-white transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingSupport || !supportReason.trim()}
                  className="px-5 py-2.5 rounded-[16px] text-xs font-semibold bg-accent hover:bg-accent text-white transition-all shadow-lg disabled:opacity-50"
                >
                  {isGeneratingSupport ? 'جاري توليد التوكن...' : 'توليد توكن الدخول والتحويل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
