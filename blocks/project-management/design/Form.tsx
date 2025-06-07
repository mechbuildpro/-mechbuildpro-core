import React from 'react';
import { useForm } from 'react-hook-form';

interface DesignFormData {
  type: 'drawing' | 'model' | 'revision' | 'approval' | 'document';
  name: string;
  category: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'pending';
  author: string;
  description?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  changes?: string[];
  impact?: string[];
  requester?: string;
  approver?: string;
  requestDate?: Date;
  approvalDate?: Date;
  comments?: string;
  notes?: string;
}

interface DesignFormProps {
  onSubmit: (data: DesignFormData) => void;
  initialData?: Partial<DesignFormData>;
}

export const DesignForm: React.FC<DesignFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<DesignFormData>({
    defaultValues: initialData
  });

  const selectedType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="design-form">
      <div className="form-group">
        <label>Tip</label>
        <select {...register('type', { required: true })}>
          <option value="drawing">Teknik Çizim</option>
          <option value="model">3D Model</option>
          <option value="revision">Tasarım Revizyonu</option>
          <option value="approval">Tasarım Onayı</option>
          <option value="document">Doküman</option>
        </select>
        {errors.type && <span className="error">Tip gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Ad</label>
        <input
          type="text"
          {...register('name', { required: true })}
          placeholder="Tasarım adı"
        />
        {errors.name && <span className="error">Ad gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Kategori</label>
        <select {...register('category', { required: true })}>
          {selectedType === 'drawing' || selectedType === 'revision' || selectedType === 'approval' ? (
            <>
              <option value="architectural">Mimari</option>
              <option value="structural">Statik</option>
              <option value="mechanical">Mekanik</option>
              <option value="electrical">Elektrik</option>
              <option value="fire">Yangın</option>
            </>
          ) : selectedType === 'model' ? (
            <>
              <option value="bim">BIM</option>
              <option value="render">Render</option>
              <option value="animation">Animasyon</option>
            </>
          ) : (
            <>
              <option value="specifications">Teknik Şartnameler</option>
              <option value="products">Ürün Dokümantasyonu</option>
              <option value="standards">Standartlar ve Kodlar</option>
              <option value="references">Referans Dokümanlar</option>
            </>
          )}
        </select>
        {errors.category && <span className="error">Kategori gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Versiyon</label>
        <input
          type="text"
          {...register('version', { required: true })}
          placeholder="Versiyon"
        />
        {errors.version && <span className="error">Versiyon gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Durum</label>
        <select {...register('status', { required: true })}>
          {selectedType === 'approval' ? (
            <>
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
            </>
          ) : (
            <>
              <option value="draft">Taslak</option>
              <option value="review">İncelemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
            </>
          )}
        </select>
        {errors.status && <span className="error">Durum gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Yazar</label>
        <input
          type="text"
          {...register('author', { required: true })}
          placeholder="Yazar"
        />
        {errors.author && <span className="error">Yazar gereklidir</span>}
      </div>

      <div className="form-group">
        <label>Açıklama</label>
        <textarea
          {...register('description')}
          placeholder="Tasarım açıklaması"
        />
      </div>

      <div className="form-group">
        <label>Dosya URL</label>
        <input
          type="text"
          {...register('fileUrl')}
          placeholder="Dosya URL"
        />
      </div>

      {selectedType === 'model' && (
        <div className="form-group">
          <label>Önizleme URL</label>
          <input
            type="text"
            {...register('thumbnailUrl')}
            placeholder="Önizleme URL"
          />
        </div>
      )}

      {selectedType === 'revision' && (
        <>
          <div className="form-group">
            <label>Değişiklikler</label>
            <textarea
              {...register('changes')}
              placeholder="Yapılan değişiklikler"
            />
          </div>

          <div className="form-group">
            <label>Etki</label>
            <textarea
              {...register('impact')}
              placeholder="Değişikliklerin etkisi"
            />
          </div>
        </>
      )}

      {selectedType === 'approval' && (
        <>
          <div className="form-group">
            <label>Talep Eden</label>
            <input
              type="text"
              {...register('requester', { required: true })}
              placeholder="Talep eden"
            />
            {errors.requester && <span className="error">Talep eden gereklidir</span>}
          </div>

          <div className="form-group">
            <label>Onaylayan</label>
            <input
              type="text"
              {...register('approver')}
              placeholder="Onaylayan"
            />
          </div>

          <div className="form-group">
            <label>Talep Tarihi</label>
            <input
              type="date"
              {...register('requestDate')}
            />
          </div>

          <div className="form-group">
            <label>Onay Tarihi</label>
            <input
              type="date"
              {...register('approvalDate')}
            />
          </div>

          <div className="form-group">
            <label>Yorumlar</label>
            <textarea
              {...register('comments')}
              placeholder="Onay yorumları"
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Notlar</label>
        <textarea
          {...register('notes')}
          placeholder="Ek notlar"
        />
      </div>

      <button type="submit" className="submit-button">
        Kaydet
      </button>
    </form>
  );
};

export default DesignForm; 