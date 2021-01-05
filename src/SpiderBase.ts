import axios from 'axios';
import cheerio from 'cheerio';
import superagent from 'superagent';
import SaveFiles from './SaveFiles';

/**
 * http请求的第三方库类型
 */
export enum TypeWebGet {
    AXIOS = 1,      // axios
    SUPERAGENT = 2  // superagent
}

/**
 * 简易的爬虫基类
 */
export default abstract class SpiderBase {

    // 简单解析后的数据源
    protected data: string = '';
    // 第三方网络协议库类型
    protected webLib: TypeWebGet = 0;
    // 文件存储相对路径
    protected abstract _filePath: string;

    constructor(type: TypeWebGet) {
        this.webLib = type;
        this.dealHtmlContent();
    }

    /**
     * 获取数据文件存储路径
     */
    protected get filePath(): string {
        if (this._filePath)
            return SaveFiles.realPath(this._filePath);
        else
            return "";
    }

    /**
     * web url use as data source
     */
    public abstract get url(): string;

    /**
     * 处理数据
     * @param $ cheerio.Root
     */
    protected abstract handleData($: any): string;


    /**
     * 写入本地文件
     * @param content 
     */
    protected writeFile(content: string, filePath: string = '') {
        const targetPath = filePath ? SaveFiles.realPath(filePath) : this.filePath;
        SaveFiles.writeFile(content, targetPath);
    }

    /**
     * 将文本内容写入文件末尾
     * @param content 文本内容
     * @param filePath 文件路径
     */
    protected writeFileEnd(content: string, filePath: string = '') {
        const targetPath = filePath ? SaveFiles.realPath(filePath) : this.filePath;
        SaveFiles.writeFileEnd(content, targetPath);
    }

    /**
     * 网络请求
     * @param url 
     */
    private async superagentGet(url: string) {
        const promise = new Promise<superagent.Response>(function (resolve, reject) {
            superagent.get(url)
                .end(function (err, res) {
                    if (!err) {
                        resolve(res);
                    } else {
                        console.log(err);
                        reject(err);
                    }
                });
        });
        return promise;
    }

    /**
     * 网络请求
     * @param url 
     */
    private async axiosGet(url: string) {
        const promise = new Promise(function (resolve, reject) {
            axios.get(url).then((res: any) => {
                resolve(res.data);
            }, (err: any) => {
                reject(err);
            });
        });
        return promise;
    }

    /**
     * 异步获取html文本内容
     */
    protected async getHtml(url: string): Promise<any> {
        if (this.webLib == TypeWebGet.SUPERAGENT) {
            const res = await this.superagentGet(url);
            return res.text;
        } else {
            const res = await this.axiosGet(url);
            return res;
        }
    }

    /**
     * 异步处理获取到的html文本
     * （构造函数直接调用）
     */
    protected async dealHtmlContent() {
        const htmlContent: any = await this.getHtml(this.url);
        const $ = cheerio.load(htmlContent);
        const fileContent = this.handleData($);
        this.writeFile(fileContent);
    }
}