"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSourceManager = void 0;
class DataSourceManager {
    static instance;
    dataSourcePlugin;
    constructor() {
        this.dataSourcePlugin = new Map();
    }
    static getInstance() {
        if (!DataSourceManager.instance) {
            DataSourceManager.instance = new DataSourceManager();
        }
        return DataSourceManager.instance;
    }
    select(name) {
        if (this.dataSourcePlugin.has(name)) {
            return this.dataSourcePlugin.get(name) ?? null;
        }
        return null;
    }
    clearAllPlugins() {
        this.dataSourcePlugin.clear();
    }
    getDataSourceMap() {
        return this.dataSourcePlugin;
    }
    setDataSourceMap(map) {
        //this.dataSourcePlugin = new Map<string, IDataSourcePlugin>(map);
        //this.dataSourcePlugin = this.deepCopyMap(map);
        this.dataSourcePlugin = this.cloneDataSourceMap(map);
    }
    cloneDataSourceMap(originalMap) {
        const newMap = new Map();
        originalMap.forEach((value, key) => {
            newMap.set(key, value.clone(key));
            //console.log('deep cop: ', key);
        });
        return newMap;
    }
    cloneObject(source) {
        if (typeof source !== 'object' || source === null) {
            return source;
        }
        const clonedObject = Array.isArray(source) ? [] : {};
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                clonedObject[key] = this.cloneObject(source[key]);
            }
        }
        return clonedObject;
    }
    deepCopyMap(originalMap) {
        const newMap = new Map();
        for (const [key, value] of originalMap.entries()) {
            const clonedValue = this.cloneObject(value);
            newMap.set(key, clonedValue);
        }
        return newMap;
    }
    runPlugins() {
        this.dataSourcePlugin.forEach((value, key) => {
            console.log(`Running plugin ${key} ...`);
            value.search(key);
        });
    }
    printAllPlugins() {
        this.dataSourcePlugin.forEach((Value, key) => {
            console.log(`Running plugin ${key} ...`);
        });
    }
}
exports.DataSourceManager = DataSourceManager;
