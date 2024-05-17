"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.home = exports.listStory = exports.contentStory = exports.detailStory = exports.search = void 0;
const handlers_1 = require("../utils/handlers");
const DataSourceManager_1 = require("../models/DataSource/DataSourceManager");
exports.search = (0, handlers_1.wrapRequestHandler)(async (req, res, next) => {
    const search = req.query.search?.toString() || '';
    const source = req.query.datasource?.toString() || '';
    console.log('search:', search);
    console.log('source: ', source);
    // const url = req.url;
    // const regex = /datasource:([^/]+)/i;
    // let source = null;
    // const match = url.match(regex);
    // if (match && match[1]) {
    //     const extractedValue = match[1];
    //     source = extractedValue;
    //     console.log("source: ",extractedValue);
    // } else {
    //     console.log('String not found');
    // }
    if (source != null) {
        const dataSourceManager = DataSourceManager_1.DataSourceManager.getInstance();
        //const plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`);
        const plugin = dataSourceManager.select(`${source}Plugin`);
        if (plugin != null) {
            const result = await plugin.search(search);
            if (result != null) {
                res.json(result);
            }
            else {
                res.json({ quantity: 0 });
            }
        }
        else {
            res.json({ success: false, message: 'plugin errors' });
        }
    }
    else {
        res.json({ success: false, message: 'source is not valid' });
    }
});
exports.detailStory = (0, handlers_1.wrapRequestHandler)(async (req, res, next) => {
    const title = req.query.title?.toString() || '';
    const source = req.query.datasource?.toString() || '';
    console.log('source: ', source);
    console.log('title: ', title);
    if (source != null) {
        const dataSourceManager = DataSourceManager_1.DataSourceManager.getInstance();
        const plugin = dataSourceManager.select(`${source}Plugin`);
        if (plugin != null) {
            const result = await plugin.detailStory(title);
            if (result != null) {
                res.json(result);
            }
            else {
                res.json({ quantity: 0 });
            }
        }
        else {
            res.json({ success: false, message: 'plugin errors' });
        }
    }
    else {
        res.json({ success: false, message: 'source is not valid' });
    }
});
exports.contentStory = (0, handlers_1.wrapRequestHandler)(async (req, res, next) => {
    const chap = req.query.chap?.toString() || '';
    const title = req.query.title?.toString() || '';
    const source = req.query.datasource?.toString() || '';
    console.log('source: ', source);
    console.log('title: ', title);
    console.log('chap: ', chap);
    if (source != null) {
        const dataSourceManager = DataSourceManager_1.DataSourceManager.getInstance();
        const plugin = dataSourceManager.select(`${source}Plugin`);
        if (plugin != null) {
            const result = await plugin.contentStory(title, chap);
            if (result != null) {
                res.json(result);
            }
            else {
                res.json({ quantity: 0 });
            }
        }
        else {
            res.json({ success: false, message: 'plugin errors' });
        }
    }
    else {
        res.json({ success: false, message: 'source is not valid' });
    }
});
exports.listStory = (0, handlers_1.wrapRequestHandler)(async (req, res, next) => {
    const type = req.query.type?.toString() || '';
    const page = req.query.page?.toString() || '';
    const source = req.query.datasource?.toString() || '';
    console.log('source: ', source);
    console.log('page: ', page);
    console.log('type: ', type);
    if (source != null) {
        const dataSourceManager = DataSourceManager_1.DataSourceManager.getInstance();
        const plugin = dataSourceManager.select(`${source}Plugin`);
        if (plugin != null) {
            let result = null;
            if (type == 'newest') {
                result = await plugin.newestStory(undefined, page);
            }
            else if (type == 'full') {
                result = await plugin.fullStory(undefined, page);
            }
            else if (type == 'hot') {
                result = await plugin.hotStory(undefined, page);
            }
            else {
                res.json({ success: false, message: 'invalid type of list story' });
            }
            if (result != null) {
                res.json(result);
            }
            else {
                res.json({ quantity: 0 });
            }
        }
        else {
            res.json({ success: false, message: 'plugin errors' });
        }
    }
    else {
        res.json({ success: false, message: 'source is not valid' });
    }
});
exports.home = (0, handlers_1.wrapRequestHandler)(async (req, res, next) => {
    const source = req.query.datasource?.toString() || '';
    console.log('source: ', source);
    if (source != null) {
        const dataSourceManager = DataSourceManager_1.DataSourceManager.getInstance();
        const plugin = dataSourceManager.select(`${source}Plugin`);
        if (plugin != null) {
            const result = await plugin.home();
            if (result != null) {
                res.json(result);
            }
            else {
                res.json({ quantity: 0 });
            }
        }
        else {
            res.json({ success: false, message: 'plugin errors' });
        }
    }
    else {
        res.json({ success: false, message: 'source is not valid' });
    }
});
