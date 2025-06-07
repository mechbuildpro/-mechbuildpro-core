import React from 'react';
import { useForm } from 'react-hook-form';

interface ConstructionFormData {
  type: 'schedule' | 'progress' | 'quality' | 'safety' | 'workorder';
  name: string;
  category: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  progress?: number;
  location?: string;
  assignedTo?: string;
  description?: string;
  findings?: string[];
  correctiveActions?: string[];
  followUpDate?: Date;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  materials?: string[];
  labor?: string[];
  equipment?: string[];
  photos?: string[];
  notes?: string;
}

interface ConstructionFormProps {
  onSubmit: (data: ConstructionFormData) => void;
  initialData?: Partial<ConstructionFormData>;
}

export const ConstructionForm: React.FC<ConstructionFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ConstructionFormData>({
    defaultValues: initialData
  });

  const formType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="construction-form">
      <div className="form-group">
        <label>Tip</label>
        <select {...register('type', { required: 'Tip seçimi zorunludur' })}>
          <option value="schedule">İş Programı</option>
          <option value="progress">İlerleme Raporu</option>
          <option value="quality">Kalite Kontrol</option>
          <option value="safety">Güvenlik Denetimi</option>
          <option value="workorder">İş Emri</option>
        </select>
        {errors.type && <span className="error">{errors.type.message}</span>}
      </div>

      <div className="form-group">
        <label>İsim</label>
        <input
          type="text"
          {...register('name', { required: 'İsim zorunludur' })}
        />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>

      <div className="form-group">
        <label>Kategori</label>
        <select {...register('category', { required: 'Kategori seçimi zorunludur' })}>
          {formType === 'schedule' && (
            <>
              <option value="foundation">Temel</option>
              <option value="structure">Yapı</option>
              <option value="mechanical">Mekanik</option>
              <option value="electrical">Elektrik</option>
              <option value="finishing">İç Mekan</option>
            </>
          )}
          {formType === 'progress' && (
            <>
              <option value="daily">Günlük</option>
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
            </>
          )}
          {formType === 'quality' && (
            <>
              <option value="inspection">Denetim</option>
              <option value="test">Test</option>
              <option value="verification">Doğrulama</option>
            </>
          )}
          {formType === 'safety' && (
            <>
              <option value="inspection">Kontrol</option>
              <option value="risk">Risk Değerlendirmesi</option>
              <option value="accident">Kaza Raporu</option>
              <option value="training">Eğitim</option>
            </>
          )}
          {formType === 'workorder' && (
            <>
              <option value="construction">İnşaat</option>
              <option value="maintenance">Bakım</option>
              <option value="repair">Tamir</option>
              <option value="inspection">Kontrol</option>
            </>
          )}
        </select>
        {errors.category && <span className="error">{errors.category.message}</span>}
      </div>

      <div className="form-group">
        <label>Durum</label>
        <select {...register('status', { required: 'Durum seçimi zorunludur' })}>
          {formType === 'schedule' && (
            <>
              <option value="not_started">Başlamadı</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="delayed">Gecikmeli</option>
            </>
          )}
          {formType === 'progress' && (
            <>
              <option value="on_time">Zamanında</option>
              <option value="delayed">Gecikmeli</option>
              <option value="completed">Tamamlandı</option>
            </>
          )}
          {(formType === 'quality' || formType === 'safety') && (
            <>
              <option value="passed">Geçti</option>
              <option value="failed">Başarısız</option>
              <option value="pending">Beklemede</option>
            </>
          )}
          {formType === 'workorder' && (
            <>
              <option value="pending">Beklemede</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </>
          )}
        </select>
        {errors.status && <span className="error">{errors.status.message}</span>}
      </div>

      {(formType === 'schedule' || formType === 'workorder') && (
        <>
          <div className="form-group">
            <label>Başlangıç Tarihi</label>
            <input
              type="date"
              {...register('startDate', { required: 'Başlangıç tarihi zorunludur' })}
            />
            {errors.startDate && <span className="error">{errors.startDate.message}</span>}
          </div>

          <div className="form-group">
            <label>Bitiş Tarihi</label>
            <input
              type="date"
              {...register('endDate', { required: 'Bitiş tarihi zorunludur' })}
            />
            {errors.endDate && <span className="error">{errors.endDate.message}</span>}
          </div>
        </>
      )}

      {formType === 'schedule' && (
        <div className="form-group">
          <label>İlerleme (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            {...register('progress', { required: 'İlerleme zorunludur' })}
          />
          {errors.progress && <span className="error">{errors.progress.message}</span>}
        </div>
      )}

      {(formType === 'quality' || formType === 'safety' || formType === 'workorder') && (
        <div className="form-group">
          <label>Konum</label>
          <input
            type="text"
            {...register('location', { required: 'Konum zorunludur' })}
          />
          {errors.location && <span className="error">{errors.location.message}</span>}
        </div>
      )}

      {(formType === 'schedule' || formType === 'workorder') && (
        <div className="form-group">
          <label>Atanan Kişi</label>
          <input
            type="text"
            {...register('assignedTo', { required: 'Atanan kişi zorunludur' })}
          />
          {errors.assignedTo && <span className="error">{errors.assignedTo.message}</span>}
        </div>
      )}

      <div className="form-group">
        <label>Açıklama</label>
        <textarea
          {...register('description', { required: 'Açıklama zorunludur' })}
        />
        {errors.description && <span className="error">{errors.description.message}</span>}
      </div>

      {(formType === 'quality' || formType === 'safety') && (
        <>
          <div className="form-group">
            <label>Bulgular</label>
            <textarea
              {...register('findings')}
              placeholder="Her satıra bir bulgu yazın"
            />
          </div>

          <div className="form-group">
            <label>Düzeltici Faaliyetler</label>
            <textarea
              {...register('correctiveActions')}
              placeholder="Her satıra bir düzeltici faaliyet yazın"
            />
          </div>

          <div className="form-group">
            <label>Takip Tarihi</label>
            <input
              type="date"
              {...register('followUpDate')}
            />
          </div>
        </>
      )}

      {formType === 'workorder' && (
        <>
          <div className="form-group">
            <label>Öncelik</label>
            <select {...register('priority', { required: 'Öncelik seçimi zorunludur' })}>
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
            </select>
            {errors.priority && <span className="error">{errors.priority.message}</span>}
          </div>

          <div className="form-group">
            <label>Malzemeler</label>
            <textarea
              {...register('materials')}
              placeholder="Her satıra bir malzeme yazın"
            />
          </div>

          <div className="form-group">
            <label>İşçilik</label>
            <textarea
              {...register('labor')}
              placeholder="Her satıra bir işçilik yazın"
            />
          </div>

          <div className="form-group">
            <label>Ekipman</label>
            <textarea
              {...register('equipment')}
              placeholder="Her satıra bir ekipman yazın"
            />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Fotoğraflar</label>
        <input
          type="file"
          multiple
          accept="image/*"
          {...register('photos')}
        />
      </div>

      <div className="form-group">
        <label>Notlar</label>
        <textarea {...register('notes')} />
      </div>

      <button type="submit">Kaydet</button>
    </form>
  );
};

export default ConstructionForm; 