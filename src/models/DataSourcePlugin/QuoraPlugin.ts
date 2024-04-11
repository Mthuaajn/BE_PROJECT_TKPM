import { IDataSourcePlugin } from "../DataSource/IDataSourcePlugin";

export default class QuoraPlugin implements IDataSourcePlugin {
    name: string;

    public constructor(name: string) {
        this.name = name;
    }
    public search(title: string):void {
        console.log(`search result for ${title}`);
    }
}