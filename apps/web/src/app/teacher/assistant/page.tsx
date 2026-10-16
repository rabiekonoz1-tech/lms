'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TaskIcon,
  MessageIcon,
  CheckCircleIcon,
  CheckIcon,
  ShieldIcon,
  CalendarIcon,
} from '../../../components/icons';

interface AssistantTask {
  id: string;
  title: string;
  desc: string;
  dueText: string;
  urgency: 'er' | 'wn' | 'in' | 'ok';
  completed: boolean;
}

export default function TeachingAssistantPage() {
  const [tasks, setTasks] = useState<AssistantTask[]>([
    {
      id: 'ta-1',
      title: 'تصحيح اختبار المتتاليات (ثالث ثانوي / 4)',
      desc: '12 ورقة إجابة متبقية بانتظار الرصد',
      dueText: 'اليوم',
      urgency: 'er',
      completed: false,
    },
    {
      id: 'ta-2',
      title: 'تسجيل حضور حصة 9:15 ص',
      desc: 'ثالث ثانوي / 4 — قاعة 2',
      dueText: 'اليوم',
      urgency: 'er',
      completed: false,
    },
    {
      id: 'ta-3',
      title: 'الرد على سؤال الطالبة ريما عن قاعدة السلسلة',
      desc: 'رسالة واردة عبر المنصة',
      dueText: 'بكرة',
      urgency: 'wn',
      completed: false,
    },
    {
      id: 'ta-4',
      title: 'رفع ملف مراجعة لغتي — الوحدة الثالثة',
      desc: 'تنسيق مع أ. نورة العتيبي',
      dueText: 'الأربعاء',
      urgency: 'in',
      completed: true,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div style={{ display: 'grid', gap: '14px' }}>
      {/* 1. Header Greeting & Context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2>أبشري أستاذة ريم، هذي مهام اليوم 👋</h2>
          <small className="mut">
            مساعد معلم — ثانوية اليرموك (تعملين مع أ. عبدالله القحطاني و أ. نورة العتيبي)
          </small>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link href="/teacher/attendance" className="btn p">
            تسجيل حضور فوري
          </Link>
          <Link href="/teacher/courses" className="btn">
            مراجعة الواجبات
          </Link>
        </div>
      </div>

      {/* 2. Three / Four KPI Cards */}
      <div className="g k4">
        <div className="c kp" style={{ '--x': 'var(--pri)' } as React.CSSProperties}>
          <span className="bd">
            <TaskIcon size={20} />
          </span>
          <small>تصحيح مطلوب</small>
          <b>24 ورقة</b>
          <em>قبل يوم الخميس</em>
        </div>

        <div className="c kp" style={{ '--x': 'var(--red)' } as React.CSSProperties}>
          <span className="bd">
            <MessageIcon size={20} />
          </span>
          <small>أسئلة بلا رد</small>
          <b>7</b>
          <em style={{ color: 'var(--red)' }}>أقدمها منذ ساعتين</em>
        </div>

        <div className="c kp" style={{ '--x': 'var(--tq)' } as React.CSSProperties}>
          <span className="bd">
            <CheckCircleIcon size={20} />
          </span>
          <small>أنجزتِ هالأسبوع</small>
          <b>58 مهمة</b>
          <em>أداء متميز وتغطية كاملة</em>
        </div>

        <div className="c kp" style={{ '--x': 'var(--acc)' } as React.CSSProperties}>
          <span className="bd">
            <CalendarIcon size={20} />
          </span>
          <small>حصص تحت الإشراف</small>
          <b>4 حصص</b>
          <em>اليوم بفرع اليرموك</em>
        </div>
      </div>

      {/* 3. Two Columns: Tasks Checklist + Role Permissions Boundaries */}
      <div className="g two">
        {/* Left Column: Interactive Tasks List */}
        <div className="c">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>قائمة المهام اليومية</h3>
            <span className="ch in">
              {tasks.filter((t) => !t.completed).length} مهام معلقة
            </span>
          </div>

          {tasks.map((task) => (
            <div
              key={task.id}
              className={`r tk ${task.completed ? 'd' : ''}`}
              onClick={() => toggleTask(task.id)}
            >
              <span className="box">
                <CheckIcon size={14} />
              </span>
              <div>
                <b className="t">{task.title}</b>
                <small className="mut">{task.desc}</small>
              </div>
              <span className={`ch ${task.urgency}`}>
                {task.completed ? 'تم الإنجاز' : task.dueText}
              </span>
            </div>
          ))}
        </div>

        {/* Right Column: Roles & Permission Invariants */}
        <div className="c">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0 }}>حدود الصلاحيات والمسؤوليات</h3>
            <span className="ch ok">مساعد معتمد</span>
          </div>

          <div className="r">
            <span className="bd" style={{ width: '28px', height: '28px', margin: 0, color: 'var(--tq)' }}>
              <CheckIcon size={16} />
            </span>
            <div>
              <b>تصحيح الواجبات ورصد الدرجات المبدئية</b>
              <small className="mut">تعتمد وتنشر نهائياً بواسطة المعلم المشرف</small>
            </div>
            <span className="ch ok">مصرّح</span>
          </div>

          <div className="r">
            <span className="bd" style={{ width: '28px', height: '28px', margin: 0, color: 'var(--tq)' }}>
              <CheckIcon size={16} />
            </span>
            <div>
              <b>تسجيل الحضور والغياب والرد على أسئلة الطلاب</b>
              <small className="mut">إشراف فوري داخل القاعات الافتراضية والسنتر</small>
            </div>
            <span className="ch ok">مصرّح</span>
          </div>

          <div className="r">
            <span className="bd" style={{ width: '28px', height: '28px', margin: 0, color: 'var(--red)' }}>
              <ShieldIcon size={16} />
            </span>
            <div>
              <b>حذف الفصول الدراسية أو اعتماد الكشوف الرسمية</b>
              <small className="mut">صلاحية حصرية للمعلم ومدير المدرسة لحماية السجلات</small>
            </div>
            <span className="ch er">غير مصرّح</span>
          </div>
        </div>
      </div>
    </div>
  );
}
