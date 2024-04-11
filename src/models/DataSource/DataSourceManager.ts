import { DataSourceFactory } from "./DataSourceFactory";
import { IDataSourcePlugin } from "./IDataSourcePlugin";

export class DataSourceManager {
    private dataSourcePlugin: Map<string, IDataSourcePlugin>;
    public constructor() {
        this.dataSourcePlugin = new Map<string, IDataSourcePlugin>;
    } 
    
}