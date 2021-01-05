import SpiderBase, { TypeWebGet } from './SpiderBase';
import { DataJson, utils } from './utils';

interface SummaryData {
    confirmed: string,
    died: string,
    cured: string,
    curConfirm: string,
    confirmedRelative: string,
    relativeTime: string,
    overseasInput: string,
    icu: string
}

/**
 * 新冠数据爬取解析
 * Novel coronavirus pneumonia
 * 学习专用 --HarryNR
 */
export default class ChinaNCPData extends SpiderBase {

    protected _filePath: string = "ChinaNCPData.json";

    // 单例模式
    private static instance: ChinaNCPData;
    static getIns(): ChinaNCPData {
        if (!ChinaNCPData.instance)
            ChinaNCPData.instance = new ChinaNCPData(TypeWebGet.SUPERAGENT);

        return ChinaNCPData.instance;
    }

    /**
     * web url use as data source
     */
    public get url() {
        return "https://voice.baidu.com/act/newpneumonia/newpneumonia/?from=osari_pc_1";
    }

    /**
     * 处理数据
     * @param $ cheerio.Root
     */
    public handleData($: any): string {
        const script = ($('script')[11] as any).children[0];
        if (script && script.data) {
            this.data = script.data as string;
            if (this.data) {
                const sumData = JSON.parse(this.data);
                if (sumData) {
                    return this.parseData(sumData);
                }
            }
        }
        return '';
    }

    /**
     * 处理抓取的网页数据
     * @param sumData json序列化后的字符串对象
     */
    protected parseData(sumData: any): string {
        const data: any = sumData.component[0];
        // this.writeTempFile(JSON.stringify(data), "temp.json");
        let dataJson: DataJson = {};
        dataJson['程序执行时间'] = utils.formatDate();

        const dataIn: SummaryData = data.summaryDataIn;
        dataJson["国内汇总"] = {
            '累计确诊': dataIn.confirmed,
            '死亡人数': dataIn.died,
            '治愈人数': dataIn.cured,
            '当前确诊人数': dataIn.curConfirm,
            '疑似病例': dataIn.confirmedRelative,
            "境外输入": dataIn.overseasInput,
            "重症病例": dataIn.icu,
            '日期': utils.formatDate(dataIn.relativeTime)
        };

        const dataOut: SummaryData = data.summaryDataOut;
        dataJson["海外汇总"] = {
            '累计确诊': dataOut.confirmed,
            '死亡人数': dataOut.died,
            '治愈人数': dataOut.cured,
            '当前确诊人数': dataOut.curConfirm,
            '疑似病例': dataOut.confirmedRelative,
            '日期': utils.formatDate(dataOut.relativeTime)
        };

        dataJson["今日新增榜单"] = data.topAddCountry;
        dataJson["境外输入榜单"] = data.topOverseasInput;

        return JSON.stringify(dataJson);
    }

}