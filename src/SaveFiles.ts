import fs from 'fs';
import path from 'path';

// 文章对象;处理文本分页获取问题
export interface ContentData {
    id: number,         // 文本序号(存储先后关系)
    contents: string[], // 文本内容列表(已序)
    end: boolean        // 数据是否全部完善
}

// 文件对象;处理多个文件存储(暂不考虑文件存储性能以及效率的优化处理)
export interface FileData {
    filePath: string,       // 待存储文件绝对路径
    append: boolean,        // 是否写入文件末尾
    contents: ContentData[] // 文本对象队列
}

/**
 * 简易的队列文本存储管理类
 * ps：文件默认存储在与代码同级data目录下
 */
export default class SaveFiles {

    // 目录相对路径
    static cataLogPath: string = '../data/';

    // 单例模式
    private static instance: SaveFiles;
    static getIns(): SaveFiles {
        if (!SaveFiles.instance)
            SaveFiles.instance = new SaveFiles();
        return SaveFiles.instance;
    }

    /**
     * 文件名转文件路径
     * @param file 文件名
     */
    static realPath(file: string): string {
        return path.resolve(__dirname, SaveFiles.cataLogPath + file);
    }

    /**
     * 立即写入本地文件
     * @param content 文本字符串
     * @param filePath 文件绝对路径
     */
    static writeFile(content: string, filePath: string) {
        if (filePath && filePath.length > 0)
            fs.writeFileSync(filePath, content);
    }

    /**
     * 将文本内容写入文件末尾
     * @param content 文本内容
     * @param filePath 文件绝对路径
     */
    static writeFileEnd(content: string, filePath: string = '') {
        if (filePath && filePath.length > 0)
            fs.appendFileSync(filePath, content);
    }

    /**
     * 
     * @param content 文本内容字符串
     * @param fileName 文件名（可包含相对路径）
     */
    static quicklyWriteFile(content: string, fileName: string) {
        if (fileName && fileName.length > 0) {
            const filePath = SaveFiles.realPath(fileName);
            fs.writeFileSync(filePath, content);
        }
    }

    /**
     * 读取本地文本存储的内容
     * (目前不支持文件名搜索，需要提供正确相对路径)
     * @param fileName 文件名（可包含相对路径）
     */
    static quicklyReadFile(fileName: string): string {
        let res: string = "";
        if (!fileName || fileName.length < 1) return res;
        const filePath = SaveFiles.realPath(fileName);
        if (fs.existsSync(filePath)) {
            try {
                res = fs.readFileSync(filePath, 'utf-8');
            } catch (error) {
                console.log('error', error);
            }
        }
        return res;
    }

    /**
     * 在data目录下创建子目录
     * @param name 目录名
     */
    static async mkDataSubDir(name: string) {
        if (!name || name.length < 1) return;
        const str = SaveFiles.realPath(name);
        new Promise(resolve => fs.mkdir(str, { recursive: true }, resolve));
    }

    // 待存储文件队列
    private fileQueue: FileData[] = new Array();
    /**
     * 按照一定文件顺序写入文章内容
     * @param filePath 文件绝对路径
     * @param text 文本字符串
     * @param textID 文本序号（默认0，优先写入文件）
     * @param isEnd 是否文本全文（默认true，文本收集齐全后立即写入）
     * @param append 写入方式；默认true，写入指定文件末尾
     */
    public saveFile(filePath: string, text: string, textID: number = 0, isEnd: boolean = true, append: boolean = true) {
        if (filePath && filePath.length == 0) return;

        if (!append) {
            // 非添加到末尾的方式，会直接删除之前的数据
            SaveFiles.writeFile(text, filePath);
            // 清理待存储数据(直接全部清除)
            this.delFileInQueue(filePath);
            return;
        }

        if (this.fileQueue.length == 0 && isEnd) {
            // 无队列任务，且是完整文本，直接写入文件
            if (text && text.length > 0)    // 添加空字符串无意义
                SaveFiles.writeFileEnd(text, filePath);
            return;
        }

        if (!isEnd) {
            // 某篇文章的部分内容，写入数组记录，等全部写入再保存
        }
        else {

        }
    }

    // 获取指定文件的文章队列
    private getFileInQueue(filePath: string): FileData | null {
        for (const iter of this.fileQueue) {
            if (iter.filePath == filePath)
                return iter;
        }
        return null;
    }
    // 删除指定文件缓存对象
    private delFileInQueue(filePath: string) {
        const cnt = this.fileQueue.length
        for (let idx = cnt - 1; idx >= 0; idx--) {
            const iter = this.fileQueue[idx];
            if (iter.filePath == filePath) {
                this.fileQueue.splice(idx, 1);
                return;
            }
        }
    }
}