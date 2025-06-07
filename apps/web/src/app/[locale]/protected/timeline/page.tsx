'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useTranslations } from 'next-intl';

interface Task {
  name: string;
  start: string;
  end: string;
  duration: number;
  status: 'planned' | 'inprogress' | 'done';
}

export default function TimelinePage() {
  const t = useTranslations('Timeline');
  const [tasks, setTasks] = useState<Task[]>([]);

  const [task, setTask] = useState<Omit<Task, 'duration'>>({
    name: '',
    start: '',
    end: '',
    status: 'planned'
  });

  const handleAdd = () => {
    if (!task.name || !task.start || !task.end) return;
    const duration = Math.ceil(
      (new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 60 * 60 * 24)
    );
    setTasks([
      ...tasks,
      {
        ...task,
        duration
      }
    ]);
    setTask({ name: '', start: '', end: '', status: 'planned' });
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tasks);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
    XLSX.writeFile(wb, 'timeline-export.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(t('title'), 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [[
        t('name'),
        t('start'),
        t('end'),
        t('duration'),
        t('status')
      ]],
      body: tasks.map((taskItem) => [
        taskItem.name,
        taskItem.start,
        taskItem.end,
        taskItem.duration + ' ' + t('days'),
        t(taskItem.status)
      ])
    });
    doc.save('timeline-summary.pdf');
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('title')}</h1>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <input placeholder={t('name')} value={task.name} onChange={(e) => setTask({ ...task, name: e.target.value })} />
        <input type="date" value={task.start} onChange={(e) => setTask({ ...task, start: e.target.value })} />
        <input type="date" value={task.end} onChange={(e) => setTask({ ...task, end: e.target.value })} />
        <select value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value as 'planned' | 'inprogress' | 'done' })}>
          <option value="planned">{t('planned')}</option>
          <option value="inprogress">{t('inprogress')}</option>
          <option value="done">{t('done')}</option>
        </select>
        <button onClick={handleAdd}>{t('add')}</button>
        {tasks.length > 0 && (
          <>
            <button onClick={exportExcel}>{t('excel')}</button>
            <button onClick={exportPDF}>{t('pdf')}</button>
          </>
        )}
      </div>

      {tasks.length > 0 && (
        <table border={1} cellPadding={8} style={{ marginTop: 24, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>{t('name')}</th>
              <th>{t('start')}</th>
              <th>{t('end')}</th>
              <th>{t('duration')}</th>
              <th>{t('status')}</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((taskItem, i) => (
              <tr key={i}>
                <td>{taskItem.name}</td>
                <td>{taskItem.start}</td>
                <td>{taskItem.end}</td>
                <td>{taskItem.duration}</td>
                <td>{t(taskItem.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
