import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

interface DocumentFormData {
  type: 'drawing' | 'contract' | 'report' | 'archive';
  name: string;
  description?: string;
  category?: string;
  version?: string;
  status: string;
  uploadDate: string;
  expiryDate?: string;
  accessLevel: string;
  notes?: string;
}

interface DocumentFormProps {
  onSubmit: (data: DocumentFormData) => void;
  initialData?: Partial<DocumentFormData>;
}

export const DocumentForm: React.FC<DocumentFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit } = useForm<DocumentFormData>({
    defaultValues: initialData
  });

  const onFormSubmit: SubmitHandler<DocumentFormData> = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <div>
        <label>Doküman Tipi</label>
        <select {...register('type', { required: true })}>
          <option value="drawing">Teknik Çizim</option>
          <option value="contract">Sözleşme</option>
          <option value="report">Rapor</option>
          <option value="archive">Arşiv</option>
        </select>
      </div>

      <div>
        <label>Doküman Adı</label>
        <input {...register('name', { required: true })} />
      </div>

      <div>
        <label>Açıklama</label>
        <textarea {...register('description')} />
      </div>

      <div>
        <label>Kategori</label>
        <input {...register('category')} />
      </div>

      <div>
        <label>Versiyon</label>
        <input {...register('version')} />
      </div>

      <div>
        <label>Durum</label>
        <select {...register('status', { required: true })}>
          <option value="draft">Taslak</option>
          <option value="review">İncelemede</option>
          <option value="approved">Onaylandı</option>
          <option value="archived">Arşivlendi</option>
        </select>
      </div>

      <div>
        <label>Yükleme Tarihi</label>
        <input 
          type="date" 
          {...register('uploadDate', { required: true })} 
        />
      </div>

      <div>
        <label>Son Geçerlilik Tarihi</label>
        <input 
          type="date" 
          {...register('expiryDate')} 
        />
      </div>

      <div>
        <label>Erişim Seviyesi</label>
        <select {...register('accessLevel', { required: true })}>
          <option value="public">Herkese Açık</option>
          <option value="internal">Dahili</option>
          <option value="restricted">Kısıtlı</option>
          <option value="confidential">Gizli</option>
        </select>
      </div>

      <div>
        <label>Notlar</label>
        <textarea {...register('notes')} />
      </div>

      <button type="submit">Dokümanı Kaydet</button>
    </form>
  );
};

export default DocumentForm; 