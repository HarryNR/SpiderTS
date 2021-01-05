import SpiderBase, { TypeWebGet } from "./SpiderBase";
import cheerio from 'cheerio';
import { CatalogData, utils } from "./utils";

// 处理文章分页问题
interface StoryData {
    title: string,
    content: string,
    idx: number,
    full: boolean
}

/**
 * 笔趣阁抓取小说文章
 * 设计目标：
 * 1.0，抓取整本小说内容，用“书名-作者”保存txt文件，内容需要按照章节顺序保存文章和分段；
 */
export default class BQGStoryData extends SpiderBase {

    // 文件存储相对路径
    protected _filePath: string = "";
    // 书籍名称
    public set bookName(name: string) {
        this._filePath = name + '.txt';
    }

    // 单例模式
    private static instance: BQGStoryData;
    static getIns(): BQGStoryData {
        if (!BQGStoryData.instance)
            BQGStoryData.instance = new BQGStoryData(TypeWebGet.AXIOS);

        return BQGStoryData.instance;
    }



    public get url(): string {
        return "https://www.biquge.lol/book/1062/";
    }

    // 书籍信息
    private bookInfo: string[] = new Array();
    protected handleData($: any): string {
        const container = $('.container .detail-box');
        const top = container.find('.info .top');
        // name
        const name: string = top.find('h1').text().trim();
        this.bookName = name;
        console.log('开始爬取 ', name);
        this.bookInfo.push("《" + name + "》");
        // author type status
        const that = this;
        const info = top.find('.fix p');
        info.each(function (idx: number, element: any) {
            if (idx < 3) {
                const str = $(element).text().trim();
                // console.log(str);
                that.bookInfo.push(str);
            }
        });
        // 简介
        const intro = container.find('.m-desc').text().trim();
        // console.log(intro);
        that.bookInfo.push(intro);
        // 目录
        this.isCatalogWrited = false;
        this.getCatalogList($);

        return this.bookInfoStr;
        // return "";
    }

    /**
     * 书籍信息转字符串文本
     */
    private get bookInfoStr(): string {
        let str = "";
        for (const info of this.bookInfo) {
            str += info + '\n';
        }
        return this.cleanData(str);
    }

    /**
     * 数据清洗
     * @param str 源字符串
     */
    private cleanData(str: string): string {
        let temp = str.trim();
        temp = temp.replace(/ {2} +/g, '\n');      // 清洗2个以上的空格字符
        temp = temp.replace(/\n{1}\n+/g, '\n');    // 清洗2个及以上的换行符
        return temp;
    }

    // 目录信息数组
    private catalogList: CatalogData[] = new Array();
    // 是否打印目录完毕
    private isCatalogWrited: boolean = false;
    // (目录需要循环获取)
    private async getCatalogList($: any) {
        console.log('处理文章目录中...');
        const that = this;
        const section = $('.container .row-section .layout-col1');
        const infoList = section.find('.section-box .section-list li');
        infoList.each((idx: number, element: any) => {
            const item = $(element).find('a');
            const contextTitle = item.text().trim();
            // 1、需要处理重复内容，2、排序
            const cataIdx: number = utils.chinese2Number(contextTitle);
            const catalogInfo: CatalogData = {
                标题: contextTitle,
                网址: item.attr('href'),
                idx: cataIdx
            };
            if (cataIdx >= 0 && that.catalogList[cataIdx] == undefined) {
                // console.log(JSON.stringify(catalogInfo));   // log
                that.catalogList[cataIdx] = catalogInfo;
            }
        });

        // 检查下一页
        const pageRight = section.find(".listpage .right a");
        let isEnd = false;
        if (pageRight) {
            const url = pageRight.attr("href");
            if (url) {
                const htmlContent: any = await this.getHtml(this.getSubUrl(url));
                const chreeioRoot = cheerio.load(htmlContent);
                await utils.asleep(2);
                await this.getCatalogList(chreeioRoot);
            }
            else
                isEnd = true;
        }
        else
            isEnd = true;

        if (isEnd && !this.isCatalogWrited) {
            // 目录完整性校验
            const continuously = utils.checkCatalogContinuously(this.catalogList);
            if (!continuously)
                return;

            this.isCatalogWrited = true;
            let catalogStr = '\n\n目录：\n';
            for (const catalog of this.catalogList) {
                if (!catalog) continue;
                const str = catalog.标题;
                if (str && str.length > 0)
                    catalogStr += str + '\n';
            }
            this.writeFileEnd(catalogStr);

            await utils.asleep(5);
            await this.getAllStories();
            return;
        }
    }

    /**
     * 二级地址拼接完整地址
     * @param url 二级地址
     */
    private getSubUrl(url: string): string {
        const dirty = "/book/1062/";
        const newUrl = this.url + url.replace(dirty, '');
        console.log(newUrl);
        return newUrl;
    }

    /**
     * 挖掘所有文章内容，并写入文件
     */
    private async getAllStories() {
        for (const cata of this.catalogList) {
            if (!cata) continue;
            const url = this.getSubUrl(cata.网址);
            const htmlContent: any = await this.getHtml(url);
            const chreeioRoot = cheerio.load(htmlContent);
            await utils.asleep(2);
            await this.getOneStory(chreeioRoot);
            return; // just test one story --HarryNR
        }
    }

    // 挖掘一片文章具体文本,并写入本地文件
    private async getOneStory($: any) {
        const container = $('.container .reader-main');
        // title
        const title = container.find('.title').text().trim();
        console.log(`开始抓取内容：${title}`);
        // content
        let content = container.find('.content').text().trim();
        content = this.cleanData(content);
        const textFixed = '\n' + title + "\n" + content;
        this.writeFileEnd(textFixed);
    }

}