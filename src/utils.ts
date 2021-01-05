
/**
 * 简单的json存储对象
 */
export interface DataJson {
    [propName: string]: any
}

/**
 * 目录对象
 */
export interface CatalogData {
    标题: string,
    网址: string,
    idx: number
}

export namespace utils {

    /**
     * 格式化日期字符串
     * @param time 时间数值字符串
     * @param format 格式化样式
     */
    export function formatDate(time: string = "", format = 'YYYY-MM-DD HH:mm:ss'): string {
        let date: Date;
        if (time && time.length > 0) {
            date = new Date(parseInt(time) * 1000);
        } else {
            date = new Date();
        }

        let obj: DataJson = {
            YYYY: date.getFullYear(),
            MM: ('0' + (date.getMonth() + 1)).slice(-2),
            DD: ('0' + date.getDate()).slice(-2),
            HH: ('0' + date.getHours()).slice(-2),
            mm: ('0' + date.getMinutes()).slice(-2),
            ss: ('0' + date.getSeconds()).slice(-2),
            w: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
            YY: ('' + date.getFullYear()).slice(-2),
            M: date.getMonth() + 1,
            D: date.getDate(),
            H: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds()
        };

        Object.keys(obj).forEach((key: string) => {
            format = format.replace(key, obj[key]);
        });
        return format;
    }

    /**
     * 线程暂停n秒
     * @param senconds 秒
     */
    export async function asleep(senconds: number) {
        // 连续网络请求增加延时增量值
        const time = (senconds + sleepDlt) * 1000;
        sleepDlt += senconds / 5;
        if (sleepDlt >= 10 * senconds)
            sleepDlt = 0;
        new Promise(resolve => setTimeout(resolve, time));
    }
    let sleepDlt: number = 0;

    /**
     * 目录中文数字转阿拉伯数字
     * @param str 源字符串
     * @param regExp 匹配规则；默认：第xxx章
     * @returns -1为无效章节
     */
    export function chinese2Number(text: string, regExp: { [Symbol.match](string: string): RegExpMatchArray | null; } = /第(\S*)[章|回]/): number {
        // 预处理目录字符串
        let tempText = text.trim();
        if (!tempText || tempText.length == 0) return -1;
        const testMatch = tempText.match(regExp);
        tempText = testMatch != null ? testMatch[1] : "";
        if (!tempText || tempText.length == 0) return -1;

        // 繁体字兼容处理
        const chnNumChar: DataJson = {
            零: 0,
            一: 1,
            二: 2,
            三: 3,
            四: 4,
            五: 5,
            六: 6,
            七: 7,
            八: 8,
            九: 9,
            壹: 1,
            贰: 2,
            叁: 3,
            肆: 4,
            伍: 5,
            陆: 6,
            柒: 7,
            捌: 8,
            玖: 9
        };
        const chnNameValue: DataJson = {
            十: { value: 10, secUnit: false },
            拾: { value: 10, secUnit: false },
            百: { value: 100, secUnit: false },
            佰: { value: 100, secUnit: false },
            千: { value: 1000, secUnit: false },
            仟: { value: 1000, secUnit: false },
            前: { value: 1000, secUnit: false },    // 错别字兼容处理
            万: { value: 10000, secUnit: true },
            萬: { value: 10000, secUnit: true },
            亿: { value: 100000000, secUnit: true },
            億: { value: 100000000, secUnit: true }
        };

        let rtn = 0;
        let section = 0;
        let number = 1; // 默认值改为1（一十一，一般写作 十一）
        const str: string[] = tempText.split('');

        for (let i = 0; i < str.length; i++) {
            const tag: string = str[i];
            const num = chnNumChar[tag];
            if (typeof num !== 'undefined') {
                number = num;
                if (i === str.length - 1) {
                    section += number;
                }
            } else {
                const unit = chnNameValue[tag].value;
                const secUnit = chnNameValue[tag].secUnit || false;
                if (secUnit) {
                    section = (section + number) * unit;
                    rtn += section;
                    section = 0;
                } else {
                    section += (number * unit);
                }
                number = 1;
            }
        }
        // console.log(text + ' => 字符串截取有效值 => ' + tempText + " : " + (rtn + section).toString());
        return rtn + section;
    }

    /**
     * 校验书籍目录是否连续有效
     * @param list 目录信息数组
     */
    export function checkCatalogContinuously(list: CatalogData[]): boolean {
        if (!list || list.length == 0) {
            console.log("待检测目录列表为空！");
            return false;
        }
        let startIdx = 0;
        for (const cata of list) {
            if (cata) {
                startIdx = cata.idx;
                break;
            }
        }
        if (startIdx > 1) {
            console.log("待检测目录列表,起始章节错误！");
            return false;
        }

        const listLength = list.length;
        const cataLength = list[listLength - 1].idx - startIdx + 1;
        if (cataLength == listLength) {
            console.log(`目录检测完毕！共${cataLength}条目录。`);
            return true;
        } else {
            let isContinously = true;
            let wantIdx = startIdx;    // 初始化检测值
            for (const cata of list) {
                if (!cata) continue;
                const delta = cata.idx - wantIdx;
                if (delta == 0) {
                    wantIdx++;
                }
                else if (delta <= -1) {
                    // 出现重复章节
                    console.log('出现重复章节: ', cata.标题);
                    isContinously = false;
                }
                else if (delta >= 1) {
                    // 缺失章节
                    console.log(`缺失第${wantIdx}${(delta > 1) ? ("-" + (wantIdx + delta)) : ""}章节`);
                    wantIdx = cata.idx + 1;
                    isContinously = false;
                }
            }
            if (isContinously)
                console.log(`目录检测完毕！共${cataLength}条目录。`);
            return isContinously;
        }
    }

}
