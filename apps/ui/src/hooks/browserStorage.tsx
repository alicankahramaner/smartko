import { useCallback, useMemo } from "react";

export interface StorageType {
    create<T = any>(key: string, value: T): boolean;
    read<T = false>(key: string): T | false;
    read<T = false>(key: string): T | false;
    update(key: string, newValue: any): boolean;
    delete(key: string): Promise<boolean>;
    [key: string]: any;
}


export interface LocalStorageDto {
    key: string;
    value: string | null;
}

export type BrowserStorageTypeOptions = 'session' | 'local'

interface BrowserStorageOptions {
    type?: BrowserStorageTypeOptions;
}

export const useBrowserStorage = (options?: BrowserStorageOptions): StorageType => {

    const storage = useMemo(() => {
        if (options && options.type === 'session') {
            return window.sessionStorage;
        }

        return window.localStorage
    }, [options])

    /**
     * 
     * @param value any value 
     * @description any type to convert to string if a object value JSON stringfy 
     * @returns string
     */
    const convertValue = useCallback((value: any): string => {
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return String(value);
    }, []);

    const getConvertedValue = useCallback(function <T = string>(value: string | null): T | null {
        let convertedValue: any = value;
        if (value === null) {
            return null;
        }

        try {
            let jsonParsed = JSON.parse(value);
            if (jsonParsed) {
                convertedValue = jsonParsed
            }
        } catch (error) {
        }

        return convertedValue as T;
    }, [])

    const set = useCallback((key: string, value: any): boolean => {
        try {
            storage.setItem(key, convertValue(value))
        } catch (error) {
            return false
        }
        return true;
    }, [storage, convertValue]);

    const get = useCallback(function <T = string>(key: string): T | boolean {
        return getConvertedValue<T>(storage.getItem(key)) || false;
    }, [storage, getConvertedValue]);

    const remove = useCallback(async (key: string): Promise<boolean> => {
        storage.removeItem(key);
        return true;
    }, [storage]);

    const checkKey = useCallback((key: string): boolean => {
        let exist: boolean = false;
        for (let index = 0; index < storage.length; index++) {
            if (storage.key(index) === key) {
                exist = true;
                break;
            }
        }

        return exist;
    }, [storage]);

    const checkValue = useCallback(async (key: string, value: any): Promise<boolean> => {
        const keyValue = await get(key);

        return keyValue === convertValue(value);
    }, [convertValue, get])

    const getAllValue = useCallback(async (): Promise<LocalStorageDto[]> => {
        const data: LocalStorageDto[] = [];
        for (let index = 0; index < storage.length; index++) {
            let key: string | null = storage.key(index);

            if (key === null) {
                continue;
            }
            const value = get(key)
            if (typeof value !== 'string') continue;
            data.push({
                key,
                value
            });
        }

        return data;

    }, [get, storage])

    return {
        create: set,
        delete: remove,
        read: get,
        update: set,
        checkKey,
        checkValue,
        getAllValue
    }
}