import { IFileExtensionPlugin } from './IFileExtensionPlugin';

//This class is used for manage downloading story plugin
export class FileExtensionManager {
  // Instance of this class, used for singleton design pattern
  private static instance: FileExtensionManager;

  // Map used for manage the plugin
  private fileExtensionPlugin: Map<string, IFileExtensionPlugin>;

  private constructor() {
    this.fileExtensionPlugin = new Map<string, IFileExtensionPlugin>();
  }

  // Get instance of this class using singleton pattern
  public static getInstance(): FileExtensionManager {
    if (!FileExtensionManager.instance) {
      FileExtensionManager.instance = new FileExtensionManager();
    }

    return FileExtensionManager.instance;
  }

  // Register a new plugin
  public registerFileExtensionPlugin(
    name: string,
    fileExtensionPlugin: IFileExtensionPlugin
  ): void {
    this.fileExtensionPlugin.set(name, fileExtensionPlugin);
  }

  // Get a registered plugin in this class
  public select(name: string): IFileExtensionPlugin | null {
    if (this.fileExtensionPlugin.has(name)) {
      return this.fileExtensionPlugin.get(name) ?? null;
    }
    return null;
  }

  // Clear all plugins in map
  public clearAllPlugins(): void {
    this.fileExtensionPlugin.clear();
  }

  // Get plugin map
  public getDFileExtensionMap(): Map<string, IFileExtensionPlugin> | null {
    return this.fileExtensionPlugin;
  }

  // Set Plugin map
  public setFileExtensionMap(map: Map<string, IFileExtensionPlugin>): void {
    this.fileExtensionPlugin = map;
  }

  // Create a clone plugin map and set it to this class's plugin map
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
