import SpiderBase, { TypeWebGet } from "./SpiderBase";
import { DataJson, utils } from "./utils";

interface ImgInfo {
    imgItem: string | undefined,
    infoItem: string
}

interface JsonGenerate {
    count: number,
    data: ImgInfo[],
    time: string
}

/**
 * Zcool网站首页数据爬取
 * 学习专用 --HarryNR
 */
export default class ZcoolData extends SpiderBase {

    protected _filePath: string = "ZcoolData.json";

    // 单例模式
    private static instance: ZcoolData;
    static getIns(): ZcoolData {
        if (!ZcoolData.instance)
            ZcoolData.instance = new ZcoolData(TypeWebGet.SUPERAGENT);

        return ZcoolData.instance;
    }

    public get url(): string {
        return 'https://www.zcool.com.cn/';
    }

    /**
     * 处理数据
     * @param $ cheerio.Root
     */
    protected handleData($: any): string {
        const cardBox = $('.card-box');
        const dataInfo: ImgInfo[] = [];
        cardBox.map((index: any, item: any) => {
            const imgItem = $(item).find('img').attr('src');
            const infoItem = $(item).find('.card-info-title a').text();
            dataInfo.push({ imgItem, infoItem });
        });
        const json: JsonGenerate = {
            count: dataInfo.length,
            data: dataInfo,
            time: utils.formatDate()
        };
        let generate: DataJson = {};
        generate["Zcool网站首页数据"] = json;
        return JSON.stringify(generate);
    }

}