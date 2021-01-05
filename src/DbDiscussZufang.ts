import SpiderBase, { TypeWebGet } from "./SpiderBase";
import { DataJson, utils } from "./utils";

interface DiscussInfo {
    title: string,
    url: string,
    time: string,
    name: string
}

export default class DbDiscussZufang extends SpiderBase {

    protected _filePath: string = "DbDiscussZufang.json";

    // 单例模式
    private static instance: DbDiscussZufang;
    static getIns(): DbDiscussZufang {
        if (!DbDiscussZufang.instance)
            DbDiscussZufang.instance = new DbDiscussZufang(TypeWebGet.AXIOS);

        return DbDiscussZufang.instance;
    }

    public get url(): string {
        return 'https://www.douban.com/group/szsh/discussion?start=0';
    }

    protected handleData($: any): string {
        let ary: DiscussInfo[] = new Array();
        let title = $('title').text() as string;
        title = title.replace(/\\n/gi, '').trim();
        const tr = $('.olt tr');
        const date = tr.find('.time');
        const test = tr.find('td a');
        test.each((idx: number, element: any) => {
            const title = $(element).attr('title') as string;
            if (title && title.length > 0) {
                const url = $(element).attr('href') as string;
                const disInfo: DiscussInfo = {
                    title: title.trim(),
                    url: url.trim(),
                    time: '',
                    name: ''
                };
                ary.push(disInfo);
            } else {
                const index: number = Math.floor(idx / 2);
                const name = $(element).text() as string;
                if (name)
                    ary[index].name = name;
            }
        });
        date.each((idx: number, element: any) => {
            const time = $(element).text() as string;
            if (time)
                ary[idx].time = time.trim();
        });

        let info: DataJson = {};
        info[title] = ary;
        info['writeTime'] = utils.formatDate();
        return JSON.stringify(info);
    }

}