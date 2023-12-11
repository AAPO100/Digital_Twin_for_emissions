import random
import simpy
import pandas as pd
import numpy as np
import emissions
from emissions import calculate_emissions
import matplotlib.pyplot as plt
import matplotlib.lines as mlines

NUM_LOADERS = 1
NUM_TRUCKS = 1
NUM_DRILLINGRIGS = 2
SIM_TIME = 480*60
Initial_soil=11
Distance =10
soilType = 'Clay'
Bucket_size=2
Truck_capacity=10
output = []
TruckBrand='Volvo'
LoaderType='Volvo Wheel Loader L350F'

def simulation(NUM_LOADERS,NUM_TRUCKS,NUM_DRILLINGRIGS,Initial_soil,SIM_TIME,Distance,soilType,Bucket_size,Truck_capacity,TruckBrand,LoaderType):

    if soilType == 'Clay':
        Drilling_time= 7
        soil_factor=1.5
    elif soilType == 'Sand':
        Drilling_time= 8
        soil_factor=1.5
    elif soilType == 'Gravel':
        Drilling_time= 10
        soil_factor=1.6
    elif soilType == 'Rock':
        Drilling_time= 14
        soil_factor=2.1
    else:
        Drilling_time= 10
        soil_factor=1.5

    
    haul_time=(Distance/50)*3600
    FILLING_TIME = int(random.gauss(9,2) )
    HAUL_TIME =int(random.uniform(haul_time,(haul_time-haul_time/10*2))) 
    LOADING_TIME=FILLING_TIME
    DRILLING_TIME=int(random.uniform(Drilling_time*60, ((Drilling_time+4)*60)))
    UNLOAD_TIME = int(random.gauss(60,10))
    IDLING_TIME_DRILLING_RIG=int(random.gauss(60,15))
    soil=Initial_soil
    env = simpy.Environment()
    trucks_queue_loading = simpy.Container(env, capacity=100, init=NUM_TRUCKS)
    trucks_queue_unloading = simpy.Container(env, capacity=100, init=NUM_TRUCKS)
    loaders_queue = simpy.Container(env, capacity=100, init=NUM_LOADERS)
    soil = simpy.Container(env,capacity= 1000,init= soil)

    # Simulation time in minutes

    trucks=[]
    drillingRigs=[]
    soil_left=[]
    soil_time=[]
    soil_transfered=[]
    time_transfered=[]
    time_transfered.append(0)
    soil_transfered.append(0)
    soil_left.append(soil.level)
    soil_time.append(round(env.now / 60, 2))

    class TruckState:
        IDLING = 'Idling'
        FILLING = 'Filling'
        HAULING = 'Hauling'
        UNLOADING = 'Unloading'
    class LoaderState:
        IDLING = 'Idling'
        LOADING = 'Loading'
    class DrillingRigState:
        IDLING = 'Idling'
        DRILLING = 'Drilling'

    class DrillingRig:
        def __init__(self,env,drillingRig_id):
            self.env = env
            self.drillingRig_id = drillingRig_id
            self.stateDr = DrillingRigState.IDLING
            self.idling_time = 0
            self.drilling_time = 0
            self.last_state_change_time = env.now
            self.activity_timesDr = {
                'Idling': 0,
                'Drilling': 0
            }
            self.Dr_state_list = []
            self.Dr_time_list = []

        def set_stateDr(self, new_state, current_time):
            if self.stateDr == DrillingRigState.IDLING:
                self.idling_time += current_time - self.last_state_change_time
                self.activity_timesDr['Idling'] += current_time - self.last_state_change_time
            elif self.stateDr == DrillingRigState.DRILLING:
                self.drilling_time += current_time - self.last_state_change_time
                self.activity_timesDr['Drilling'] += current_time - self.last_state_change_time
            self.Dr_state_list.append(self.stateDr)
            self.Dr_time_list.append(current_time - self.last_state_change_time)

            self.stateDr = new_state
            self.last_state_change_time = self.env.now
            self.activity_timesDr[self.stateDr] += current_time - self.last_state_change_time

        def drilling(self,env,drillingRig_id,stockpile):
            while soil.level > 0:
                print(f' {drillingRig_id} drills at {env.now/60:.2f} min')
                output.append(f' {drillingRig_id} drills at {env.now/60:.2f} min')
                self.set_stateDr(DrillingRigState.DRILLING, env.now) 
                yield env.timeout(DRILLING_TIME)
                soil.put((random.gauss(2,0.5)))
                soil_left.append(soil.level)
                soil_time.append(round(env.now / 60, 2))
                self.set_stateDr(DrillingRigState.IDLING, env.now)
                yield env.timeout(int(random.uniform(2*60, 1*60)))
                
    global_Lo_state_list = []
    global_Lo_time_list = []

    class Truck:
        def __init__(self, env, Truck_id,loader_id):
            self.env = env
            self.Truck_id = Truck_id
            self.loader_id = loader_id
            self.activity_timesTr = {
                'Idling': 0,
                'Filling': 0,
                'Hauling': 0,
                'Unloading': 0
            }
            self.activity_timesLo = {
                'Idling': 0,
                'Loading': 0
            }
            self.stateTr = TruckState.IDLING
            self.idling_time = 0
            self.filling_time = 0
            self.hauling_time = 0
            self.unloading_time = 0
            self.last_state_change_timeTr = env.now 
            self.stateLo = LoaderState.IDLING
            self.idling_time = 0
            self.loading_time = 0
            self.last_state_change_timeLo = env.now 
            self.Lo_state_list = []
            self.Lo_time_list = []   
            self.Tr_state_list = []
            self.Tr_time_list = []

        def set_stateTr(self, new_state, current_time):
            if self.stateTr == TruckState.IDLING:
                self.idling_time += current_time - self.last_state_change_timeTr
                self.activity_timesTr['Idling'] += current_time - self.last_state_change_timeTr
            elif self.stateTr == TruckState.FILLING:
                self.filling_time += current_time - self.last_state_change_timeTr
                self.activity_timesTr['Filling'] += current_time - self.last_state_change_timeTr
            elif self.stateTr == TruckState.HAULING:
                self.hauling_time += current_time - self.last_state_change_timeTr
                self.activity_timesTr['Hauling'] += current_time - self.last_state_change_timeTr
            elif self.stateTr == TruckState.UNLOADING:
                self.unloading_time += current_time - self.last_state_change_timeTr
                self.activity_timesTr['Unloading'] += current_time - self.last_state_change_timeTr
            elif self.stateTr == TruckState.HAULING:
                self.hauling_time += current_time - self.last_state_change_timeTr
                self.activity_timesTr['Hauling'] += current_time - self.last_state_change_timeTr

            self.Tr_state_list.append(self.stateTr)
            self.Tr_time_list.append(current_time - self.last_state_change_timeTr)

            self.stateTr = new_state
            self.last_state_change_timeTr = self.env.now
            self.activity_timesTr[self.stateTr] += current_time - self.last_state_change_timeTr

        def set_stateLo(self, new_state, current_time,loader_id):
            if self.stateLo == LoaderState.IDLING:
                    self.activity_timesLo['Idling'] += current_time - self.last_state_change_timeLo
                    self.activity_timesLo['Idling'] += current_time - self.last_state_change_timeLo
            elif self.stateLo == LoaderState.LOADING:
                    self.activity_timesLo['Loading'] += current_time - self.last_state_change_timeLo
                    self.activity_timesLo['Loading'] += current_time - self.last_state_change_timeLo

            self.Lo_state_list.append(self.stateLo)
            self.Lo_time_list.append(current_time - self.last_state_change_timeLo)

            # global_Lo_state_list.append(self.stateLo)
            # global_Lo_time_list.append(env.now)

            self.stateLo = new_state
            self.last_state_change_timeLo = self.env.now 
            self.activity_timesLo[self.stateLo] += current_time - self.last_state_change_timeLo

            # global_Lo_state_list[0]='Idling'



        def get_Lo_state_list(self):
            return self.Lo_state_list
        
        def get_Lo_time_list(self):
            return self.Lo_time_list

        def truck(self,env, Truck_id, stockpile):
            while True:
                if env.now < SIM_TIME:
                     while soil.level > 0:
                # print(f' {Truck_id} is at the stockpile at {env.now /60:.2f} min')
                # self.set_stateTr(TruckState.IDLING, env.now) 
                # output.append(f' {Truck_id} is at the stockpile at {env.now /60:.2f} min')
                        if soil.level >= 10:
                            yield env.timeout(FILLING_TIME)
                            soil.get(Truck_capacity/soil_factor)
                            with stockpile.loaders.request() as request:
                                yield request
                                with stockpile.trucks.request() as request:
                                    yield request
                                    a=loaders_queue.level
                                    b=NUM_LOADERS-a
                                    loader_id = b+1
                                    self.set_stateTr(TruckState.IDLING, env.now)
                                    trucks_queue_loading.get(1)
                                    loaders_queue.get(1)
                                    self.set_stateTr(TruckState.FILLING, env.now)
                                    self.set_stateLo(LoaderState.LOADING, env.now,loader_id)
                                    global_Lo_state_list.append(self.stateLo)
                                    global_Lo_time_list.append(env.now)
                                    yield env.process(stockpile.fill_truck(Truck_id,loader_id))
                                    self.set_stateTr(TruckState.HAULING, env.now)
                                    self.set_stateLo(LoaderState.IDLING, env.now,loader_id)
                                    loaders_queue.put(1)
                                    global_Lo_state_list.append(self.stateLo)
                                    global_Lo_time_list.append(env.now)
                                    yield env.process(stockpile.haul_soil_going(Truck_id))
                                    trucks_queue_unloading.put(1)
                                    self.set_stateTr(TruckState.UNLOADING, env.now)
                                    yield env.process(stockpile.Unloading(Truck_id))
                                    global_Lo_state_list.append(self.stateLo)
                                    global_Lo_time_list.append(env.now)
                                    self.set_stateTr(TruckState.HAULING, env.now)
                                    yield env.process(stockpile.haul_returning(Truck_id))
                                    global_Lo_state_list.append(self.stateLo)
                                    global_Lo_time_list.append(env.now)
                                    trucks_queue_loading.put(1)
                                    self.set_stateTr(TruckState.IDLING, env.now) 
                                    global_Lo_state_list.append(self.stateLo)
                                    global_Lo_time_list.append(env.now)
                        else:
                            if trucks_queue_loading.level > 0:
                                print( trucks_queue_loading.level)
                                self.set_stateTr(TruckState.IDLING, env.now) 
                                global_Lo_state_list.append(self.stateLo)
                                global_Lo_time_list.append(env.now)
                                yield env.timeout(30)
                else:
                    break

    class Stockpile(object):
        def __init__(self, env, num_loaders, filling_time, haul_time,unload_time,loading_time):
            self.env = env
            self.loaders = simpy.Resource(env, num_loaders)
            self.trucks = simpy.Resource(env, NUM_TRUCKS)
            self.filling_time = (Truck_capacity//Bucket_size)*filling_time
            self.haul_time = haul_time
            self.unloading_time = unload_time
            self.loading_time = loading_time

        def fill_truck(self, Truck_id,loader_id):
            print(f'Filling  {Truck_id} started at {env.now /60:.2f} min by Loader {loader_id}')
            output.append(f'Filling  {Truck_id} started at {env.now /60:.2f} min by Loader {loader_id}')
            yield env.timeout(self.filling_time)
            soil_left.append(soil.level)
            soil_time.append(round(env.now / 60, 2))
            print(f' {Truck_id} filled in at {env.now /60:.2f} min by Loader {loader_id} and starts hauling ')
            output.append(f' {Truck_id} filled in at {env.now /60:.2f} min by Loader {loader_id} and starts hauling ')

        def haul_soil_going(self, Truck_id):
            yield env.timeout(self.haul_time//2)

        def haul_returning(self, Truck_id):
            print(f' {Truck_id} unloaded at {env.now /60:.2f} min')
            output.append(f' {Truck_id} unloaded at {env.now /60:.2f} min')
            yield env.timeout(self.haul_time//2)
            print(f' {Truck_id} arrived at stockpile at {env.now /60:.2f} min')
            output.append(f' {Truck_id} arrived at stockpile at {env.now /60:.2f} min')
        def Unloading(self, Truck_id):
            print(f' {Truck_id} unloading started at {env.now /60:.2f} min')
            output.append(f' {Truck_id} unloading started at {env.now /60:.2f} min')
            yield env.timeout(self.unloading_time)
            time_transfered.append(round(env.now / 60, 2))
            soil_transfered.append(Truck_capacity/soil_factor)

        def loading_soil(self, drillingRig_id):
            print(f' {drillingRig_id} drill started at {env.now /60:.2f} min')
            output.append(f' {drillingRig_id} drill started at {env.now /60:.2f} min')
            yield env.timeout(self.loading_time)
            soil.put(Bucket_size)
            soil_left.append(soil.level)
            soil_time.append(round(env.now / 60, 2))

            print(f' {drillingRig_id} finished with drilling at {env.now /60:.2f} min')
            output.append(f' {drillingRig_id} finished with drilling at {env.now /60:.2f} min')

    def setup(env, num_loaders, num_trucks,num_drillingRigs, filling_time, haul_time,unload_time,loading_time):
        stockpile = Stockpile(env, num_loaders, filling_time, haul_time,unload_time,loading_time)
        for i in range(num_trucks):
            trucks.append(Truck(env,Truck_id=i+1,loader_id=i-num_loaders))
            env.process(trucks[i].truck(env, 'Truck %d' % i, stockpile))
        for i in range(num_drillingRigs):
            drillingRigs.append(DrillingRig(env,drillingRig_id=i+1))
            env.process(drillingRigs[i].drilling(env, 'DrillingRig %d' % i, stockpile))
    print('Stockpile Simulation')
    setup(env, NUM_LOADERS, NUM_TRUCKS,NUM_DRILLINGRIGS, FILLING_TIME, HAUL_TIME,UNLOAD_TIME,LOADING_TIME)
    env.run(until=SIM_TIME )
    print(f'The reamaining soil is {soil.level} m3')

    truck_df_data = {
        'Truck ID': [],
        'Idling Time (mins)': [],
        'Filling Time (mins)': [],
        'Hauling Time (mins)': [],
        'Unloading Time (mins)': [],
        'Tr_NOx_Idling [kg/kwh]':[],
        'Tr_NOx_Filling [kg/kwh]':[],
        'Tr_NOx_Hauling [kg/kwh]':[],
        'Tr_NOx_Unloading [kg/kwh]':[],
        'Tr_CO2_Idling [kg]':[],
        'Tr_CO2_Filling [kg]':[],
        'Tr_CO2_Hauling [kg]':[],
        'Tr_CO2_Unloading [kg]':[],
        'Tr_Fuel_Idling [kg]':[],
        'Tr_Fuel_Filling [kg]':[],
        'Tr_Fuel_Hauling [kg]':[],
        'Tr_Fuel_Unloading [kg]':[]

    }

    truck_emissions_over_time = {
        'Truck ID': [],
        'Time (mins)': [],
        'Activity': []
    }

    drilling_rig_emissions_over_time = {
        'Drilling Rig ID': [],
        'Time (mins)': [],
        'Activity': []
    }

    for truck in trucks:
        truck_df_data['Truck ID'].append(truck.Truck_id)
        truck_df_data['Idling Time (mins)'].append(truck.activity_timesTr['Idling'])
        truck_df_data['Filling Time (mins)'].append(truck.activity_timesTr['Filling'])
        truck_df_data['Hauling Time (mins)'].append(truck.activity_timesTr['Hauling'])
        truck_df_data['Unloading Time (mins)'].append(truck.activity_timesTr['Unloading'])

    for i in range (NUM_TRUCKS):
        truck_emissions_over_time['Truck ID'].append((trucks[i].Truck_id))
        truck_emissions_over_time['Time (mins)'].append(trucks[i].Tr_time_list)
        truck_emissions_over_time['Activity'].append(trucks[i].Tr_state_list)

    Truck_emissions_data = {
        'Volvo': {
            'Tr_NOx_Idling': emissions.Tr_NOx_Idling_Volvo,
            'Tr_NOx_Driving': emissions.Tr_NOx_Driving_Volvo,
            'Tr_CO2_Idling': emissions.Tr_CO2_Idling_Volvo,
            'Tr_CO2_Driving': emissions.Tr_CO2_Driving_Volvo,
            'Tr_Fuel_Idling': emissions.Tr_Fuel_Idling_Volvo,
            'Tr_Fuel_Driving': emissions.Tr_Fuel_Driving_Volvo
        },
        'Isuzu': {
            'Tr_NOx_Idling': emissions.Tr_NOx_Idling_Isuzu,
            'Tr_NOx_Driving': emissions.Tr_NOx_Driving_Isuzu,
            'Tr_CO2_Idling': emissions.Tr_CO2_Idling_Isuzu,
            'Tr_CO2_Driving': emissions.Tr_CO2_Driving_Isuzu,
            'Tr_Fuel_Idling': emissions.Tr_Fuel_Idling_Isuzu,
            'Tr_Fuel_Driving': emissions.Tr_Fuel_Driving_Isuzu
        }
    }

    Loader_emissions_data = {
        'Caterpillar Excavator 325F': {
            'Lo_NOx_Idling': emissions.Lo_NOx_Idling_Excavator,
            'Lo_NOx_Loading': emissions.Lo_NOx_Loading_Excavator,
            'Lo_CO2_Idling': emissions.Lo_CO2_Idling_Excavator,
            'Lo_CO2_Loading': emissions.Lo_CO2_Loading_Excavator,
            'Lo_Fuel_Idling': emissions.Lo_Fuel_Idling_Excavator,
            'Lo_Fuel_Loading': emissions.Lo_Fuel_Loading_Excavator
        },
        'Volvo Wheel Loader L350F': {
            'Lo_NOx_Idling': emissions.Lo_NOx_Idling_WheelLoader,
            'Lo_NOx_Loading': emissions.Lo_NOx_Loading_WheelLoader,
            'Lo_CO2_Idling': emissions.Lo_CO2_Idling_WheelLoader,
            'Lo_CO2_Loading': emissions.Lo_CO2_Loading_WheelLoader,
            'Lo_Fuel_Idling': emissions.Lo_Fuel_Idling_WheelLoader,
            'Lo_Fuel_Loading': emissions.Lo_Fuel_Loading_WheelLoader
        }
    }
    truck_brand_data = Truck_emissions_data.get(TruckBrand, {})
    loader_type_data = Loader_emissions_data.get(LoaderType, {})
    if not truck_brand_data:
     print(f"Unknown TruckBrand: {TruckBrand}")
    if not loader_type_data:
     print(f"Unknown LoaderType: {LoaderType}")
    for i in range(NUM_TRUCKS):
        Tr_NOx_Idling =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_NOx_Idling', 0), truck_df_data['Idling Time (mins)'][i])/1000
        Tr_NOx_Filling =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_NOx_Idling', 0), truck_df_data['Filling Time (mins)'][i])/1000
        Tr_NOx_Hauling =calculate_emissions(emissions.Tr_probability_Driving,truck_brand_data.get('Tr_NOx_Driving', 0), truck_df_data['Hauling Time (mins)'][i])/1000
        Tr_NOx_Unloading =calculate_emissions(emissions.Tr_probability_Idling,truck_brand_data.get('Tr_NOx_Idling', 0), truck_df_data['Unloading Time (mins)'][i])/1000
        Tr_CO2_Idling  =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_CO2_Idling', 0), truck_df_data['Idling Time (mins)'][i])/1000
        Tr_CO2_Filling =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_CO2_Idling', 0), truck_df_data['Filling Time (mins)'][i])/1000
        Tr_CO2_Hauling =calculate_emissions(emissions.Tr_probability_Driving, truck_brand_data.get('Tr_CO2_Driving', 0), truck_df_data['Hauling Time (mins)'][i])/1000
        Tr_CO2_Unloading =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_CO2_Idling', 0), truck_df_data['Unloading Time (mins)'][i])/1000
        Tr_Fuel_Idling =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_Fuel_Idling', 0), truck_df_data['Idling Time (mins)'][i])/1000
        Tr_Fuel_Filling =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_Fuel_Idling', 0), truck_df_data['Filling Time (mins)'][i])/1000
        Tr_Fuel_Hauling=calculate_emissions(emissions.Tr_probability_Driving, truck_brand_data.get('Tr_Fuel_Driving', 0), truck_df_data['Hauling Time (mins)'][i])/1000
        Tr_Fuel_Unloading =calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_Fuel_Idling', 0), truck_df_data['Unloading Time (mins)'][i])/1000

        truck_df_data['Tr_NOx_Idling [kg/kwh]'].append(Tr_NOx_Idling)
        truck_df_data['Tr_NOx_Filling [kg/kwh]'].append(Tr_NOx_Filling)
        truck_df_data['Tr_NOx_Hauling [kg/kwh]'].append(Tr_NOx_Hauling)
        truck_df_data['Tr_NOx_Unloading [kg/kwh]'].append(Tr_NOx_Unloading)
        truck_df_data['Tr_CO2_Idling [kg]'].append(Tr_CO2_Idling)
        truck_df_data['Tr_CO2_Filling [kg]'].append(Tr_CO2_Filling)
        truck_df_data['Tr_CO2_Hauling [kg]'].append(Tr_CO2_Hauling)
        truck_df_data['Tr_CO2_Unloading [kg]'].append(Tr_CO2_Unloading)
        truck_df_data['Tr_Fuel_Idling [kg]'].append(Tr_Fuel_Idling)
        truck_df_data['Tr_Fuel_Filling [kg]'].append(Tr_Fuel_Filling)
        truck_df_data['Tr_Fuel_Hauling [kg]'].append(Tr_Fuel_Hauling)
        truck_df_data['Tr_Fuel_Unloading [kg]'].append(Tr_Fuel_Unloading)
    truck_df = pd.DataFrame(truck_df_data)
    # print(truck_emissions_over_time)
    truck_df['Idling Time (mins)']= truck_df['Idling Time (mins)'] /60
    truck_df['Filling Time (mins)']=truck_df['Filling Time (mins)']/60
    truck_df['Hauling Time (mins)']=truck_df['Hauling Time (mins)']/60
    truck_df['Unloading Time (mins)']=truck_df['Unloading Time (mins)']/60
    sum_NOx_valuesTr = []  
    sum_CO2_valuesTr = []
    sum_fuel_valuesTr = []  

    # Iterate over each truck
    for i in range(NUM_TRUCKS):
        sum_NOx = truck_df_data['Tr_NOx_Idling [kg/kwh]'][i] + truck_df_data['Tr_NOx_Filling [kg/kwh]'][i] + truck_df_data['Tr_NOx_Hauling [kg/kwh]'][i]+ truck_df_data['Tr_NOx_Unloading [kg/kwh]'][i]
        sum_CO2=truck_df_data['Tr_CO2_Idling [kg]'][i] + truck_df_data['Tr_CO2_Filling [kg]'][i] + truck_df_data['Tr_CO2_Hauling [kg]'][i] + truck_df_data['Tr_CO2_Unloading [kg]'][i]
        sum_fuel=truck_df_data['Tr_Fuel_Idling [kg]'][i] + truck_df_data['Tr_Fuel_Filling [kg]'][i] + truck_df_data['Tr_Fuel_Hauling [kg]'][i] + truck_df_data['Tr_Fuel_Unloading [kg]'][i]
        sum_NOx_valuesTr.append(sum_NOx)
        sum_CO2_valuesTr.append(sum_CO2)
        sum_fuel_valuesTr.append(sum_fuel)
    truck_df_data['SumNOx [g/kwh]'] = sum_NOx_valuesTr
    truck_df_data['SumCO2 [kg]'] = sum_CO2_valuesTr
    truck_df_data['SumFuel [kg]'] = sum_fuel_valuesTr
    truck_df['SumNOx [g/kwh]'] = sum_NOx_valuesTr
    truck_df['SumCO2 [kg]'] = sum_CO2_valuesTr
    truck_df['SumFuel [kg]'] = sum_fuel_valuesTr

    Loader_Loading=sum(truck_df_data['Filling Time (mins)'])
    Loader_Idling=(SIM_TIME-Loader_Loading)
    Lo_NOx_Loading = calculate_emissions(emissions.Lo_probability_Loading, loader_type_data.get('Lo_NOx_Loading',0), Loader_Loading)/1000*NUM_LOADERS*NUM_LOADERS
    Lo_NOx_Idling = calculate_emissions(emissions.Lo_probability_Idling, loader_type_data.get('Lo_NOx_Idling',0), Loader_Idling)/1000*NUM_LOADERS
    Lo_CO2_Loading = calculate_emissions(emissions.Lo_probability_Loading, loader_type_data.get('Lo_CO2_Loading',0), Loader_Loading)/1000*NUM_LOADERS
    Lo_CO2_Idling = calculate_emissions(emissions.Lo_probability_Idling,loader_type_data.get('Lo_CO2_Idling',0), Loader_Idling)/1000*NUM_LOADERS
    Lo_Fuel_Loading = calculate_emissions(emissions.Lo_probability_Loading, loader_type_data.get('Lo_Fuel_Loading',0), Loader_Loading)/1000*NUM_LOADERS
    Lo_Fuel_Idling = calculate_emissions(emissions.Lo_probability_Idling, loader_type_data.get('Lo_Fuel_Idling',0), Loader_Idling)/1000*NUM_LOADERS
    loader_df_data = {
        'Category': ['Idling', 'Loading', 'SUM'],
        'Time (mins)': [Loader_Idling, Loader_Loading,Loader_Idling+Loader_Loading],
        'Lo_NOx [g/kWh]':[Lo_NOx_Idling,Lo_NOx_Loading,(Lo_NOx_Idling+Lo_NOx_Loading)],
        'Lo_CO2 [kg]':[Lo_CO2_Idling,Lo_CO2_Loading,(Lo_CO2_Idling+Lo_CO2_Loading)],
        'Lo_Fuel [kg]':[Lo_Fuel_Idling,Lo_Fuel_Loading,(Lo_Fuel_Idling+Lo_Fuel_Loading)],
    }
    loader_df = pd.DataFrame(loader_df_data)
    loader_df['Time (mins)']= loader_df['Time (mins)'] /60


    DrillingRig_df_data = {
        'Drilling Rig ID': [],
        'Idling Time (mins)': [],
        'Drilling Time (mins)': [],
        'Dr_NOx_Idling [g/kWh]':[],
        'Dr_NOx_Drilling [g/kWh]':[],
        'Dr_CO2_Idling [kg]':[],
        'Dr_CO2_Drilling [kg]':[],
        'Dr_Fuel_Idling [kg]':[],
        'Dr_Fuel_Drilling [kg]':[],
    }


    for i in drillingRigs:
        DrillingRig_df_data['Drilling Rig ID'].append(i.drillingRig_id)
        DrillingRig_df_data['Idling Time (mins)'].append(i.activity_timesDr['Idling'])
        DrillingRig_df_data['Drilling Time (mins)'].append(i.activity_timesDr['Drilling'])

    for i in range(NUM_DRILLINGRIGS):
        Dr_NOx_Idling = calculate_emissions(emissions.Dr_probability_Idling, emissions.Dr_NOx_Idling, DrillingRig_df_data['Idling Time (mins)'][i])/1000
        Dr_NOx_Drilling = calculate_emissions(emissions.Dr_probability_Drilling, emissions.Dr_NOx_Drilling, DrillingRig_df_data['Drilling Time (mins)'][i])/1000
        Dr_CO2_Idling = calculate_emissions(emissions.Dr_probability_Idling, emissions.Dr_CO2_Idling, DrillingRig_df_data['Idling Time (mins)'][i])/1000
        Dr_CO2_Drilling = calculate_emissions(emissions.Dr_probability_Drilling, emissions.Dr_CO2_Drilling, DrillingRig_df_data['Drilling Time (mins)'][i])/1000
        Dr_Fuel_Idling = calculate_emissions(emissions.Dr_probability_Idling, emissions.Dr_Fuel_Idling, DrillingRig_df_data['Idling Time (mins)'][i])/1000
        Dr_Fuel_Drilling = calculate_emissions(emissions.Dr_probability_Drilling, emissions.Dr_Fuel_Drilling, DrillingRig_df_data['Drilling Time (mins)'][i])/1000
        DrillingRig_df_data['Dr_NOx_Idling [g/kWh]'].append(Dr_NOx_Idling)
        DrillingRig_df_data['Dr_NOx_Drilling [g/kWh]'].append(Dr_NOx_Drilling)
        DrillingRig_df_data['Dr_CO2_Idling [kg]'].append(Dr_CO2_Idling)
        DrillingRig_df_data['Dr_CO2_Drilling [kg]'].append(Dr_CO2_Drilling)
        DrillingRig_df_data['Dr_Fuel_Idling [kg]'].append(Dr_Fuel_Idling)
        DrillingRig_df_data['Dr_Fuel_Drilling [kg]'].append(Dr_Fuel_Drilling)
    sum_NOx_valuesDr = []  
    sum_CO2_valuesDr = []
    sum_fuel_valuesDr = []  

    for i in range(NUM_DRILLINGRIGS):
        sum_NOx = DrillingRig_df_data['Dr_NOx_Idling [g/kWh]'][i] + DrillingRig_df_data['Dr_NOx_Drilling [g/kWh]'][i] 
        sum_CO2=DrillingRig_df_data['Dr_CO2_Idling [kg]'][i] + DrillingRig_df_data['Dr_CO2_Drilling [kg]'][i]
        sum_fuel=DrillingRig_df_data['Dr_Fuel_Idling [kg]'][i] + DrillingRig_df_data['Dr_Fuel_Drilling [kg]'][i]
        sum_NOx_valuesDr.append(sum_NOx)
        sum_CO2_valuesDr.append(sum_CO2)
        sum_fuel_valuesDr.append(sum_fuel)

    DrillingRig_df_data['SumNOx [g/kwh]'] = sum_NOx_valuesDr
    DrillingRig_df_data['SumCO2 [kg]'] = sum_CO2_valuesDr
    DrillingRig_df_data['SumFuel [kg]'] = sum_fuel_valuesDr
    DrillingRig_df = pd.DataFrame(DrillingRig_df_data)
    DrillingRig_df['Idling Time (mins)']=DrillingRig_df['Idling Time (mins)']/60
    DrillingRig_df['Drilling Time (mins)']=DrillingRig_df['Drilling Time (mins)']/60
    DrillingRig_df['SumNOx [g/kwh]'] = sum_NOx_valuesDr
    DrillingRig_df['SumCO2 [kg]'] = sum_CO2_valuesDr
    DrillingRig_df['SumFuel [kg]'] = sum_fuel_valuesDr

    print(DrillingRig_df)
    print(loader_df)
    print(truck_df)

    sum_Nox_drillingRig = DrillingRig_df['SumNOx [g/kwh]'].sum()
    sum_Nox_loader = loader_df['Lo_NOx [g/kWh]'][2]
    sum_Nox_truck = truck_df['SumNOx [g/kwh]'].sum()
    sum_CO2_drillingRig = DrillingRig_df['SumCO2 [kg]'].sum()
    sum_CO2_loader = loader_df['Lo_CO2 [kg]'][2]
    sum_CO2_truck = truck_df['SumCO2 [kg]'].sum()
    sum_fuel_drillingRig = DrillingRig_df['SumFuel [kg]'].sum()
    sum_fuel_loader = loader_df['Lo_Fuel [kg]'][2]
    sum_fuel_truck = truck_df['SumFuel [kg]'].sum()



    emissions_df_data = {
        'Machine': ['Drilling Rig', 'Loader', 'Truck'],
        'NOx [g/kwh]': [round(sum_Nox_drillingRig, 2), round(sum_Nox_loader, 2), round(sum_Nox_truck, 2)],
        'CO2 [kg]': [round(sum_CO2_drillingRig, 2), round(sum_CO2_loader, 2), round(sum_CO2_truck, 2)],
        'Fuel [kg]': [round(sum_fuel_drillingRig, 2), round(sum_fuel_loader, 2), round(sum_fuel_truck, 2)]
    }

    # Calculate the total sums
    total_sum_NOx = format(sum(emissions_df_data['NOx [g/kwh]']), '.2f')
    total_sum_CO2 = format(sum(emissions_df_data['CO2 [kg]']), '.2f')
    total_sum_fuel = format(sum(emissions_df_data['Fuel [kg]']), '.2f')

    # Add the 'SUM' row to the emissions data
    emissions_df_data['Machine'].append('SUM')
    emissions_df_data['NOx [g/kwh]'].append(total_sum_NOx)
    emissions_df_data['CO2 [kg]'].append(total_sum_CO2)
    emissions_df_data['Fuel [kg]'].append(total_sum_fuel)
    soil_level_value = format(soil.level, '.2f')
    emissions_df_data['Soil level [m3]']=soil_level_value

    # Create the DataFrame
    emissions_df = pd.DataFrame(emissions_df_data)
    print(emissions_df)
    plt.style.use('_mpl-gallery')
    
    # make data
    # time = time_transfered
    # soil = np.cumsum(soil_transfered).tolist()
    # fig, ax = plt.subplots(figsize=(8, 6))
    # plt.subplots_adjust(left=0.1, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
    # ax.plot(time, soil, marker='o', linestyle='-', color='b')
    # ax.set_xlabel("Time (minutes)", fontsize=14)
    # ax.set_ylabel("Soil transfered [m3]", fontsize=14)
    # ax.set_title("Soil transferred from the construction site", fontsize=16)
    # ax.grid(True)
    # fig.savefig('soil_transfered.png',dpi=300)

    def emissions_over_time():
        sum_NOx_truck = [0] * len(trucks[0].Tr_time_list)
        sum_CO2_truck = [0] * len(trucks[0].Tr_time_list)
        sum_Fuel_truck = [0] * len(trucks[0].Tr_time_list)
        for i in range(NUM_TRUCKS):
            truck = trucks[i] 
            truck_emissions_over_time['Time (mins)'].append((trucks[i].Tr_time_list))
            truck_emissions_over_time['Truck ID'].append((trucks[i].Truck_id))
            truck_emissions_over_time['Activity'].append((trucks[i].Tr_state_list))
            # print(truck, truck.Tr_time_list, truck.Tr_state_list)
            truck_emissions_over_time[i] = {
                'NOx [kg/kWh]': [],
                'CO2 [kg]': [],
                'Fuel [kg]': []
            }
            for j in range(len(truck.Tr_state_list)):
                if truck.Tr_state_list[j] == 'Idling' :
                    truck_emissions_over_time[i]['NOx [kg/kWh]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_NOx_Idling', 0), truck.Tr_time_list[j])/1000))
                    truck_emissions_over_time[i]['CO2 [kg]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_CO2_Idling', 0), truck.Tr_time_list[j])/1000))
                    truck_emissions_over_time[i]['Fuel [kg]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_Fuel_Idling', 0), truck.Tr_time_list[j])/1000))
                elif truck.Tr_state_list[j] == 'Filling':
                    truck_emissions_over_time[i]['NOx [kg/kWh]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_NOx_Idling', 0), truck.Tr_time_list[j])/1000))
                    truck_emissions_over_time[i]['CO2 [kg]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_CO2_Idling', 0), truck.Tr_time_list[j])/1000))
                    truck_emissions_over_time[i]['Fuel [kg]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_Fuel_Idling', 0), truck.Tr_time_list[j])/1000))
                elif truck.Tr_state_list[j] == 'Unloading':
                    truck_emissions_over_time[i]['NOx [kg/kWh]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_NOx_Idling', 0), truck.Tr_time_list[j])/1000))
                    truck_emissions_over_time[i]['CO2 [kg]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_CO2_Idling', 0), truck.Tr_time_list[j])/1000))
                    truck_emissions_over_time[i]['Fuel [kg]'].append((calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_Fuel_Idling', 0), truck.Tr_time_list[j])/1000))
                elif truck.Tr_state_list[j] == 'Hauling':
                    truck_emissions_over_time[i]['NOx [kg/kWh]'].append(calculate_emissions(emissions.Tr_probability_Driving,truck_brand_data.get('Tr_NOx_Driving', 0), truck.Tr_time_list[j])/1000)
                    truck_emissions_over_time[i]['CO2 [kg]'].append(calculate_emissions(emissions.Tr_probability_Driving, truck_brand_data.get('Tr_CO2_Driving', 0), truck.Tr_time_list[j])/1000)
                    truck_emissions_over_time[i]['Fuel [kg]'].append(calculate_emissions(emissions.Tr_probability_Driving, truck_brand_data.get('Tr_Fuel_Driving', 0), truck.Tr_time_list[j])/1000)
            if i > 0:
                truck_emissions_over_time[i]['NOx [kg/kWh]'].insert(0, 0)
                truck_emissions_over_time[i]['CO2 [kg]'].insert(0, 0)
                truck_emissions_over_time[i]['Fuel [kg]'].insert(0, 0)
                truck_emissions_over_time['Activity'][i].insert(0, 'Idling')
                truck_emissions_over_time['Time (mins)'][i].insert(0, 0)
            # elif i == 0:
            #     first_truck_total_time = np.sum(trucks[0].Tr_time_list)
            #     last_value = SIM_TIME - first_truck_total_time                
            #     print(last_value,'lastvalue')
            #     truck_emissions_over_time[i]['NOx [kg/kWh]'].insert(-1, (calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_NOx_Idling', 0), last_value)/1000))
            #     truck_emissions_over_time[i]['CO2 [kg]'].insert(-1, (calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_CO2_Idling', 0), last_value)/1000))
            #     truck_emissions_over_time[i]['Fuel [kg]'].insert(-1,(calculate_emissions(emissions.Tr_probability_Idling, truck_brand_data.get('Tr_Fuel_Idling', 0), last_value)/1000))
            #     truck_emissions_over_time['Activity'][i].insert(-1, 'Idling')
            #     truck_emissions_over_time['Time (mins)'][i].insert(-1, last_value)

            time_trucks = [t/60 for t in np.cumsum(truck.Tr_time_list).tolist()]
            NOxTruck  = np.cumsum(truck_emissions_over_time[i]['NOx [kg/kWh]'])
            CO2Truck = np.cumsum(truck_emissions_over_time[i]['CO2 [kg]'])
            FuelTruck = np.cumsum(truck_emissions_over_time[i]['Fuel [kg]'])
            fig, ax = plt.subplots(figsize=(8, 6))
            plt.subplots_adjust(left=0.1, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
            ax.plot(time_trucks, NOxTruck, marker='o', linestyle='-', color='b', label='NOx [kg/kWh]')
            ax.plot(time_trucks, CO2Truck, marker='o', linestyle='-', color='r', label='CO2 [kg]')
            ax.plot(time_trucks, FuelTruck, marker='o', linestyle='-', color='y', label='Fuel [kg]')

            ax.set_xlabel("Time (minutes)", fontsize=14)
            ax.set_ylabel("metrics", fontsize=14)
            ax.set_title(f"Emissions from Truck {i+1}", fontsize=16)
            ax.grid(True)
            ax.legend()
            plt.savefig(f"emissions_truck_{i+1}.png")  # Save the figure
            plt.close(fig)
            sum_NOx_truck=[]
            sum_CO2_truck=[]
            sum_Fuel_truck=[]
        for i in range(NUM_TRUCKS):
            sum_NOx_truck.append(truck_emissions_over_time[i]['NOx [kg/kWh]'])
            sum_CO2_truck.append(truck_emissions_over_time[i]['CO2 [kg]'])
            sum_Fuel_truck.append(truck_emissions_over_time[i]['Fuel [kg]'])    

        sum_NOx_truck = [sum(x) for x in zip(*sum_NOx_truck, truck_emissions_over_time[i]['NOx [kg/kWh]'])]
        sum_CO2_truck = [sum(x) for x in zip(*sum_CO2_truck, truck_emissions_over_time[i]['CO2 [kg]'])]
        sum_Fuel_truck = [sum(x) for x in zip(*sum_Fuel_truck, truck_emissions_over_time[i]['Fuel [kg]'])]
        cumulative_sum_NOx_truck = np.cumsum(sum_NOx_truck).tolist()
        cumulative_sum_CO2_truck = np.cumsum(sum_CO2_truck).tolist()
        cumulative_sum_Fuel_truck = np.cumsum(sum_Fuel_truck).tolist()


        for i in range(NUM_DRILLINGRIGS):
            drillingRig = drillingRigs[i]  
            drilling_rig_emissions_over_time['Drilling Rig ID'].append((drillingRigs[i].drillingRig_id))
            drilling_rig_emissions_over_time['Time (mins)'].append(drillingRigs[i].Dr_time_list)
            drilling_rig_emissions_over_time['Activity'].append(drillingRigs[i].Dr_state_list) 
            drilling_rig_emissions_over_time[i] = {
                'NOx [kg/kWh]': [],
                'CO2 [kg]': [],
                'Fuel [kg]': []
            }
            for j in range(len(drillingRig.Dr_state_list)):
                if drillingRig.Dr_state_list[j] == 'Idling':
                    drilling_rig_emissions_over_time[i]['NOx [kg/kWh]'].append(calculate_emissions(emissions.Dr_probability_Idling, emissions.Dr_NOx_Idling, drillingRig.Dr_time_list[j])/1000)
                    drilling_rig_emissions_over_time[i]['CO2 [kg]'].append(calculate_emissions(emissions.Dr_probability_Idling, emissions.Dr_CO2_Idling, drillingRig.Dr_time_list[j])/1000)
                    drilling_rig_emissions_over_time[i]['Fuel [kg]'].append(calculate_emissions(emissions.Dr_probability_Idling, emissions.Dr_Fuel_Idling, drillingRig.Dr_time_list[j])/1000)
                elif drillingRig.Dr_state_list[j] == 'Drilling':
                    drilling_rig_emissions_over_time[i]['NOx [kg/kWh]'].append(calculate_emissions(emissions.Dr_probability_Drilling, emissions.Dr_NOx_Drilling, drillingRig.Dr_time_list[j])/1000)
                    drilling_rig_emissions_over_time[i]['CO2 [kg]'].append(calculate_emissions(emissions.Dr_probability_Drilling, emissions.Dr_CO2_Drilling, drillingRig.Dr_time_list[j])/1000)
                    drilling_rig_emissions_over_time[i]['Fuel [kg]'].append(calculate_emissions(emissions.Dr_probability_Drilling, emissions.Dr_Fuel_Drilling, drillingRig.Dr_time_list[j])/1000)


            time_drilling_rig = [t/60 for t in np.cumsum(drillingRig.Dr_time_list).tolist()]
            NOxDr = np.cumsum(drilling_rig_emissions_over_time[i]['NOx [kg/kWh]'])
            CO2Dr = np.cumsum(drilling_rig_emissions_over_time[i]['CO2 [kg]'])
            FuelDr = np.cumsum(drilling_rig_emissions_over_time[i]['Fuel [kg]'])

            fig, ax = plt.subplots(figsize=(8, 6))
            plt.subplots_adjust(left=0.1, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
            ax.plot(time_drilling_rig, NOxDr, marker='o', linestyle='-', color='b', label='NOx [kg/kWh]')
            ax.plot(time_drilling_rig, CO2Dr, marker='o', linestyle='-', color='r', label='CO2 [kg]')
            ax.plot(time_drilling_rig, FuelDr, marker='o', linestyle='-', color='y', label='Fuel [kg]')

            ax.set_xlabel("Time (minutes)", fontsize=14)
            ax.set_ylabel("metrics", fontsize=14)
            ax.set_title(f"Emissions from Drilling rig {i+1}", fontsize=16)
            ax.grid(True)
            ax.legend()
            plt.savefig(f"emissions_drilling_{i+1}.png")  # Save the figure
            plt.close(fig)


        sum_NOx_drRig = []
        sum_CO2_drRig = []
        sum_Fuel_drRig = []


        for i in range(NUM_DRILLINGRIGS):
            sum_NOx_drRig.append(drilling_rig_emissions_over_time[i]['NOx [kg/kWh]'])
            sum_CO2_drRig.append(drilling_rig_emissions_over_time[i]['CO2 [kg]'])
            sum_Fuel_drRig.append(drilling_rig_emissions_over_time[i]['Fuel [kg]'])

        sum_NOx_drRig = [sum(x) for x in zip(*sum_NOx_drRig)]
        sum_CO2_drRig = [sum(x) for x in zip(*sum_CO2_drRig)]
        sum_Fuel_drRig = [sum(x) for x in zip(*sum_Fuel_drRig)]

        cumulative_sum_NOx_dr_rig = np.cumsum(sum_NOx_drRig).tolist()
        cumulative_sum_CO2_dr_rig = np.cumsum(sum_CO2_drRig).tolist()
        cumulative_sum_Fuel_dr_rig = np.cumsum(sum_Fuel_drRig).tolist() 

        combined_list_activity_Loader = []
        combined_list_time_Loader = []

        for truck in trucks:
            combined_list_activity_Loader += truck.get_Lo_state_list()
            combined_list_time_Loader += truck.get_Lo_time_list()
            # print(combined_list_activity_Loader,combined_list_time_Loader)   
        loader_emissions_over_time = {
            'NOx [kg/kWh]': [],
            'CO2 [kg]': [],
            'Fuel [kg]': []
        }

        timeLoader=np.diff(global_Lo_time_list).tolist()
        timeLoader[0]=0

        global_Lo_state_list.insert(0,'Idling')
        global_Lo_time_list.append((SIM_TIME))
        timeLoader=(np.diff(global_Lo_time_list).tolist())

        timeLoader.insert(0, global_Lo_time_list[0])
        # timeLoader=[t/60 for t in (timeLoader)]
        global_Lo_state_list_min= [t /60 for t in global_Lo_time_list]

        loader_emissions_over_time = {
        'NOx [kg/kWh]': [],
        'CO2 [kg]': [],
        'Fuel [kg]': []
    }
        for i in range(len(global_Lo_state_list)):

                if global_Lo_state_list[i] == 'Idling':
                    loader_emissions_over_time['NOx [kg/kWh]'].append(calculate_emissions(emissions.Lo_probability_Idling, loader_type_data.get('Lo_NOx_Idling',0), timeLoader[i])/1000)
                    loader_emissions_over_time['CO2 [kg]'].append(calculate_emissions(emissions.Lo_probability_Idling, loader_type_data.get('Lo_CO2_Idling',0), timeLoader[i])/1000)
                    loader_emissions_over_time['Fuel [kg]'].append(calculate_emissions(emissions.Lo_probability_Idling, loader_type_data.get('Lo_Fuel_Idling',0), timeLoader[i])/1000)

                elif global_Lo_state_list[i] == 'Loading':
                    loader_emissions_over_time['NOx [kg/kWh]'].append(calculate_emissions(emissions.Lo_probability_Loading, loader_type_data.get('Lo_NOx_Loading',0), timeLoader[i])/1000)
                    loader_emissions_over_time['CO2 [kg]'].append(calculate_emissions(emissions.Lo_probability_Loading, loader_type_data.get('Lo_CO2_Loading',0), timeLoader[i])/1000)
                    loader_emissions_over_time['Fuel [kg]'].append(calculate_emissions(emissions.Lo_probability_Loading, loader_type_data.get('Lo_Fuel_Loading',0), timeLoader[i])/1000)

            
        NOxLoader = np.cumsum(loader_emissions_over_time['NOx [kg/kWh]'])
        CO2Loader = np.cumsum(loader_emissions_over_time['CO2 [kg]'])
        FuelLoader = np.cumsum(loader_emissions_over_time['Fuel [kg]'])
        # print('NOxLoader',NOxLoader,timeLoader,'timeLoader')
        fig, ax = plt.subplots(figsize=(8, 6))
        plt.subplots_adjust(left=0.1, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
        ax.plot(global_Lo_state_list_min, NOxLoader, marker='o', linestyle='-', color='b', label='NOx [kg/kWh]')
        ax.plot(global_Lo_state_list_min, CO2Loader, marker='o', linestyle='-', color='r', label='CO2 [kg]')
        ax.plot(global_Lo_state_list_min, FuelLoader, marker='o', linestyle='-', color='y', label='Fuel [kg]')
        ax.set_xlabel("Time (minutes)", fontsize=14)
        ax.set_ylabel("metrics", fontsize=14)
        ax.set_title(f"Emissions from Loader", fontsize=16)
        ax.grid(True)
        ax.legend()
        plt.savefig(f"emissions_loader.png")  # Save the figure
        plt.close(fig)
        # plt.show()   
        # print(global_Lo_state_list,timeLoader)
        
                    # make data
        time_soil = time_transfered
        soil_transfered_2 = np.cumsum(soil_transfered).tolist()
        fig, ax = plt.subplots(figsize=(8, 6))
        plt.subplots_adjust(left=0.1, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
        ax.plot(time_soil, soil_transfered_2, marker='o', linestyle='-', color='b')
        ax.set_xlabel("Time (minutes)", fontsize=14)
        ax.set_ylabel("Soil transfered [m3]", fontsize=14)
        ax.set_title("Soil transferred from the construction site", fontsize=16)
        ax.grid(True)
        fig.savefig('soil_transfered.png',dpi=300)
        # plt.close(fig)

        fig, ax = plt.subplots(figsize=(8, 6))
        plt.plot(time_drilling_rig, cumulative_sum_NOx_dr_rig, color='b')
        plt.plot(time_trucks, cumulative_sum_NOx_truck, color='b',linestyle=':')
        plt.plot(global_Lo_state_list_min, NOxLoader, color='b',linestyle='--')
        plt.plot(time_drilling_rig, cumulative_sum_CO2_dr_rig, color='r')
        plt.plot(time_trucks, cumulative_sum_CO2_truck, color='r',linestyle=':')
        plt.plot(global_Lo_state_list_min, CO2Loader, color='r',linestyle='--')
        plt.plot(time_drilling_rig, cumulative_sum_Fuel_dr_rig, color='g')
        plt.plot(time_trucks, cumulative_sum_Fuel_truck, color='g',linestyle=':')
        plt.plot(global_Lo_state_list_min, FuelLoader, color='g',linestyle='--')
        plt.plot(time_soil, soil_transfered_2, color='black',linestyle='solid',label='Soil transfered [m3]')

        # First legend
        NOx_line = mlines.Line2D([], [], color='b', label='NOx [kg/kWh]')
        CO2_line = mlines.Line2D([], [], color='r', label='CO2 [kg]')
        Fuel_line = mlines.Line2D([], [], color='g', label='Fuel [kg]')
        soil_line=mlines.Line2D([], [], color='black', linestyle='solid', label='Soil transfered [m3]')
        first_legend = plt.legend(handles=[NOx_line, CO2_line, Fuel_line,soil_line], loc='upper left')

        # Add the first legend manually to the current Axes.
        plt.gca().add_artist(first_legend)

        # Second legend
        drilling_rig_line_style = mlines.Line2D([], [], color='black', label='Drilling Rig (solid)')
        truck_line_style = mlines.Line2D([], [], color='black', linestyle=':', label='Truck (dotted)')
        loader_line_style = mlines.Line2D([], [], color='black', linestyle='--', label='Loader (dashed)')
        second_legend =plt.legend(handles=[drilling_rig_line_style, truck_line_style, loader_line_style], loc='upper right')
        plt.gca().add_artist(second_legend)
        # plt.legend(handles=[drilling_rig_line_style, truck_line_style, loader_line_style], loc='upper right')

        plt.subplots_adjust(left=0.1, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
        plt.xlabel('Time [mins]')
        plt.ylabel('Units')

        # plt.legend(handles=[drilling_rig_line, truck_line, loader_line])

        plt.subplots_adjust(left=0.1, bottom=0.1, right=0.9, top=0.9, wspace=0.2, hspace=0.2)
        plt.xlabel('Time [mins]')
        plt.ylabel('Units')

        

        plt.savefig("emissions_all_machines.png")  # Save the figure
        plt.close(fig)


            
    emissions_over_time()



    
    soil_print = pd.DataFrame({'Soil left [m3]': soil_left, 'Time [min]': soil_time})
    df = pd.DataFrame(output, columns=["Simulation Prints"])
    with pd.ExcelWriter('simulation_results.xlsx', engine='xlsxwriter') as writer:
        
        truck_df.to_excel(writer, sheet_name='Truck Data', index=False)
        loader_df.to_excel(writer, sheet_name='Loader Data', index=False)
        DrillingRig_df.to_excel(writer, sheet_name='Drilling Rig Data', index=False)
        emissions_df.to_excel(writer, sheet_name='Emissions Data', index=False)
        soil_print.to_excel(writer, sheet_name='Soil Data', index=False)
        df.to_excel(writer, sheet_name='Simulation Prints')
        
    

# Convert truck_df,loader_df,DrillingRig_df_data to JSON
    truck_json = truck_df.to_json(orient='records', date_format='iso', default_handler=str)
    loader_json = loader_df.to_json(orient='records', date_format='iso', default_handler=str)
    drilling_rig_json = DrillingRig_df.to_json(orient='records', date_format='iso', default_handler=str)
    emissions_json = emissions_df.to_json()
    soil_print_json=soil_print.to_json(orient='records', date_format='iso', default_handler=str)
    return(emissions_json,soil_print_json)




simulation(NUM_LOADERS,NUM_TRUCKS,NUM_DRILLINGRIGS,Initial_soil,SIM_TIME,Distance,soilType,Bucket_size,Truck_capacity,TruckBrand,LoaderType)



