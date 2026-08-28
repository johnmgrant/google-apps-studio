export enum ContractPeriod {
  ThirtyDays = 30,
  SixtyDays = 60,
  NinetyDays = 90,
}

export interface FitnessContract {
  startDate: Date;
  durationMonths: ContractPeriod;
  terminationNoticeDays: ContractPeriod | number;
}
