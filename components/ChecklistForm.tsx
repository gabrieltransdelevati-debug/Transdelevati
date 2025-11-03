import React, { useState } from 'react';
import type { ChecklistSubmission, VehicleModel, ChecklistType } from '../types';
import { Card } from './ui/Card';
import { CameraIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface ChecklistFormProps {
  onSubmit: (submission: Omit<ChecklistSubmission, 'id' | 'submissionTimestamp' | 'checklistType'>) => void;
  checklistType: ChecklistType;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Helper Components moved outside of the main component to prevent re-creation on render, which causes focus loss.

const FormField: React.FC<{ label: string; children: React.ReactNode; htmlFor?: string, error?: string; id?: string }> = ({ label, children, htmlFor, error, id }) => (
    <div className="mb-6" id={id}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      {children}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
);

const YesNoQuestion: React.FC<{
    label: string; 
    value: boolean | null; 
    onChange: (value: boolean) => void;
    error?: string;
    id: keyof ChecklistSubmission;
}> = ({ label, value, onChange, error, id }) => (
  <div className="mb-6" id={id}>
      <p className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      <div className="flex space-x-4">
          <button type="button" onClick={() => onChange(true)} className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${value === true ? 'bg-green-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}>
              <CheckCircleIcon className="w-5 h-5 mr-2"/> Sim
          </button>
          <button type="button" onClick={() => onChange(false)} className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${value === false ? 'bg-red-500 text-white shadow-md' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'}`}>
              <XCircleIcon className="w-5 h-5 mr-2"/> Não
          </button>
      </div>
       {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);

const PhotoUpload: React.FC<{ label: string; photo: string | null; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; id: string }> = ({ label, photo, onChange, id }) => (
  <div className="text-center">
    <label htmlFor={id} className="cursor-pointer block">
      <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-blue-500 hover:bg-brand-blue-50 dark:hover:bg-slate-600 transition-colors">
        {photo ? (
          <img src={photo} alt={label} className="w-full h-full object-cover rounded-lg"/>
        ) : (
          <div className="flex flex-col items-center text-slate-500 dark:text-slate-400">
            <CameraIcon className="w-8 h-8 mb-1" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        )}
      </div>
    </label>
    <input id={id} type="file" accept="image/*" capture="environment" className="hidden" onChange={onChange} />
  </div>
);

const ChecklistForm: React.FC<ChecklistFormProps> = ({ onSubmit, checklistType }) => {
  const [driverName, setDriverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState<VehicleModel | ''>('');
  const [initialKm, setInitialKm] = useState('');
  const [fluidLevelsOk, setFluidLevelsOk] = useState<boolean | null>(null);
  const [lightsOk, setLightsOk] = useState<boolean | null>(null);
  const [emergencyItemsOk, setEmergencyItemsOk] = useState<boolean | null>(null);
  const [roadworthy, setRoadworthy] = useState<boolean | null>(null);
  const [observations, setObservations] = useState('');
  const [photoFront, setPhotoFront] = useState<string | null>(null);
  const [photoRight, setPhotoRight] = useState<string | null>(null);
  const [photoLeft, setPhotoLeft] = useState<string | null>(null);
  const [photoRear, setPhotoRear] = useState<string | null>(null);
  const [photoOdometer, setPhotoOdometer] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ChecklistSubmission, string>>>({});

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setter(base64);
    }
  };

  const validateForm = (): Partial<Record<keyof ChecklistSubmission, string>> => {
    const newErrors: Partial<Record<keyof ChecklistSubmission, string>> = {};
    if (!driverName.trim()) newErrors.driverName = "Nome do motorista é obrigatório.";
    if (!vehiclePlate.trim()) newErrors.vehiclePlate = "Placa do veículo é obrigatória.";
    if (!vehicleModel) newErrors.vehicleModel = "Modelo do veículo é obrigatório.";
    
    const kmNum = parseInt(initialKm, 10);
    const kmLabel = checklistType === 'saida' ? 'KM inicial' : 'KM final';
    if (initialKm.trim() === '' || isNaN(kmNum) || kmNum < 0) {
      newErrors.initialKm = `${kmLabel} é obrigatório e deve ser um número positivo.`;
    }

    if (fluidLevelsOk === null) newErrors.fluidLevelsOk = "Campo obrigatório.";
    if (lightsOk === null) newErrors.lightsOk = "Campo obrigatório.";
    if (emergencyItemsOk === null) newErrors.emergencyItemsOk = "Campo obrigatório.";
    if (roadworthy === null) newErrors.roadworthy = "Campo obrigatório.";
    
    return newErrors;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
        const firstErrorKey = Object.keys(validationErrors)[0] as keyof ChecklistSubmission;
        const errorElement = document.getElementById(firstErrorKey);
        if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    };
    
    const now = new Date();
    
    const parsedKm = parseInt(initialKm, 10);
    
    const submissionData = {
      driverName: driverName.trim(),
      vehiclePlate: vehiclePlate.trim().toUpperCase(),
      vehicleModel,
      // FIX: Ensure the type of `initialKm` is `number | ''` to match the `ChecklistSubmission` type.
      initialKm: isNaN(parsedKm) ? '' : parsedKm,
      fluidLevelsOk,
      lightsOk,
      emergencyItemsOk,
      roadworthy,
      observations: observations.trim(),
      departureDate: now.toLocaleDateString('pt-BR'),
      departureTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      photoFront,
      photoRight,
      photoLeft,
      photoRear,
      photoOdometer,
    };
    onSubmit(submissionData);
  };

  const formTitle = checklistType === 'saida' 
    ? 'Checklist de Partida do Veículo'
    : 'Checklist de Chegada do Veículo';
  
  const kmLabel = checklistType === 'saida' ? 'KM Inicial' : 'KM Final';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">{formTitle}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <FormField label="Nome do Motorista" htmlFor="driverName" error={errors.driverName} id="driverName">
              <input type="text" id="driverName" value={driverName} onChange={e => setDriverName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </FormField>
            <FormField label="Placa do Veículo" htmlFor="vehiclePlate" error={errors.vehiclePlate} id="vehiclePlate">
              <input type="text" id="vehiclePlate" value={vehiclePlate} onChange={e => setVehiclePlate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white uppercase" />
            </FormField>
            <FormField label="Modelo do Veículo" htmlFor="vehicleModel" error={errors.vehicleModel} id="vehicleModel">
              <select id="vehicleModel" value={vehicleModel} onChange={e => setVehicleModel(e.target.value as VehicleModel)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                <option value="" disabled>Selecione...</option>
                <option value="fiorino">Fiorino</option>
                <option value="vuc">VUC</option>
              </select>
            </FormField>
            <FormField label={kmLabel} htmlFor="initialKm" error={errors.initialKm} id="initialKm">
              <input type="number" id="initialKm" value={initialKm} onChange={e => setInitialKm(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </FormField>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Itens de Verificação</h3>
            <YesNoQuestion id="fluidLevelsOk" label="Os fluídos do veículo estão no nível recomendado?" value={fluidLevelsOk} onChange={setFluidLevelsOk} error={errors.fluidLevelsOk}/>
            <YesNoQuestion id="lightsOk" label="Veículo possuí sistemas de iluminação e setas em pleno funcionamento?" value={lightsOk} onChange={setLightsOk} error={errors.lightsOk}/>
            <YesNoQuestion id="emergencyItemsOk" label="Itens de emergência no veículo? (Estepe, macaco, chave, triângulo)" value={emergencyItemsOk} onChange={setEmergencyItemsOk} error={errors.emergencyItemsOk}/>
            <YesNoQuestion id="roadworthy" label="Veículo em condições de rodagem?" value={roadworthy} onChange={setRoadworthy} error={errors.roadworthy}/>

            <FormField label="Outras Observações" htmlFor="observations">
              <textarea id="observations" value={observations} onChange={e => setObservations(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue-500 focus:border-brand-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
            </FormField>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Fotos do Veículo</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <PhotoUpload id="photo-front" label="Frente" photo={photoFront} onChange={e => handlePhotoUpload(e, setPhotoFront)} />
              <PhotoUpload id="photo-right" label="Lateral Direita" photo={photoRight} onChange={e => handlePhotoUpload(e, setPhotoRight)} />
              <PhotoUpload id="photo-left" label="Lateral Esquerda" photo={photoLeft} onChange={e => handlePhotoUpload(e, setPhotoLeft)} />
              <PhotoUpload id="photo-rear" label="Traseira" photo={photoRear} onChange={e => handlePhotoUpload(e, setPhotoRear)} />
              <PhotoUpload id="photo-odometer" label="Hodômetro" photo={photoOdometer} onChange={e => handlePhotoUpload(e, setPhotoOdometer)} />
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button type="submit" className="w-full bg-brand-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue-500 transition-colors duration-300 shadow-lg">
                Enviar Checklist
            </button>
        </div>
      </Card>
    </form>
  );
};

export default ChecklistForm;