import SpiderBase, { TypeWebGet } from "./SpiderBase";
import { DataJson, utils } from "./utils";
import cheerio from 'cheerio';
import SaveFiles from "./SaveFiles";

interface DiscussInfo {
    '标题': string,
    '地址': string,
    '作者': string
}

interface Article {
    title: String,
    author: String,
    text: String
}

export default class NodejsDiscuss extends SpiderBase {

    protected _filePath: string = "NodejsDiscuss.json";

    // 单例模式
    private static instance: NodejsDiscuss;
    static getIns(): NodejsDiscuss {
        if (!NodejsDiscuss.instance)
            NodejsDiscuss.instance = new NodejsDiscuss(TypeWebGet.AXIOS);

        return NodejsDiscuss.instance;
    }

    public get url(): string {
        return "http://cnodejs.org";
    }

    protected handleData($: any): string {
        let ary: DiscussInfo[] = new Array();
        $('.topic_title_wrapper').each((idx: number, element: any) => {
            const title = $(element).find('.topic_title').first().text().trim();
            const url = this.url + $(element).find('.topic_title').first().attr('href');
            const author = $(element).find('.user_avatar img').attr('title');
            const disInfo: DiscussInfo = {
                '标题': title,
                '地址': url,
                '作者': author
            };
            ary.push(disInfo);
        });
        $('.cell').each(function (idx: number, element: any) {
            const author = $(element).find('.user_avatar img').attr('title');
            ary[idx].作者 = author;
        });

        if (ary.length > 0)
            this.writeSubTopic(ary);

        let info: DataJson = {};
        let title = $('title').text() as string;
        title = title.replace(/\\n/gi, '').trim();
        info[title] = ary;
        info['writeTime'] = utils.formatDate();
        return JSON.stringify(info);
    }

    /**
     * 获取文章内容
     * @param url 网址
     */
    private async writeSubTopic(ary: DiscussInfo[]) {
        await SaveFiles.mkDataSubDir('NodejsDiscuss');

        const length = ary.length;
        let index = 0;
        let atls: Article[] = new Array();
        for (const info of ary) {
            await utils.asleep(1);
            const htmlContent: any = await this.getHtml(info.地址);
            const $ = cheerio.load(htmlContent);
            let article: Article = {
                text: $('.topic_content').first().text(),
                title: info.标题,
                author: info.作者
            };
            atls.push(article);
            console.log(`抓取进度${++index}/${length}...`);
        }
        let detail: DataJson = {};
        detail['论坛内容'] = atls;
        this.writeFile(JSON.stringify(detail), 'NodejsDiscuss/topics.json');
    }

}