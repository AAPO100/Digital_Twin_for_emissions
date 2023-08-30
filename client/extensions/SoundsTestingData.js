const dataForTest = [18, 12, 6, 9, 12, 3, 9]


const datesInitial= ['2021-11-01', '2021-11-02', '2021-11-03', '2021-11-04', '2021-11-05', '2021-11-06', '2021-11-07']
const dates= datesInitial.map(date =>new Date(date).setHours(0,0,0,0));


export function getData () { 
    return (dataForTest)
}

export function getDates () { 
    return (dates)
}



const dataForTestSensor2 = [18, 16, 14, 12, 11, 12, 18,20]

const datesInitialSensor2= ['2021-12-01', '2021-12-02', '2021-12-03', '2021-12-04', '2021-12-05', '2021-12-06', '2021-12-07', '2021-12-08']

const datesSensor2=datesInitialSensor2.map(date =>new Date(date).setHours(0,0,0,0));

export function getDataSensor2 () { 
    return (dataForTestSensor2)
}

export function getDatesSensor2 () { 
    return (datesSensor2)
}