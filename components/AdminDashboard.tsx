import React from 'react';
import type { ChecklistSubmission } from '../types';
import { Card } from './ui/Card';
import { CheckCircleIcon, XCircleIcon, CalendarIcon, ClockIcon, UserIcon, TagIcon, GaugeIcon, TripIcon } from './Icons';

type Trip = {
  saida: ChecklistSubmission | null;
  chegada: ChecklistSubmission | null;
  status: 'Completa' | 'Em Trânsito' | 'Chegada Avulsa';
  vehiclePlate: string;
  latestTimestamp: string;
};

const AdminDashboard: React.FC<{ submissions: ChecklistSubmission[] }> = ({ submissions }) => {
  const trips = React.useMemo(() => {
    const departures = submissions
      .filter(s => s.checklistType === 'saida')
      .sort((a, b) => new Date(a.submissionTimestamp).getTime() - new Date(b.submissionTimestamp).getTime());
    const arrivals = submissions
      .filter(s => s.checklistType === 'chegada')
      .sort((a, b) => new Date(a.submissionTimestamp).getTime() - new Date(b.submissionTimestamp).getTime());

    const pairedArrivalIds = new Set<string>();
    const tripList: Trip[] = [];

    departures.forEach(saida => {
      const bestMatch = arrivals.find(chegada =>
        !pairedArrivalIds.has(chegada.id) &&
        chegada.vehiclePlate === saida.vehiclePlate &&
        new Date(chegada.submissionTimestamp) > new Date(saida.submissionTimestamp)
      );

      if (bestMatch) {
        pairedArrivalIds.add(bestMatch.id);
        tripList.push({
          saida: saida,
          chegada: bestMatch,
          status: 'Completa',
          vehiclePlate: saida.vehiclePlate,
          latestTimestamp: bestMatch.submissionTimestamp,
        });
      } else {
        tripList.push({
          saida: saida,
          chegada: null,
          status: 'Em Trânsito',
          vehiclePlate: saida.vehiclePlate,
          latestTimestamp: saida.submissionTimestamp,
        });
      }
    });

    arrivals.forEach(chegada => {
      if (!pairedArrivalIds.has(chegada.id)) {
        tripList.push({
          saida: null,
          chegada: chegada,
          status: 'Chegada Avulsa',
          vehiclePlate: chegada.vehiclePlate,
          latestTimestamp: chegada.submissionTimestamp,
        });
      }
    });

    return tripList.sort((a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime());
  }, [submissions]);

  if (trips.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block bg-brand-blue-100 dark:bg-brand-blue-900/50 p-6 rounded-full">
            <TagIcon className="h-16 w-16 text-brand-blue-500" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-white">Nenhum checklist enviado</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Quando um motorista preencher um checklist, ele aparecerá aqui.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-8">Dashboard de Viagens</h2>
      <div className="space-y-8">
        {trips.map(trip => (
          <TripCard key={`${trip.vehiclePlate}-${trip.latestTimestamp}`} trip={trip} />
        ))}
      </div>
    </div>
  );
};

const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    const statusStyles = {
        'Completa': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'Em Trânsito': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'Chegada Avulsa': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };

    const distance = trip.status === 'Completa' && trip.saida && trip.chegada &&
        typeof trip.saida.initialKm === 'number' && typeof trip.chegada.initialKm === 'number'
        ? trip.chegada.initialKm - trip.saida.initialKm
        : null;

    return (
        <Card>
            <div className="border-b border-slate-200 dark:border-slate-700 pb-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className='flex items-center gap-4'>
                         <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <TripIcon className="h-7 w-7 text-slate-500 dark:text-slate-400" />
                         </div>
                         <div>
                            <p className="text-xl font-bold text-brand-blue-600 dark:text-brand-blue-400 uppercase">{trip.vehiclePlate}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{trip.saida?.vehicleModel || trip.chegada?.vehicleModel}</p>
                         </div>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                       <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[trip.status]}`}>{trip.status}</span>
                       {distance !== null && <p className="text-md font-semibold text-slate-700 dark:text-slate-200">{distance} km percorridos</p>}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <ChecklistDetails type="saida" submission={trip.saida} />
                <ChecklistDetails type="chegada" submission={trip.chegada} />
            </div>
        </Card>
    )
}

const ChecklistDetails: React.FC<{ type: 'saida' | 'chegada', submission: ChecklistSubmission | null }> = ({ type, submission }) => {
    const title = type === 'saida' ? 'Dados da Saída' : 'Dados da Chegada';
    if (!submission) {
        return (
            <div className='p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex items-center justify-center h-full'>
                <p className='text-slate-500 dark:text-slate-400'>Aguardando registro de {type}.</p>
            </div>
        );
    }

    const { driverName, initialKm, departureDate, departureTime, observations } = submission;

    const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
        <div className="flex items-start">
          <div className="flex-shrink-0 h-6 w-6 text-slate-400">{icon}</div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</p>
          </div>
        </div>
      );
      
    const CheckItem: React.FC<{ label: string; value: boolean | null }> = ({ label, value }) => (
    <li className="flex items-center justify-between py-1.5">
        <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
        {value ? 
        <span className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400"><CheckCircleIcon className="w-4 h-4 mr-1" /> Sim</span> :
        <span className="flex items-center text-sm font-semibold text-red-600 dark:text-red-400"><XCircleIcon className="w-4 h-4 mr-1" /> Não</span>
        }
    </li>
    );

    const photos = [
        { label: 'Frente', url: submission.photoFront },
        { label: 'Direita', url: submission.photoRight },
        { label: 'Esquerda', url: submission.photoLeft },
        { label: 'Traseira', url: submission.photoRear },
        { label: 'Hodômetro', url: submission.photoOdometer },
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{title}</h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem icon={<UserIcon />} label="Motorista" value={driverName} />
                    <DetailItem icon={<GaugeIcon />} label={type === 'saida' ? 'KM Inicial' : 'KM Final'} value={`${initialKm} km`} />
                    <DetailItem icon={<CalendarIcon />} label="Data" value={departureDate} />
                    <DetailItem icon={<ClockIcon />} label="Horário" value={departureTime} />
                </div>
                <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Itens Verificados</h4>
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        <CheckItem label="Fluidos" value={submission.fluidLevelsOk} />
                        <CheckItem label="Iluminação" value={submission.lightsOk} />
                        <CheckItem label="Itens de Emergência" value={submission.emergencyItemsOk} />
                        <CheckItem label="Condições de Rodagem" value={submission.roadworthy} />
                    </ul>
                </div>
                {observations && (
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                        <h4 className="text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">Observações</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 italic">"{observations}"</p>
                    </div>
                )}
                <div>
                    <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Fotos</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {photos.map((photo, index) => (
                            <div key={index}>
                                <div className="aspect-w-1 aspect-h-1">
                                    {photo.url ? (
                                        <img src={photo.url} alt={photo.label} className="w-full h-full object-cover rounded-md bg-slate-200 dark:bg-slate-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md text-slate-400">
                                            <span className="text-xs">Sem foto</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-center mt-1 text-slate-500 dark:text-slate-400">{photo.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard;