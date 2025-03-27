import { DataType } from "./type";

export const randomNumber = (min: number = 1, max: number = 5) => {
    min = Math.ceil(min);
    return Math.floor(Math.random() * (Math.floor(max) - min + 1)) + min;
}

export const DataTypeToSerial = (data: DataType[]) => {
    return data.map(item => `${item.key} ${item.delay}`).join(',');
}

// export const SerialToDataType = (data: string): DataType[] => {
//     const keys: DataType[] = data.split(',').map(item => {
//         const [key, delay] = item.split(' ');
//         return { key, delay: Number(delay) };
//     });
//     return keys;
// }