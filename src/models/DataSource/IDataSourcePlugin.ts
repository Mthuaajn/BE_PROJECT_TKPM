export interface IDataSourcePlugin {
    name: string;
    search(title: string):void;
}