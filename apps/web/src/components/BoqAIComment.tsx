'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

interface BoqAICommentProps {
  tableData: string[][] | null;
}

export default function BoqAIComment({ tableData }: BoqAICommentProps) {
  const t = useTranslations('AIComments');

  const comments = useMemo(() => {
    if (!tableData || tableData.length < 2) return [];

    const rowCount = tableData.length - 1;
    const headers = tableData[0];
    const sampleRow = tableData[1];

    return [
      t('rows', { count: rowCount }),
      t('columns', { count: headers.length, headers: headers.join(', ') }),
      t('example', { example: sampleRow.join(', ') })
    ];
  }, [tableData, t]);

  if (!comments.length) return null;

  return (
    <div style={{
      backgroundColor: '#eef',
      padding: 16,
      borderRadius: 6,
      marginTop: 24
    }}>
      <h4>{t('title')}</h4>
      <ul>
        {comments.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
}
