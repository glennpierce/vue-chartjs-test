import * as moment from 'moment';


export interface IRawDailyDataSumParam {
    meterType: string;
    startDate: moment.Moment;
    endDate: moment.Moment;
}

export interface EnergyDisplay {
    update(): void;
}

export interface TemporalEnergyDisplay extends EnergyDisplay {
    set_time_range(start_date: moment.Moment, end_date: moment.Moment): void;
}

export enum EnergyUnit {
    POWER = 0,
    COST = 1,
    CO2 = 2,
    LITRES = 3,
}

export interface AdjustableUnitDisplay extends EnergyDisplay {
    set_unit(type: EnergyUnit): void;
}

export enum MeterType {
    ELECTRICITY = 'used',
    HEAT = 'heat',
    WATER = 'water',
}

export interface AdjustableTypeDisplay extends EnergyDisplay {
    set_type(type: MeterType): void;
}
