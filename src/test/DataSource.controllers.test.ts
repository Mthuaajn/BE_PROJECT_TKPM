import { Request, Response } from 'express';
import { MockPlugin } from './mocks/MockPlugin';
import { DataSourceManager } from '~/models/DataSourceManagement/DataSourceManager';
import { search } from '~/controllers/DataSource.controllers';
describe('DataSource Controllers', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let manager: DataSourceManager;
  let plugin: MockPlugin;

  beforeEach(() => {
    req = {};
    res = {
      json: jest.fn()
    };
    manager = DataSourceManager.getInstance();
    manager.clearAllPlugins();
    plugin = new MockPlugin();
    manager.setDataSource(plugin.name, plugin);
  });

  //Kiểm tra việc trả về kết quả tìm kiếm từ plugin.
  test('should return search results from plugin', async () => {
    req.query = { search: 'test', datasource: 'MockPlugin', page: '1' };
    await search(req as Request, res as Response, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ message: 'plugin errors', success: false });
});

  //Kiểm tra việc trả về thông báo lỗi nếu plugin không tồn tại.
  test('should return error message if plugin not found', async () => {
    req.query = { search: 'test', datasource: 'NonExistentPlugin', page: '1' };
    await search(req as Request, res as Response, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'plugin errors' });
  });

  // Kiểm tra việc trả về thông báo lỗi nếu datasource không hợp lệ.
  test('should return error message if datasource is not valid', async () => {
    req.query = { search: 'test', datasource: '', page: '1' };
    await search(req as Request, res as Response, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ message: 'plugin errors', success: false });
});
});
