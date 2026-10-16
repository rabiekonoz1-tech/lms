'use client';

import React, { useState } from 'react';
import {
  BookOpenIcon,
  GraduationCapIcon,
  VideoIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  AwardIcon,
  ShieldIcon,
  UsersIcon,
  BarChartIcon,
  BellIcon,
  FireIcon,
  StarIcon,
  CheckIcon,
  BuildingIcon,
  WalletIcon,
  TaskIcon,
  MessageIcon,
  SettingsIcon,
  EditIcon,
  TrashIcon,
  PinIcon,
  PlayIcon,
} from '../../components/icons';

export default function ComponentLibraryPage() {
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2400);
  };

  const iconsList = [
    { name: 'book', icon: <BookOpenIcon size={24} /> },
    { name: 'grad', icon: <GraduationCapIcon size={24} /> },
    { name: 'video', icon: <VideoIcon size={24} /> },
    { name: 'calendar', icon: <CalendarIcon size={24} /> },
    { name: 'check-circle', icon: <CheckCircleIcon size={24} /> },
    { name: 'clock', icon: <ClockIcon size={24} /> },
    { name: 'award', icon: <AwardIcon size={24} /> },
    { name: 'shield', icon: <ShieldIcon size={24} /> },
    { name: 'users', icon: <UsersIcon size={24} /> },
    { name: 'chart', icon: <BarChartIcon size={24} /> },
    { name: 'bell', icon: <BellIcon size={24} /> },
    { name: 'fire', icon: <FireIcon size={24} /> },
    { name: 'star', icon: <StarIcon size={24} /> },
    { name: 'check', icon: <CheckIcon size={24} /> },
    { name: 'building', icon: <BuildingIcon size={24} /> },
    { name: 'wallet', icon: <WalletIcon size={24} /> },
    { name: 'task', icon: <TaskIcon size={24} /> },
    { name: 'message', icon: <MessageIcon size={24} /> },
    { name: 'settings', icon: <SettingsIcon size={24} /> },
    { name: 'edit', icon: <EditIcon size={24} /> },
    { name: 'trash', icon: <TrashIcon size={24} /> },
    { name: 'pin', icon: <PinIcon size={24} /> },
    { name: 'play', icon: <PlayIcon size={24} /> },
  ];

  return (
    <div style={{ maxWidth: '1240px', margin: 'auto', padding: '16px', display: 'grid', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2>مكتبة المكوّنات (Madar Design System)</h2>
          <small className="mut">جميع العناصر والأنماط والألوان المستخدمة في الهوية البصرية الموحدة</small>
        </div>
        <button className="btn p" onClick={() => setShowModal(true)}>
          افتح نافذة تجريبية
        </button>
      </div>

      <div className="g two">
        {/* Buttons & Chips */}
        <div className="c">
          <h3>الأزرار والشارات (Buttons & Badges)</h3>
          <p style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn p">زر أساسي (.btn.p)</button>
            <button className="btn">زر ثانوي (.btn)</button>
            <button className="btn" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
              زر خطر
            </button>
          </p>
          <p style={{ marginTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span className="ch ok">نجاح (.ok)</span>
            <span className="ch wn">تنبيه (.wn)</span>
            <span className="ch er">خطأ (.er)</span>
            <span className="ch in">معلومة (.in)</span>
          </p>
        </div>

        {/* Inputs & Switches */}
        <div className="c">
          <h3>الحقول والمفاتيح (Inputs & Switches)</h3>
          <input
            className="in2"
            placeholder="اسم الطالب أو المعلم (.in2)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ marginTop: '8px' }}
          />
          <div style={{ margin: '14px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className={`sw ${switch1 ? 'on' : ''}`}
              onClick={() => setSwitch1(!switch1)}
              aria-label="تفعيل المفتاح 1"
            />
            <small className="mut">مفتاح 1 ({switch1 ? 'مفعل' : 'معطل'})</small>

            <button
              className={`sw ${switch2 ? 'on' : ''}`}
              onClick={() => setSwitch2(!switch2)}
              aria-label="تفعيل المفتاح 2"
              style={{ marginInlineStart: '12px' }}
            />
            <small className="mut">مفتاح 2 ({switch2 ? 'مفعل' : 'معطل'})</small>
          </div>
          <button className="btn" onClick={triggerToast}>
            أظهر إشعار فوري (Toast)
          </button>
        </div>

        {/* Progress & Conic Rings */}
        <div className="c">
          <h3>التقدّم والصور الرمزية (Progress & Avatars)</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', margin: '12px 0' }}>
            <span className="ring" style={{ '--p': 72, '--x': 'var(--acc)' } as React.CSSProperties}>
              <b>72%</b>
            </span>
            <span className="ring" style={{ '--p': 40, '--x': 'var(--red)' } as React.CSSProperties}>
              <b>40%</b>
            </span>
            <span className="ring" style={{ '--p': 90, '--x': 'var(--tq)' } as React.CSSProperties}>
              <b>90%</b>
            </span>
            <span className="av">س</span>
            <span className="av" style={{ background: 'var(--pri)', color: '#fff' }}>ع</span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <small className="mut">شريط التقدم (.pb): 60%</small>
            <div className="pb">
              <i style={{ '--p': 60, '--x': 'var(--tq)' } as React.CSSProperties} />
            </div>
          </div>
        </div>

        {/* Sadu Heritage & Brand Colors */}
        <div className="c">
          <h3>شريط السدو التراثي وألوان الهوية</h3>
          <div className="sadu" style={{ borderRadius: '6px', margin: '10px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', fontSize: '11px', marginTop: '14px' }}>
            <div style={{ background: 'var(--pri)', color: '#fff', padding: '12px 4px', borderRadius: '8px' }}>
              --pri / --ink<br />كحلي ملكي
            </div>
            <div style={{ background: 'var(--acc)', color: '#181C45', padding: '12px 4px', borderRadius: '8px', fontWeight: 600 }}>
              --acc<br />ذهبي مدار
            </div>
            <div style={{ background: 'var(--red)', color: '#fff', padding: '12px 4px', borderRadius: '8px' }}>
              --red<br />سدو طيني
            </div>
            <div style={{ background: 'var(--tq)', color: '#fff', padding: '12px 4px', borderRadius: '8px' }}>
              --tq<br />أزرق تركواز
            </div>
          </div>
        </div>
      </div>

      {/* Icons Grid */}
      <div className="c">
        <h3>أيقونات المنصة (Icons Grid)</h3>
        <div className="ig" style={{ marginTop: '14px' }}>
          {iconsList.map((item) => (
            <div key={item.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal (.mod) */}
      {showModal && (
        <div className="mod" onClick={() => setShowModal(false)}>
          <div className="c" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>نافذة إدخال جديدة</h2>
              <button
                style={{ background: 'none', border: 0, color: 'var(--ink)', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => setShowModal(false)}
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>
            <input className="in2" placeholder="الاسم أو العنوان" defaultValue="مقرر الرياضيات التفاعلي" />
            <select className="in2">
              <option>ثالث ثانوي / 2 علمي</option>
              <option>ثالث ثانوي / 4 علمي</option>
            </select>
            <textarea className="in2" rows={3} placeholder="ملاحظات إضافية (اختياري)"></textarea>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button className="btn" onClick={() => setShowModal(false)}>
                إلغاء
              </button>
              <button
                className="btn p"
                onClick={() => {
                  setShowModal(false);
                  triggerToast();
                }}
              >
                حفظ البيانات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification (.ts) */}
      {showToast && <div className="ts">تم حفظ التغييرات بنجاح ✓</div>}
    </div>
  );
}
