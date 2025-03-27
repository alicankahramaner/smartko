export interface DataType {
    key: string;
    delay: number;
    id: number;
}

export interface ProfileType {
    name: string;
    id: number;
    data: DataType[]
}