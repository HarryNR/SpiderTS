import BQGStoryData from "./BQGStoryData";
import ChinaNCPData from "./ChinaNCPData";
import DbDiscussZufang from "./DbDiscussZufang";
import NodejsDiscuss from "./NodejsDiscuss";
import QuotesData from "./QuotesData";
import ZcoolData from "./ZcoolData";


function go() {
    // console.log(JSON.stringify(process.argv));
    // 附加命令参数
    let excmd: string = process.argv[2] || '';
    if (excmd.slice(-3) == '.js')
        excmd = process.argv[3] || '';

    switch (excmd.toLowerCase()) {
        case '0':
        case 'chinancp':
            console.log('新冠数据爬取解析.');
            ChinaNCPData.getIns();
            break;
        case '1':
        case 'zool':
            console.log('Zcool网站首页数据爬取.');
            ZcoolData.getIns();
            break;
        case '2':
        case 'douban':
            console.log('豆瓣租房讨论组数据爬取.');
            DbDiscussZufang.getIns();
            break;
        case '3':
        case 'discuss':
            console.log('nodejs论坛数据爬取.');
            NodejsDiscuss.getIns();
            break;
        case '4':
        case 'quotes':
            console.log('英文谚语数据爬取.');
            QuotesData.getIns();
            break;
        case '5':
        case 'bqg1':
            console.log('笔趣阁爬取指定的一本完整小说.');
            BQGStoryData.getIns();
            break;
        default:
            console.log('未定义操作');
            BQGStoryData.getIns();
            break;
    }
}
go();