import { Admin } from "./main";

export type FetchRequest = (...args: any[]) => Promise<{ [key: string]: any }>;
