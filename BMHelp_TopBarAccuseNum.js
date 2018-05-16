// ==UserScript==
// @name         巴哈姆特哈拉區頂端列顯示檢舉數提醒與各板檢舉數
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      2.3
// @description  於巴哈姆特哈拉區頂端列顯示檢舉數提醒與各板檢舉數
// @author       moontai0724
// @match        https://*.gamer.com.tw/*
// @match        http://*.gamer.com.tw/*
// @connect      forum.gamer.com.tw
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    if (BAHAID) {
        addCss(`
/* 小窗 */
.TOP-bh .AccuseInfo, .BA-top .AccuseInfo {
    font-size: 13px;
    position: absolute;
    right: 100px;
    top: 35px;
    background-color: #FFF;
    border: 1px solid #117e96;
    border-top: none;
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5);
    word-break: break-all;
    word-wrap: break-word;
    z-index: 1000;
    width: 400px;
    display: none;
}

/* 小窗中的 title */
.TOP-bh .AccuseInfo > span, .BA-top .AccuseInfo > span {
    display:block;
    background-color:#249db8;
    color:#FFFFFF;
    padding:3px 10px;
}

/* 小窗中的 list */
.TOP-bh .AccuseList, .BA-top .AccuseList {
    max-height:500px;
    overflow:auto;
    -webkit-overflow-scrolling: touch;
}

/* 小窗 list 中的 a 樣式 */
.TOP-bh .AccuseList a, .BA-top .AccuseList a { color:#0055aa; }
.TOP-bh .AccuseList a:hover, .BA-top .AccuseList a:hover { color:#0055aa; }

/* 小窗 list 中的 div 樣式 */
.TOP-bh .AccuseList div, .BA-top .AccuseList div {
    padding:5px;
    border-top:1px solid #e5e5e5;
    overflow:auto;
}
.TOP-bh .AccuseList div:hover, .BA-top .AccuseList div:hover { background-color:#f6f6f6; }

/* 內頁天按鈕區塊 */
.TOP-bh #BMHelp_TopBarAccuseNum, .BA-top #BMHelp_TopBarAccuseNum {
    float: right;
    display: flex;
    box-sizing: content-box;
}

/* 內頁天按鈕 */
.TOP-bh .AccuseBtn, .BA-top .AccuseBtn {
    float: left;
    display: block;
    position: relative;
    padding: 0 6px;
    width: 25px;
    height: 35px;
    line-height: 35px;
    text-align: center;
}

/* 內頁天按鈕上檢舉數 */
.TOP-bh .AccuseBtn span, .BA-top .AccuseBtn span {
    display: block;
    position: absolute;
    top: 1px;
    left: 0px;
    border-radius: 2px;
    padding: 2px 3px;
    background-color: #FF0000;
    font-size: 12px;
    line-height: 1em;
    color: #FFF;
    -webkit-transform: scale(0.9, 0.9);
    transform: scale(0.9, 0.9);
}
.TOP-bh .AccuseBtn:before, .BA-top .AccuseBtn:before {
    display: inline-block;
    font-family: 'FontAwesome';
    font-size: 19px;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    color: #0c5d72;
}

/* 有檢舉時的按鈕樣式 */
.TOP-bh .AccuseBtn.HasAccuse:before { color: #FFF; }
.BA-top .AccuseBtn.HasAccuse:before { color: #249db8; }

/* 當 hover 按鈕時 */
.TOP-bh .AccuseBtn:hover { background: #249db8; }
.BA-top .AccuseBtn:hover { background: none; }

/* 當外層有 nowshow 時顯示 list */
.TOP-bh .nowshow > div { display: block; }
.TOP-bh .nowshow > a { background: #249db8; }

/* 當首頁外層有 nowshow 時不顯示按鈕背景，按鈕顏色顯示 #249db8 */
.BA-top .nowshow > div { display: block; }
.BA-top .nowshow a { background: none; }
.BA-top .nowshow a:before { color: #249db8; }

/* 內頁天按鈕圖樣 */
#BMHelp_TopBarAccuseNum_post_Btn:before { content: "\\f15c"; }
#BMHelp_TopBarAccuseNum_comment_Btn:before { content: "\\f0ca"; }
#BMHelp_TopBarAccuseNum_chatRoom_Btn:before { content: "\\f0e5"; }

/* 動畫瘋 */
/* 動畫瘋沒有指定字型因此加入 */
@font-face {
  font-family: 'FontAwesome';
  src: url('https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/fonts/fontawesome-webfont.eot?v=4.3.0');
  src: url('https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/fonts/fontawesome-webfont.eot?#iefix&v=4.3.0') format('embedded-opentype'), url('https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/fonts/fontawesome-webfont.woff2?v=4.3.0') format('woff2'), url('https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/fonts/fontawesome-webfont.woff?v=4.3.0') format('woff'), url('https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/fonts/fontawesome-webfont.ttf?v=4.3.0') format('truetype'), url('https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/fonts/fontawesome-webfont.svg?v=4.3.0#fontawesomeregular') format('svg');
  font-weight: normal;
  font-style: normal;
}

/* 小窗 */
.sky .AccuseInfo {
    font-size: 1.4rem;
    max-width: 400px;
    position: absolute;
    right: 0px;
    top: 37px;
    background-color: #FFF;
    border: 1px solid #00B4D8;
    border-top: none;
    box-shadow: 3px 3px 5px rgba(0, 0, 0, 0.5);
    word-break: break-all;
    word-wrap: break-word;
    z-index: 1000;
    line-height: 1.5rem;
    min-width: 320px;
    display: none;
}
@media (min-width: 1000px) {
    .sky .AccuseInfo {
        top: 52px;
        right: -50px;
    }
}

/* 小窗中的 title */
.sky .AccuseInfo > span {
    display: block;
    background-color: #00B4D8;
    color: #FFFFFF;
    padding: 8px 10px;
}

/* 小窗中的 list */
.sky .AccuseList {
    max-height: 400px;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
}

/* 小窗 list 中的 a 樣式 */
.sky .AccuseList a { color:#0055aa; }
.sky .AccuseList a:hover { color:#0055aa; }

/* 小窗 list 中的 div 樣式 */
.sky .AccuseList div {
    padding: 10px;
    border-top: 1px solid #e5e5e5;
    overflow: auto;
    font-size: 1.4rem;
}
.sky .AccuseList div:hover { background-color:#f6f6f6; }

/* 內頁天按鈕區塊 */
.sky #BMHelp_TopBarAccuseNum {
    float: right;
    display: flex;
    box-sizing: content-box;
    margin-top: 3px;
    position: relative;
}

/* 內頁天按鈕個別區塊 */
.sky #BMHelp_TopBarAccuseNum > div {
    width: 35px;
    height: 40px;
    background-size: 140px;
    font-size: 2em;
    line-height: 24px;
}
@media (min-width: 1000px) {
    .sky #BMHelp_TopBarAccuseNum > div {
        width: 35px;
        margin-right: 15px;
        font-size: 2.8em;
        line-height: 40px;
    }
}

/* 內頁天按鈕 */
.sky .AccuseBtn {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
}
.sky .AccuseBtn:before {
    display: inline-block;
    font-family: 'FontAwesome';
    font-size: 19px;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    color: #888;
}

/* 內頁天按鈕上檢舉數 */
.sky .AccuseBtn span {
    position: absolute;
    top: 0px;
    right: 2px;
    border-radius: 5px;
    background: red;
    width: 18px;
    height: 18px;
    font-size: 12px;
    line-height: 18px;
    vertical-align: middle;
    color: #fff;
    text-align: center;
    pointer-events: none;
}

/* 當 hover 按鈕時 */
.sky .AccuseBtn:hover:before { color: #333; }

/* 當外層有 nowshow 時顯示 list */
.sky .nowshow > div { display: block; }
`);

        // 切換顯示
        var switchDisplay = function switchDisplay(id) {
            // 原生的按鈕如果有開啟視窗的話關閉
            jQuery("[class*='topbnow']").removeClass('topbnow').removeClass('topbnow1').removeClass('topbnow2').removeClass('topbnow3');
            jQuery(".TOP-msg[style*='display: block;']").each((index, element) => element.style.display = 'none');

            // 關閉滑鼠不在上方的顯示
            jQuery('#BMHelp_TopBarAccuseNum .nomouse').removeClass('nowshow');

            // 切換顯示
            document.getElementById('BMHelp_TopBarAccuseNum_' + id).classList.toggle('nowshow');
        }, bodyclickevent = document.body.onclick = bodyclickevent => jQuery('#BMHelp_TopBarAccuseNum .nomouse').removeClass('nowshow');

        // 當點按鈕時關閉其他視窗與效果
        addFunction(switchDisplay);
        addFunction(bodyclickevent);

        // new
        // 在頂端列插入新區塊
        jQuery('<div id="BMHelp_TopBarAccuseNum"></div>').insertAfter(location.host == 'ani.gamer.com.tw' ? ".member" : ".TOP-btn:first");

        var list = [{
            id: 'post',
            name: '文章',
            href: 'https://forum.gamer.com.tw/gemadmin/accuse_B_2k14.php?t=2&s=1&n=1',
            t: 2
        }, {
            id: 'comment',
            name: '留言',
            href: 'https://forum.gamer.com.tw/gemadmin/accuse_commend_2k14.php?t=1&s=1&n=1',
            t: 1
        }, {
            id: 'chatRoom',
            name: '聊天室',
            href: 'https://forum.gamer.com.tw/gemadmin/accuse_im_2k14.php?t=3&s=1&n=1',
            t: 3
        }];

        for (let i = 0; i < 3; i++) {
            jQuery('#BMHelp_TopBarAccuseNum').append('<div id="BMHelp_TopBarAccuseNum_' + list[i].id + '" onmouseenter="javascript:jQuery(this).removeClass(\'nomouse\');" onmouseleave="javascript:jQuery(this).addClass(\'nomouse\');" class="nomouse"></div>');
            // 新增 icon
            let icon = document.createElement('a');
            icon.id = 'BMHelp_TopBarAccuseNum_' + list[i].id + '_Btn';
            icon.href = 'javascript:;';
            icon.setAttribute('class', 'AccuseBtn');
            icon.setAttribute('onclick', "javascript:switchDisplay('" + list[i].id + "');");
            document.getElementById('BMHelp_TopBarAccuseNum_' + list[i].id).appendChild(icon);

            // 新增列表
            let info = document.createElement('div');
            info.id = 'BMHelp_TopBarAccuseNum_' + list[i].id + '_Info';
            info.setAttribute('class', 'AccuseInfo');
            info.innerHTML = '<span>' + list[i].name + '檢舉</span><div id="BMHelp_TopBarAccuseNum_' + list[i].id + '_List" class="AccuseList"></div><p class="TOP-msgbtn"><a href="' + list[i].href + '" target="_blank">看所有' + list[i].name + '檢舉</a></p>';
            document.getElementById('BMHelp_TopBarAccuseNum_' + list[i].id).appendChild(info);
        }
        setAccuseNum();
    }

    // 自訂 functions

    // 創建 CSS 於網頁 head
    function addCss(cssCode) {
        let styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.styleSheet ? styleElement.styleSheet.cssText = cssCode : styleElement.appendChild(document.createTextNode(cssCode));
        document.getElementsByTagName('head')[0].appendChild(styleElement);
    }

    // 創建 function 於網頁 body
    // 必須要有 function 名稱及正確格式
    function addFunction(FunctionCode) { jQuery('body').append('<script type="text/javascript">' + FunctionCode + '</script>'); }

    // 獲取檢舉數
    function setAccuseNum() {
        for (let i = 0; i < 3; i++) {
            GetAccuseCount(list[i].t).then(data => {
                // reset
                document.getElementById('BMHelp_TopBarAccuseNum_' + list[i].id + '_Btn').innerHTML = '';
                document.getElementById('BMHelp_TopBarAccuseNum_' + list[i].id + '_List').innerHTML = '';
                jQuery('#BMHelp_TopBarAccuseNum_' + list[i].id + '_Btn').removeClass('HasAccuse');

                // 當有檢舉案就加入
                for (let board = 0; board < data.data.length; board++) {
                    let AccuseList = document.createElement('div');
                    AccuseList.innerHTML = '<a href="' + list[i].href + '&bsn=' + data.data[board].bsn + '" target="_blank">在 ' + data.data[board].title + ' 哈拉板有 ' + data.data[board].count + ' 則檢舉案。</a>';
                    document.getElementById('BMHelp_TopBarAccuseNum_' + list[i].id + '_List').appendChild(AccuseList);
                }

                // 當沒有檢舉案就顯示沒有，有檢舉案時加入數字
                if (data.total > 0) {
                    document.getElementById('BMHelp_TopBarAccuseNum_' + list[i].id + '_Btn').innerHTML = '<span>' + data.total + '</span>';
                    jQuery('#BMHelp_TopBarAccuseNum_' + list[i].id + '_Btn').addClass('HasAccuse');
                } else document.getElementById('BMHelp_TopBarAccuseNum_' + list[i].id + '_List').innerHTML = '<div>太棒了！這裡沒有任何檢舉案。</div>';
            });
        }
    }

    // 巴哈姆特 API

    // 獲取有檢舉案之看板編號與名稱及檢舉數
    // t 為檢舉類型，1 為留言，2 為文章，3 為聊天室
    // s 為檢舉處理狀況，1 為待處理案，2 為已結案區
    function GetAccuseCount(t) {
        return new Promise(resolve => {
            GM_xmlhttpRequest({
                method: 'POST',
                url: 'https://forum.gamer.com.tw/ajax/BMaccuse_menu_2k14.php',
                cache: false,
                data: 't=' + t + '&s=1&n=1',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                onload: data => {
                    data = JSON.parse(data.response).data;
                    let response = {
                        total: 0,
                        data: []
                    };
                    for (let key in data) {
                        response.data[response.data.length] = {
                            bsn: Number(key.replace('F:', '')),
                            title: data[key].title,
                            count: Number(data[key].num)
                        };
                        response.total += Number(data[key].num);
                    }
                    resolve(response);
                }
            });
        });
    }
})();