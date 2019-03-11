// ==UserScript==
// @name         巴哈姆特哈拉區頂端列顯示檢舉數提醒與各板檢舉數
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      3.0
// @description  於巴哈姆特哈拉區頂端列顯示檢舉數提醒與各板檢舉數
// @author       moontai0724
// @match        https://*.gamer.com.tw/*
// @match        http://*.gamer.com.tw/*
// @connect      forum.gamer.com.tw
// @resource     topBarCss https://raw.githubusercontent.com/moontai0724/UserScripts/master/BMHelp_TopBarAccuseNum.css
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';
    if (BAHAID) {
        GM_addStyle(GM_getResourceText("topBarCss"));

        // 切換顯示
        var switchDisplay = function switchDisplay(id) {
            // 原生的按鈕如果有開啟視窗的話關閉
            jQuery("[class*='topbnow']").removeClass('topbnow').removeClass('topbnow1').removeClass('topbnow2').removeClass('topbnow3');
            jQuery(".TOP-msg[style*='display: block;']").each((index, element) => element.style.display = 'none');

            // 關閉滑鼠不在上方的顯示
            jQuery('#BMHelp_TopBarAccuseNum .nomouse').removeClass('nowshow');

            // 切換顯示
            document.getElementById(`BMHelp_TopBarAccuseNum_${id}`).classList.toggle('nowshow');
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
            jQuery('#BMHelp_TopBarAccuseNum').append(`<div id="BMHelp_TopBarAccuseNum_${list[i].id}" onmouseenter="javascript:jQuery(this).removeClass('nomouse');" onmouseleave="javascript:jQuery(this).addClass('nomouse');" class="nomouse"></div>`);
            // 新增 icon
            let icon = document.createElement('a');
            icon.id = `BMHelp_TopBarAccuseNum_${list[i].id}_Btn`;
            icon.href = 'javascript:;';
            icon.setAttribute('class', 'AccuseBtn');
            icon.setAttribute('onclick', `javascript:switchDisplay("${list[i].id}");`);
            document.getElementById(`BMHelp_TopBarAccuseNum_${list[i].id}`).appendChild(icon);

            // 新增列表
            let info = document.createElement('div');
            info.id = `BMHelp_TopBarAccuseNum_${list[i].id}_Info`;
            info.setAttribute('class', 'AccuseInfo');
            info.innerHTML = `<span>${list[i].name}檢舉</span><div id="BMHelp_TopBarAccuseNum_${list[i].id}_List" class="AccuseList"></div><p class="TOP-msgbtn"><a href="${list[i].href}" target="_blank">看所有${list[i].name}檢舉</a></p>`;
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
    function addFunction(FunctionCode) {
        jQuery('body').append('<script type="text/javascript">' + FunctionCode + '</script>');
    }

    // 獲取檢舉數
    function setAccuseNum() {
        for (let i = 0; i < 3; i++) {
            GetAccuseCount(list[i].t).then(data => {
                // reset
                document.getElementById(`BMHelp_TopBarAccuseNum_${list[i].id}_Btn`).innerHTML = '';
                document.getElementById(`BMHelp_TopBarAccuseNum_${list[i].id}_List`).innerHTML = '';
                jQuery(`#BMHelp_TopBarAccuseNum_${list[i].id}_Btn`).removeClass('HasAccuse');

                // 當有檢舉案就加入
                for (let board = 0; board < data.data.length; board++) {
                    let AccuseList = document.createElement('div');
                    AccuseList.innerHTML = `<a href="${list[i].href}&bsn=${data.data[board].bsn}" target="_blank">在 ${data.data[board].title} 哈拉板有 ${data.data[board].count} 則檢舉案。</a>`;
                    document.getElementById(`BMHelp_TopBarAccuseNum_${list[i].id}_List`).appendChild(AccuseList);
                }

                // 當沒有檢舉案就顯示沒有，有檢舉案時加入數字
                if (data.total > 0) {
                    document.getElementById(`BMHelp_TopBarAccuseNum_${list[i].id}_Btn`).innerHTML = `<span>${data.total}</span>`;
                    jQuery(`#BMHelp_TopBarAccuseNum_${list[i].id}_Btn`).addClass('HasAccuse');
                } else document.getElementById(`BMHelp_TopBarAccuseNum_${list[i].id}_List`).innerHTML = `<div>太棒了！這裡沒有任何檢舉案。</div>`;
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
                method: "POST",
                url: "https://forum.gamer.com.tw/ajax/BMaccuse_menu_2k14.php",
                cache: false,
                data: `t=${t}&s=1&n=1`,
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