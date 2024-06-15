import { IFileExtensionPlugin } from './IFileExtensionPlugin';

export class FileExtensionManager {
  private static instance: FileExtensionManager;
  private fileExtensionPlugin: Map<string, IFileExtensionPlugin>;

  private constructor() {
    this.fileExtensionPlugin = new Map<string, IFileExtensionPlugin>();
  }
  public static getInstance(): FileExtensionManager {
    if (!FileExtensionManager.instance) {
      FileExtensionManager.instance = new FileExtensionManager();
    }

    return FileExtensionManager.instance;
  }

  public select(name: string): IFileExtensionPlugin | null {
    if (this.fileExtensionPlugin.has(name)) {
      return this.fileExtensionPlugin.get(name) ?? null;
    }
    return null;
  }

  public clearAllPlugins(): void {
    this.fileExtensionPlugin.clear();
  }

  public getDFileExtensionMap(): Map<string, IFileExtensionPlugin> | null {
    return this.fileExtensionPlugin;
  }

  public setFileExtensionMap(map: Map<string, IFileExtensionPlugin>): void {
    //this.dataSourcePlugin = new Map<string, IDataSourcePlugin>(map);
    //this.dataSourcePlugin = this.deepCopyMap(map);
    this.fileExtensionPlugin = map;
  }
  public setCloneFileExtensionMap(map: Map<string, IFileExtensionPlugin>): void {
    //this.dataSourcePlugin = new Map<string, IDataSourcePlugin>(map);
    //this.dataSourcePlugin = this.deepCopyMap(map);
    this.fileExtensionPlugin = this.cloneDataSourceMap(map);
  }

  private cloneDataSourceMap(
    originalMap: Map<string, IFileExtensionPlugin>
  ): Map<string, IFileExtensionPlugin> {
    const newMap = new Map<string, IFileExtensionPlugin>();

    originalMap.forEach((value, key) => {
      newMap.set(key, value.clone());
      //console.log('deep cop: ', key);
    });

    return newMap;
  }

  private cloneObject<T>(source: T): T {
    if (typeof source !== 'object' || source === null) {
      return source;
    }

    const clonedObject: any = Array.isArray(source) ? [] : {};

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        clonedObject[key] = this.cloneObject(source[key]);
      }
    }

    return clonedObject;
  }

  private deepCopyMap(
    originalMap: Map<string, IFileExtensionPlugin>
  ): Map<string, IFileExtensionPlugin> {
    const newMap = new Map<string, IFileExtensionPlugin>();

    for (const [key, value] of originalMap.entries()) {
      const clonedValue = this.cloneObject(value);
      newMap.set(key, clonedValue);
    }

    return newMap;
  }

  public runPlugins(): void {
    this.fileExtensionPlugin.forEach((value, key) => {
      console.log(`Running plugin ${key} ...`);
    });
  }

  public printAllPlugins(): void {
    this.fileExtensionPlugin.forEach((Value, key) => {
      console.log(`Running plugin ${key} ...`);
    });
  }

  public getAllPluginName(): string[] {
    const list: string[] = [];
    this.fileExtensionPlugin.forEach((value, key) => {
      const str: string = value.name.replace(/Plugin/g, '');
      list.push(str);
    });

    return list;
  }
}
