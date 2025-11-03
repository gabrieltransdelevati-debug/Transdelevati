export type VehicleModel = 'fiorino' | 'vuc';
export type ChecklistType = 'saida' | 'chegada';

export interface ChecklistSubmission {
  id: string;
  checklistType: ChecklistType;
  driverName: string;
  vehiclePlate: string;
  vehicleModel: VehicleModel | '';
  initialKm: number | '';
  fluidLevelsOk: boolean | null;
  lightsOk: boolean | null;
  emergencyItemsOk: boolean | null;
  roadworthy: boolean | null;
  observations: string;
  departureDate: string;
  departureTime: string;
  photoFront: string | null;
  photoRight: string | null;
  photoLeft: string | null;
  photoRear: string | null;
  photoOdometer: string | null;
  submissionTimestamp: string;
}