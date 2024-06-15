import { DataSourceManager } from '~/models/DataSourceManagement/DataSourceManager';
import { IDataSourcePlugin } from '~/models/DataSourceManagement/IDataSourcePlugin';
import { MockPlugin } from './mocks/MockPlugin';

describe('DataSourceManager', () => {
  let manager: DataSourceManager;
  let plugin: IDataSourcePlugin;

  beforeEach(() => {
    manager = DataSourceManager.getInstance();
    manager.clearAllPlugins();
    plugin = new MockPlugin();
  });

  // Kiểm tra việc thêm và truy xuất một plugin
  test('should add and retrieve a plugin', () => {
    manager.setDataSource(plugin.name, plugin);
    const retrievedPlugin = manager.select(plugin.name);
    expect(retrievedPlugin).toBe(plugin);
  });

  //Kiểm tra việc truy xuất một plugin không tồn tại
  test('should return null if plugin does not exist', () => {
    const retrievedPlugin = manager.select('NonExistentPlugin');
    expect(retrievedPlugin).toBeNull();
  });

  // Kiểm tra việc xóa tất cả các plugin
  test('should clear all plugins', () => {
    manager.setDataSource(plugin.name, plugin);
    manager.clearAllPlugins();
    const retrievedPlugin = manager.select(plugin.name);
    expect(retrievedPlugin).toBeNull();
  });

  // Kiểm tra việc clone một map chứa các plugin
  test('should clone data source map', () => {
    manager.setDataSource(plugin.name, plugin);
    const clonedMap = manager.cloneDataSourceMap(
      manager.getDataSourceMap() as Map<string, IDataSourcePlugin>
    );
    expect(clonedMap.get(plugin.name)).not.toBe(plugin);
    expect(clonedMap.get(plugin.name)?.name).toBe(plugin.name);
  });
});
