import SpiderBase, { TypeWebGet } from "./SpiderBase";
import { DataJson, utils } from "./utils";
import cheerio from 'cheerio';

interface QuoteInfo {
    '谚语': string,
    '作者': string,
    '分类': string | undefined
}

export default class QuotesData extends SpiderBase {

    protected _filePath: string = "QuotesData.json";

    // 单例模式
    private static instance: QuotesData;
    static getIns(): QuotesData {
        if (!QuotesData.instance)
            QuotesData.instance = new QuotesData(TypeWebGet.AXIOS);

        return QuotesData.instance;
    }

    public get url(): string {
        return "http://quotes.toscrape.com/";
    }

    protected handleData($: any): string {
        this.writeQuoteTopic();
        return "";
    }

    // 下一页序号
    private tarPage: number = 1;
    // 谚语数组
    private quoteList: QuoteInfo[] = new Array();
    private async writeQuoteTopic() {
        console.log(`处理页面${this.tarPage}...`);
        const oldCnt = this.quoteList.length;
        const htmlContent: any = await this.getHtml(this.url + "page/" + this.tarPage);
        const $ = cheerio.load(htmlContent);
        $('.quote').each((idx: number, element: any) => {
            const quote = $(element).find('.text').text().replace("“", '').replace("”", '').trim();
            const author = $(element).find('.author').text().trim();
            const tags = $(element).find('.tags .keywords').attr('content');
            // 填入有效值
            if (quote.length > 0 && author.length > 0) {
                const disInfo: QuoteInfo = {
                    '谚语': quote,
                    '分类': tags,
                    '作者': author
                };
                this.quoteList.push(disInfo);
            }
        });
        if (oldCnt == this.quoteList.length) {
            // 爬取完毕
            let info: DataJson = {};
            info['writeTime'] = utils.formatDate();
            info[`谚语${oldCnt}条`] = this.quoteList;
            this.writeFile(JSON.stringify(info));
            console.log(`处理完毕，共${oldCnt}条目...`);
        } else {
            // 下一页内容
            this.tarPage++;
            await utils.asleep(1);
            await this.writeQuoteTopic();
        }
    }

}