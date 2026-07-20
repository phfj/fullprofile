import { customType } from 'drizzle-orm/sqlite-core';

//Automatically handles the conversions between Dollard (app) and Cents(DB)
export const centsCurrency = customType<{ data: number; driverData: number }>({
    dataType() {
        return 'integer'; //Tells SQLite to make this an INTEGER column
    },
    toDriver(value: number): number {
        //Converts $10.50 -> 1050 before writing to the database
        return Math.round(value * 100);
    },
    fromDriver(value: number): number {
        //Conterst 1050 -> 10.50 after reading from the database
        return value / 100;
    }
});