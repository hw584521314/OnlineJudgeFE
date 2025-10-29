<template>
    <div id="app" class="typing-app">
        <!-- 添加在 <div id="app" class="typing-app"> 内部，但放在 header 之前或之后均可 -->
        <div v-show="showKeyMap&&isPracticing" >
            <div class="draggable-image" id="left_pic">
                <img :src="left_pic" alt="左手" />
            </div>
            <div class="draggable-image" id="right_pic">
                <img :src="right_pic" alt="右手" />
            </div>
        </div>
        <div class="header">
            <h1>打字练习</h1>
            <h2>编程的基本功就是要能打字啊 --<span style="font-size: small;">某老师如是说</span></h2>
            <h3 style="color:rgb(43, 31, 31)">目标：TPM>=250,正确率>=85%</h3>
        </div>

        <div class="control-panel">
            <div>
                <i-select v-model="timeLimit" style="width:150px" placeholder="选择时间限制"> 
                    <i-option value="1">1分钟</i-option>                   
                    <i-option value="3">3分钟</i-option>
                    <i-option value="5">5分钟</i-option>
                    <i-option value="10">10分钟</i-option>
                    <i-option value="20">20分钟</i-option>
                </i-select>
                <i-button type="primary" @click="startPractice" :disabled="isPracticing">开始练习</i-button>
                <i-button @click="resetPractice">重置</i-button>
            </div>
            <div>
                <i-button @click="changeKeyMap">{{ showKeyMap ? '隐藏键位' : '显示键位' }}</i-button>
                <i-button @click="changeArticle">更换文章</i-button>
            </div>
        </div>
        <div class="floating-stats-timer">
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-label">正确率</div>
                    <div class="stat-value">{{ accuracy }}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">TPM</div>
                    <div class="stat-value">{{ tpm }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">总击键数</div>
                    <div class="stat-value">{{ totalKeystrokes }}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">错误数</div>
                    <div class="stat-value">{{ errorCount }}</div>
                </div>
            </div>

            <div class="timer" :class="{ 'warning': timeLimitInSeconds - timeElapsed < 30 }" v-if="isPracticing">
                {{ formattedTime }}
            </div>
        </div>
        <div class="typing-container">
            <!-- 交错显示：原文行和输入行交替 -->
            <div v-for="(line, index) in displayLines" :key="index" 
                 :class="['my-text-block', line.type === 'source' ? 'source-line' : 'input-line', 
                         { 'active':  isCurrentLine(index) }]">
                <span v-for="(char, charIndex) in line.chars" :key="charIndex" 
                      :class="['char', getCharClass(line, charIndex)]">{{ char }}</span>
                <!-- <span class="char current" v-if="line.type === 'input' && isCurrentLine(index) && currentPosition === line.chars.length">|</span> -->
            </div>
            
            <!-- 隐藏的输入框 -->
            <textarea class="input-area" 
                      v-model="userInput" 
                      @input="handleInput"
                      @keydown="handleKeydown"
                      :disabled="!isPracticing || isFinished"
                      ref="typingInput"></textarea>
        </div>

        <Modal v-model="showResult" title="练习结果" :closable="false" :mask-closable="false">
            <p><strong>时间:</strong> {{ timeLimit }} 分钟</p>
            <p><strong>正确率:</strong> {{ accuracy }}%</p>
            <p><strong>TPM:</strong> {{ tpm }}</p>
            <p><strong>总击键数:</strong> {{ totalKeystrokes }}</p>
            <p><strong>错误数:</strong> {{ errorCount }}</p>
            <div slot="footer">
                <i-button type="primary" @click="showResult = false; resetPractice();">再来一次</i-button>
                <i-button type="primary" @click="showResult = false; submitResult();">提交结果</i-button>
            </div>
        </Modal>

        <div class="footer">
            <p>大数据工程技术专业 &copy; 祝你早日达标</p>
        </div>
    </div>
</template>
<script >
import left from '@/assets/Typing/left.png';
import left1 from '@/assets/Typing/left1.png';
import left2 from '@/assets/Typing/left2.png';
import left3 from '@/assets/Typing/left3.png';
import left4 from '@/assets/Typing/left4.png';
import left5 from '@/assets/Typing/left5.png';

import right from '@/assets/Typing/right.png';
import right1 from '@/assets/Typing/right1.png';
import right2 from '@/assets/Typing/right2.png';
import right3 from '@/assets/Typing/right3.png';
import right4 from '@/assets/Typing/right4.png';
import right5 from '@/assets/Typing/right5.png';

import api from '@oj/api'

export default{
    name: 'Typing',
    data() {
        return {
                articles: [
                    `Once upon a time a little girl tried to make a living by selling matches in the \
street. It was New Year's Eve and the snowed streets were deserted. From brightly \
lit windows came the tinkle of laughter and the sound of singing. People were \
getting ready to bring in the new year. But the poor little match seller sat \
sadly beside the fountain. Her ragged dress and worn shawl did not keep out the \
cold and she tried to keep her bare feet from touching the frozen ground. She \
hadn't sold one box of matches all day and she was frightened to go home, for \
her father would certainly be angry. It didn't occur to her that she might be \
the one to be angry, for it wasn't her fault that she'd been born into poverty.`,
                    
                    `The quick brown fox jumps over the lazy dog. This classic pangram contains every \
letter in the English alphabet, making it perfect for typing practice. Typing \
is an essential skill in today's digital world, and regular practice can \
significantly improve your speed and accuracy. Whether you're a student, \
professional, or simply someone who spends time on a computer, improving your \
typing skills can save you time and increase your productivity.`,
                    
                    `Programming is the process of creating a set of instructions that tell a computer \
how to perform a task. Programming can be done using many programming languages \
such as JavaScript, Python, Java, and C++. Each language has its own syntax and \
use cases, but they all share the common goal of solving problems through \
logical thinking and algorithmic design. Learning to program opens up a world \
of possibilities in software development, data analysis, and technology innovation.`
                ],
                articleKeyMaps:{},
                currentArticleIndex: 0,
                userInput: '',
                timeLimit: '5',
                timer: null,
                timeElapsed: 0,
                isPracticing: false,
                isFinished: false,
                showResult: false,
                startTime: null,
                totalKeystrokes: 0,
                errorCount: 0,
                sourceLines: [],
                inputLines: [],
                showKeyMap: false
            }
        },
            computed: {
                article() {
                    return this.articles[this.currentArticleIndex];
                },
                displayLines() {
                    const lines = [];
                    
                    // 获取最大行数（原文行数）
                    const maxLines = this.sourceLines.length;
                    
                    // 交错显示原文行和输入行
                    for (let i = 0; i < maxLines; i++) {
                        // 原文行
                        if (i < this.sourceLines.length) {
                            lines.push({
                                type: 'source',
                                chars: this.sourceLines[i].split('')
                            });
                        }
                        
                        // 对应的输入行 - 始终生成
                        if (this.inputLines[i]) {
                            // 如果已经有输入内容，使用实际内容
                            lines.push({
                                type: 'input',
                                chars: this.inputLines[i].split('')
                            });
                        } else {
                            // 否则生成空的输入行
                            lines.push({
                                type: 'input',
                                chars: []
                            });
                        }
                    }
                    
                    return lines;
                },
                currentPosition() {
                    if (this.inputLines.length === 0) return 0;
                    return this.userInput.split('\n').pop().length;
                },
                accuracy() {
                    if (this.totalKeystrokes === 0) return 0;
                    return Math.round(((this.totalKeystrokes - this.errorCount) / this.totalKeystrokes) * 100);
                },
                tpm() {
                    if (this.timeElapsed === 0) return 0;
                    const minutes = this.timeElapsed / 60;
                    return Math.round(this.totalKeystrokes / minutes);
                },
                formattedTime() {
                    // 计算剩余时间（秒）
                    const remainingSeconds = this.timeLimitInSeconds - this.timeElapsed;
                    
                    // 确保不会出现负数
                    const displaySeconds = Math.max(0, remainingSeconds);
                    
                    // 转换为分钟和秒数
                    const minutes = Math.floor(displaySeconds / 60);
                    const seconds = displaySeconds % 60;
                    
                    // 格式化显示
                    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                },
                timeLimitInSeconds() {
                    return parseInt(this.timeLimit) * 60;
                },
                left_pic(){
                    //根据当前待输入字符，设置对应左手的图片
                    
                    const char = this.getCurrentChar();
                    if (!char) return left; // 默认图
                    return this.articleKeyMaps['left'][char] || left;
                    
                },
                right_pic(){
                    //根据当前待输入字符，设置对应左手的图片
                    
                    const char = this.getCurrentChar();
                    if (!char) return right;
                    return this.articleKeyMaps['right'][char] || right;
                },
            },
            methods: {
                // 获取当前应该输入的字符（即 sourceLines 中尚未输入的部分）
                getCurrentChar() {
                    if(this.isPracticing===false) return null;
                    const inputLines = this.userInput.split('\n');
                    const sourceLines = this.sourceLines;

                    // 找到当前输入行索引
                    const inputLineIndex = inputLines.length - 1;
                    const sourceLineIndex = Math.min(inputLineIndex, sourceLines.length - 1);

                    // 如果当前行已完全输入，则取下一行的第一个字符
                    const inputLine = inputLines[inputLineIndex];
                    const sourceLine = sourceLines[sourceLineIndex];

                    // 如果当前行还没打完，取下一个字符
                    if (inputLine.length < sourceLine.length) {
                        return sourceLine[inputLine.length];
                    }

                    // 如果当前行已打完，取下一行第一个字符
                    if (sourceLineIndex + 1 < sourceLines.length) {
                        return sourceLines[sourceLineIndex + 1][0];
                    }

                    return null; // 没有更多字符了
                },

                // 添加自动换行方法
                autoWrapText(text, charsPerLine = 80) {
                    const lines = [];
                    const paragraphs = text.split('\n');
                    
                    paragraphs.forEach(paragraph => {
                        if (paragraph.trim() === '') {
                            lines.push('');
                            return;
                        }
                        
                        // 按指定字符数拆分行
                        let currentLine = '';
                        const words = paragraph.split('');
                        
                        for (let i = 0; i < words.length; i++) {
                            // 如果当前行加上下一个字符超过限制，则换行
                            if (currentLine.length >= charsPerLine) {
                                lines.push(currentLine);
                                currentLine = words[i];
                            } else {
                                currentLine += words[i];
                            }
                        }
                        
                        // 添加最后一行（如果有的话）
                        if (currentLine !== '') {
                            lines.push(currentLine);
                        }
                    });
                    
                    return lines;
                },
                // 或者使用更智能的基于单词的换行方法
                autoWrapTextByWords(text, charsPerLine = 80) {
                    const lines = [];
                    const paragraphs = text.split('\n');
                    
                    paragraphs.forEach(paragraph => {
                        if (paragraph.trim() === '') {
                            lines.push('');
                            return;
                        }
                        
                        const words = paragraph.split(' ');
                        let currentLine = '';
                        
                        words.forEach(word => {
                            // 检查添加这个单词是否会超过行限制
                            const testLine = currentLine === '' ? word : currentLine + ' ' + word;
                            
                            if (testLine.length > charsPerLine && currentLine !== '') {
                                // 如果超过限制且当前行不为空，则换行
                                lines.push(currentLine);
                                currentLine = word;
                            } else if (currentLine === '') {
                                // 如果当前行为空，即使是长单词也要添加
                                currentLine = word;
                            } else {
                                // 否则添加单词到当前行
                                currentLine = testLine;
                            }
                        });
                        
                        // 添加最后一行（如果有的话）
                        if (currentLine !== '') {
                            lines.push(currentLine);
                        }
                    });
                    
                    // 处理超长行的进一步拆分
                    const finalLines = [];
                    lines.forEach(line => {
                        if (line.length > charsPerLine) {
                            // 对超长行按字符拆分
                            for (let i = 0; i < line.length; i += charsPerLine) {
                                finalLines.push(line.substring(i, i + charsPerLine));
                            }
                        } else {
                            finalLines.push(line);
                        }
                    });
                    
                    return finalLines;
                },
                startPractice() {
                    this.isPracticing = true;
                    this.isFinished = false;
                    this.userInput = '';
                    this.timeElapsed = 0;
                    this.totalKeystrokes = 0;
                    this.errorCount = 0;
                    this.startTime = new Date();
                    
                    // 使用自动换行处理原文
                    this.sourceLines = this.autoWrapTextByWords(this.article, 80); // 每行最多70个字符
                    // 初始化输入行为对应数量的空字符串
                    this.inputLines = Array(this.sourceLines.length).fill('');
                    
                    // 启动计时器
                    this.timer = setInterval(() => {
                        this.timeElapsed++;
                        
                        // 检查是否超时
                        if (this.timeElapsed >= this.timeLimitInSeconds) {
                            this.finishPractice();
                        }
                    }, 1000);
                    
                    // 聚焦到输入框
                    this.$nextTick(() => {
                        this.$refs.typingInput.focus();
                    });
                },
                resetPractice() {
                    this.isPracticing = false;
                    this.isFinished = false;
                    this.userInput = '';
                    this.timeElapsed = 0;
                    this.totalKeystrokes = 0;
                    this.errorCount = 0;
                    this.sourceLines = [];
                    this.inputLines = [];
                    clearInterval(this.timer);
                },
                changeKeyMap(){
                    this.showKeyMap = !this.showKeyMap;
                },
                finishPractice() {
                    this.isFinished = true;
                    this.isPracticing = false;
                    clearInterval(this.timer);
                    this.showResult = true;
                },
                handleInput() {
                    if (!this.isPracticing && this.userInput.length > 0) {
                        this.startPractice();
                        // 初始化后再更新输入行
                        this.$nextTick(() => {
                            this.inputLines = this.userInput.split('\n');
                        });
                        return;
                    }
                    
                    // 更新统计数据
                    this.totalKeystrokes++;
                    
                    // 将用户输入按行分割
                    this.inputLines = this.userInput.split('\n');
                    
                    // 检查当前字符是否正确
                    const lines = this.userInput.split('\n');
                    const currentLineIndex = lines.length - 1;
                    const currentCharIndex = lines[currentLineIndex].length - 1;
                    
                    if (currentCharIndex >= 0 && 
                        this.sourceLines[currentLineIndex] && 
                        lines[currentLineIndex][currentCharIndex] !== this.sourceLines[currentLineIndex][currentCharIndex]) {
                        this.errorCount++;
                    }
                    
                    // 检查是否完成
                    if (this.userInput === this.article) {
                        this.finishPractice();
                    }
                },
                handleKeydown(e) {
                    // 阻止退格键删除超过当前输入位置的内容
                    if (e.key === 'Backspace' && this.userInput.length === 0) {
                        e.preventDefault();
                    }
                    
                    // 处理回车键
                    if (e.key === 'Enter') {
                        this.totalKeystrokes++; // 回车键也算一次击键
                    }
                },
                getCharClass(line, charIndex) {
                    if (line.type === 'input') {
                        const lineIndex = Math.floor(this.displayLines.findIndex(l => l === line) / 2);
                        
                        if (lineIndex < this.sourceLines.length && 
                            charIndex < this.sourceLines[lineIndex].length) {
                            return line.chars[charIndex] === this.sourceLines[lineIndex][charIndex] ? 'correct' : 'incorrect';
                        } else if (charIndex >= (this.sourceLines[lineIndex] || '').length) {
                            return 'incorrect';
                        }
                    }
                    return '';
                },
                isCurrentLine(lineIndex) {
                    // 检查是否是当前输入行
                    const inputLineIndex = Math.floor(lineIndex / 2);
                    // 当没有输入时，默认选中第一行；有输入时根据实际输入行判断
                    if (this.userInput.length === 0 && this.isPracticing) {
                        return inputLineIndex === 0;
                    }
                    return inputLineIndex === this.inputLines.length - 1;
                },
                changeArticle() {
                    this.currentArticleIndex = (this.currentArticleIndex + 1) % this.articles.length;
                    this.resetPractice();
                },
                //提交结果
                submitResult(){
                    api.submitTypingResult({
                        practice_minutes: this.timeLimit,
                        accuracy: this.accuracy,
                        tpm: this.tpm,
                        total_hit: this.totalKeystrokes,
                        error_hit: this.errorCount,
                        
                    }).then(response=>{
                        //console.log(response.data)
                        let data = response.data;                        
                        this.$Message.success(data.data);
                        this.resetPractice();
                    }).catch(error=>{
                        this.$Message.error('结果提交失败');
                    });
                },
                setupDraggableImages() {
                    const images = document.querySelectorAll('.draggable-image');
                    images.forEach(img => {
                        let isDragging = false;
                        let offsetX, offsetY;

                        img.addEventListener('mousedown', (e) => {
                            isDragging = true;
                            offsetX = e.clientX - img.getBoundingClientRect().left;
                            offsetY = e.clientY - img.getBoundingClientRect().top;
                            img.style.zIndex = 1000; // 提升层级
                        });

                        document.addEventListener('mousemove', (e) => {
                            if (!isDragging) return;
                            const x = e.clientX - offsetX;
                            const y = e.clientY - offsetY;
                            img.style.left = `${x}px`;
                            img.style.top = `${y}px`;
                        });

                        document.addEventListener('mouseup', () => {
                            isDragging = false;
                            img.style.zIndex = 999;
                        });
                    });
                }
            },
            mounted() {
                // 初始化
                this.resetPractice();
                this.setupDraggableImages(); // 初始化拖拽
                //初始化字符和图片的映射表articleKeyMaps
                //遍历a-z,0-9和常用符号，将对应符号键盘所需的手指图片映射到articleKeyMaps中
                //左手从小手指到大拇指的图片分别为left1-5,右手同理为right1-5
                this.articleKeyMaps['left'] = {};
                this.articleKeyMaps['right'] = {};

                const left1Keys = ['`','1','q','a','z','Q','A','Z'];
                for (let i = 0; i < left1Keys.length; i++) {
                    this.articleKeyMaps['left'][left1Keys[i]] = left1;
                }
                const left2Keys = ['2','w','s','x','W','S','X'];
                for (let i = 0; i < left2Keys.length; i++) {
                    this.articleKeyMaps['left'][left2Keys[i]] = left2;
                }
                const left3Keys = ['3','e','d','c','E','D','C'];
                for (let i = 0; i < left3Keys.length; i++) {
                    this.articleKeyMaps['left'][left3Keys[i]] = left3;
                }
                const left4Keys = ['4','r','f','v','R','F','V','5','t','g','b','T','G','B'];
                for (let i = 0; i < left4Keys.length; i++) {
                    this.articleKeyMaps['left'][left4Keys[i]] = left4;
                }
                const left5Keys = [' '];
                for (let i = 0; i < left5Keys.length; i++) {
                    this.articleKeyMaps['left'][left5Keys[i]] = left5;
                }
                const right5Keys = [' '];
                for (let i = 0; i < right5Keys.length; i++) {
                    this.articleKeyMaps['right'][right5Keys[i]] = right5;
                }
                const right4Keys = ['6','y','h','n','Y','H','N','7','u','j','m','U','J','M'];
                for (let i = 0; i < right4Keys.length; i++) {
                    this.articleKeyMaps['right'][right4Keys[i]] = right4;
                }
                const right3Keys = ['8','i','k',',','I','K','<'];
                for (let i = 0; i < right3Keys.length; i++) {
                    this.articleKeyMaps['right'][right3Keys[i]] = right3;
                }
                const right2Keys = ['9','o','l',';','/','O','L',':','>'];
                for (let i = 0; i < right2Keys.length; i++) {
                    this.articleKeyMaps['right'][right2Keys[i]] = right2;
                }
                const right1Keys = ['0','p','.',']',"'",'\\','-','=','[','{','}','+','_','?'];
                for (let i = 0; i < right1Keys.length; i++) {
                    this.articleKeyMaps['right'][right1Keys[i]] = right1;
                }
            },
            beforeDestroy() {
                clearInterval(this.timer);
            }
        }

</script>
<style lang="less">
* {
            margin: 0;
            padding: 0;
            box-sizing: content-box; 
            
        }
        body {
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .typing-app {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2d8cf0 0%, #19be6b 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin-bottom: 10px;
            font-size: 28px;
        }
        .header p {
            opacity: 0.9;
        }
        .control-panel {
            display: flex;
            justify-content: space-between;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e8eaec;
            flex-wrap: wrap;
        }
        .floating-stats-timer {
            position: fixed;
            bottom: 20px;
            right: 20px;
            /* transform: translateY(-50%); */
            z-index: 1000;
            width: 250px;
        }
        .stats {
            display: flex-column;
            
            gap: 15px;
            padding: 10px 0;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 10px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #2d8cf0;
            margin: 5px 0;
        }
        .stat-label {
            font-size: 14px;
            color: #808695;
        }
        .typing-container {
            /*等宽字体*/
			font-family:  Consolas,Monaco,  'Courier New',monospace;
            padding: 20px;
            position: relative;
            min-height: 400px;
        }
        .my-text-block {
            line-height: 2.0;
            font-size: 18px;
			font-weight: bold;
            white-space: pre-wrap;
            word-wrap: break-word;
            word-break: break-all; /* 添加这行以更好地处理长单词 */
            /* margin-bottom: 10px; */
        }
        .source-line {
            color: #495060;
            padding: 5px 0;
        }
		.source-line.active{
			border-left: 3px solid #2d8cf0;
			padding-left: 5px;
		}
        .input-line {
            color: transparent;
            position: relative;
            z-index: 2;
            padding: 5px 0;
			border-bottom:1px solid #0055ff;
			border-radius:2px;
        }
        .input-line.active {
            background-color: #f0f7ff;
            border-left: 3px solid #2d8cf0;
            padding-left: 5px;
        }
        .char {
            display: inline-block;
            position: relative;
			
        }
        .correct {
            color: #19be6b;
        }
        .incorrect {
            color: #ed4014;
            background-color: #ffecf1;
        }
        .current {
            background-color: #000000;
            /* border: 1px solid #ff0000; */
			width:2px;
			
        }
        .input-area {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: default;
            z-index: 10;
        }
        .timer {
            font-size: 28px;
            font-weight: bold;
            color: #ff9900;
            text-align: center;
            margin: 10px 0;
            padding: 10px 0;
            background: #f6f7e1;
            border-radius: 5px;
        }
        /* 当时间少于1分钟时，显示红色警告 */
        .timer.warning {
            color: #ed4014;
            background: #ffecf1;
        }
        .footer {
            text-align: center;
            padding: 15px;
            color: #808695;
            font-size: 14px;
            background: #f8f9fa;
            border-top: 1px solid #e8eaec;
        }
        /* 使用CSS伪元素创建光标 */
        .input-line.active::after {
            content: "|";
            color: #000000;
            margin-left: 1px;
            animation: blink 1s infinite;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .separator {
            height: 1px;
            background: linear-gradient(to right, transparent, #e8eaec, transparent);
            margin: 5px 0;
        }
        /* 当屏幕宽度小于等于 1200px 时，使用正常流式布局 */
        @media (max-width: 1200px) {
            .control-panel {
                flex-direction: column;
                gap: 15px;
            }
            .floating-stats-timer {
                position: static;
                transform: none;
                width: auto;
                margin: 20px;
                right: auto;
                top: auto;
            }
            
            .stats {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .stat-card {
                flex: 1;
                min-width: 120px;
            }
            .text-block {
                font-size: 16px;
            }
        }

        .draggable-image {
            position: fixed;
            width: 200px;
            height: 200px;
            opacity: 0.9; /* 透明度 60% */
            cursor: move;
            border: 2px solid #e4dbdb; 
            border-radius: 10px;
            z-index: 999;
            overflow: hidden;
        }

        .draggable-image img {
            width: 100%;
            height: 100%;
            object-fit:fill;
        }

        #left_pic {
            left: 30px;
            top: 80px;
        }

        #right_pic {
            right: 30px;
            top: 80px;
        }
</style>