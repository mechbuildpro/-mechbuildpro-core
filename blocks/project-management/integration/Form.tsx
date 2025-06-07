import React from 'react';
import { useForm } from 'react-hook-form';

interface IntegrationFormData {
  type: 'coordination' | 'testing' | 'commissioning' | 'transition';
  name: string;
  category: string;
  status: string;
  systems: string[];
  startDate?: Date;
  endDate?: Date;
  description?: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  testScenario?: string;
  expectedResult?: string;
  actualResult?: string;
  testDate?: Date;
  executedBy?: string;
  approvedBy?: string;
  approvalDate?: Date;
  issues?: string[];
  resolution?: string;
  resources?: string[];
  risks?: string[];
  mitigation?: string[];
  backupPlan?: string;
  rollbackPlan?: string;
  migrationPlan?: string;
  trainingPlan?: string;
  supportPlan?: string;
  monitoringPlan?: string;
  notes?: string;
}

interface IntegrationFormProps {
  onSubmit: (data: IntegrationFormData) => void;
  initialData?: Partial<IntegrationFormData>;
}

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  onSubmit,
  initialData
}) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<IntegrationFormData>({
    defaultValues: initialData
  });

  const formType = watch('type');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="integration-form">
      <div className="form-group">
        <label>Tip</label>
        <select {...register('type', { required: 'Tip seçimi zorunludur' })}>
          <option value="coordination">Sistemler Arası Koordinasyon</option>
          <option value="testing">Entegrasyon Testi</option>
          <option value="commissioning">Devreye Alma</option>
          <option value="transition">Sistem Geçişi</option>
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
          {formType === 'coordination' && (
            <>
              <option value="hvac">HVAC</option>
              <option value="electrical">Elektrik</option>
              <option value="plumbing">Sıhhi Tesisat</option>
              <option value="fire">Yangın</option>
              <option value="security">Güvenlik</option>
            </>
          )}
          {formType === 'testing' && (
            <>
              <option value="functional">Fonksiyonel</option>
              <option value="performance">Performans</option>
              <option value="security">Güvenlik</option>
              <option value="compatibility">Uyumluluk</option>
            </>
          )}
          {formType === 'commissioning' && (
            <>
              <option value="schedule">Takvim</option>
              <option value="resource">Kaynak</option>
              <option value="risk">Risk</option>
              <option value="backup">Yedekleme</option>
              <option value="rollback">Geri Dönüş</option>
            </>
          )}
          {formType === 'transition' && (
            <>
              <option value="planning">Planlama</option>
              <option value="migration">Migrasyon</option>
              <option value="training">Eğitim</option>
              <option value="support">Destek</option>
              <option value="monitoring">İzleme</option>
            </>
          )}
        </select>
        {errors.category && <span className="error">{errors.category.message}</span>}
      </div>

      <div className="form-group">
        <label>Durum</label>
        <select {...register('status', { required: 'Durum seçimi zorunludur' })}>
          {formType === 'coordination' && (
            <>
              <option value="pending">Beklemede</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="blocked">Engellendi</option>
            </>
          )}
          {formType === 'testing' && (
            <>
              <option value="pending">Beklemede</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="passed">Geçti</option>
              <option value="failed">Başarısız</option>
            </>
          )}
          {(formType === 'commissioning' || formType === 'transition') && (
            <>
              <option value="pending">Beklemede</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="delayed">Gecikmeli</option>
            </>
          )}
        </select>
        {errors.status && <span className="error">{errors.status.message}</span>}
      </div>

      <div className="form-group">
        <label>Sistemler</label>
        <select multiple {...register('systems', { required: 'En az bir sistem seçilmelidir' })}>
          <option value="hvac">HVAC</option>
          <option value="electrical">Elektrik</option>
          <option value="plumbing">Sıhhi Tesisat</option>
          <option value="fire">Yangın</option>
          <option value="security">Güvenlik</option>
        </select>
        {errors.systems && <span className="error">{errors.systems.message}</span>}
      </div>

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

      <div className="form-group">
        <label>Açıklama</label>
        <textarea
          {...register('description', { required: 'Açıklama zorunludur' })}
        />
        {errors.description && <span className="error">{errors.description.message}</span>}
      </div>

      <div className="form-group">
        <label>Atanan Kişi</label>
        <input
          type="text"
          {...register('assignedTo', { required: 'Atanan kişi zorunludur' })}
        />
        {errors.assignedTo && <span className="error">{errors.assignedTo.message}</span>}
      </div>

      {formType === 'coordination' && (
        <div className="form-group">
          <label>Öncelik</label>
          <select {...register('priority', { required: 'Öncelik seçimi zorunludur' })}>
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
            <option value="critical">Kritik</option>
          </select>
          {errors.priority && <span className="error">{errors.priority.message}</span>}
        </div>
      )}

      {formType === 'testing' && (
        <>
          <div className="form-group">
            <label>Test Senaryosu</label>
            <textarea
              {...register('testScenario', { required: 'Test senaryosu zorunludur' })}
            />
            {errors.testScenario && <span className="error">{errors.testScenario.message}</span>}
          </div>

          <div className="form-group">
            <label>Beklenen Sonuç</label>
            <textarea
              {...register('expectedResult', { required: 'Beklenen sonuç zorunludur' })}
            />
            {errors.expectedResult && <span className="error">{errors.expectedResult.message}</span>}
          </div>

          <div className="form-group">
            <label>Gerçekleşen Sonuç</label>
            <textarea {...register('actualResult')} />
          </div>

          <div className="form-group">
            <label>Test Tarihi</label>
            <input
              type="date"
              {...register('testDate')}
            />
          </div>

          <div className="form-group">
            <label>Testi Yapan</label>
            <input
              type="text"
              {...register('executedBy')}
            />
          </div>

          <div className="form-group">
            <label>Onaylayan</label>
            <input
              type="text"
              {...register('approvedBy')}
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
            <label>Sorunlar</label>
            <textarea
              {...register('issues')}
              placeholder="Her satıra bir sorun yazın"
            />
          </div>

          <div className="form-group">
            <label>Çözüm</label>
            <textarea {...register('resolution')} />
          </div>
        </>
      )}

      {formType === 'commissioning' && (
        <>
          <div className="form-group">
            <label>Kaynaklar</label>
            <textarea
              {...register('resources')}
              placeholder="Her satıra bir kaynak yazın"
            />
          </div>

          <div className="form-group">
            <label>Riskler</label>
            <textarea
              {...register('risks')}
              placeholder="Her satıra bir risk yazın"
            />
          </div>

          <div className="form-group">
            <label>Azaltma Önlemleri</label>
            <textarea
              {...register('mitigation')}
              placeholder="Her satıra bir önlem yazın"
            />
          </div>

          <div className="form-group">
            <label>Yedekleme Planı</label>
            <textarea {...register('backupPlan')} />
          </div>

          <div className="form-group">
            <label>Geri Dönüş Planı</label>
            <textarea {...register('rollbackPlan')} />
          </div>
        </>
      )}

      {formType === 'transition' && (
        <>
          <div className="form-group">
            <label>Migrasyon Planı</label>
            <textarea {...register('migrationPlan')} />
          </div>

          <div className="form-group">
            <label>Eğitim Planı</label>
            <textarea {...register('trainingPlan')} />
          </div>

          <div className="form-group">
            <label>Destek Planı</label>
            <textarea {...register('supportPlan')} />
          </div>

          <div className="form-group">
            <label>İzleme Planı</label>
            <textarea {...register('monitoringPlan')} />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Notlar</label>
        <textarea {...register('notes')} />
      </div>

      <button type="submit">Kaydet</button>
    </form>
  );
};

export default IntegrationForm; 