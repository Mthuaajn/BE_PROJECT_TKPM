import { wrapRequestHandler } from "~/utils/handlers";
import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { IDataSourcePlugin } from "~/models/DataSource/IDataSourcePlugin";
import { DataSourceManager } from "~/models/DataSource/DataSourceManager";
export const search = wrapRequestHandler(
    async (
      req: Request<ParamsDictionary, any>,
      res: Response,
      next: NextFunction
    ) => {
        const search: string = req.query.search?.toString() || '';
        const source: string = req.query.datasource?.toString() || '';
        console.log("search:", search);
        console.log("source: ",source);
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

        if (source!= null) {
            let dataSourceManager: DataSourceManager = DataSourceManager.getInstance();
            let plugin: IDataSourcePlugin | null = dataSourceManager.select(`${source}Plugin.ts`)
            if (plugin!=null) {
                const result = await plugin.search(search);
                res.json(result);
            } else {
                res.json({success: false, message: "plugin errors"})
            }
        } else {
            res.json({success: false, message: "source is not valid"})
        }
    }
);