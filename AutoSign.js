// ==UserScript==
// @name         巴哈姆特公會、首頁自動簽到
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      2.0
// @description  巴哈姆特公會、首頁自動簽到 by.moontai0724
// @author       moontai0724
// @match        https://www.gamer.com.tw/*
// @match        https://guild.gamer.com.tw/*
// @grant        GM_xmlhttpRequest
// @supportURL   https://home.gamer.com.tw/creationDetail.php?sn=3852242
// ==/UserScript==

(function () {
    'use strict';
    /* (Chrome)
    如果要開啟自動簽到，請在「設定 -> 起始畫面」中新增 https://www.gamer.com.tw/index2.php?ad=N#check
    意思為在開啟瀏覽器時，都會打開 https://www.gamer.com.tw/index2.php?ad=N#check
    當打開 https://www.gamer.com.tw/index2.php?ad=N#check 的時候，自動簽到就會開始。
    */

    // 是否自動簽到公會？如不需要自動簽到公會，請將下方 signguild 變數 true 改為 false
    var signguild = true;

    // 作者的話：本人僅於 Chrome 上測試，照理說應能通用，但如有錯誤，將不提供其他瀏覽器的完全支援與改動。
    //          （如果有錯誤還是可以回報，也許某天會改動。）
    // ----------------------------------------------------------------------------------------------------

    // 程式開始

    if (BAHAID) {
        if (location.hash == "#check") {
            window.alert = function (str) {
                return;
            };
        }
        if (location.hostname == "www.gamer.com.tw" && location.hash == "#check") {
            Signin.start(this);
            if (signguild === true) window.open("https://guild.gamer.com.tw/#check");
        } else if (location.hostname == "guild.gamer.com.tw" && location.hash == "#check" && signguild === true) {
            jQuery.ajax({
                url: "/ajax/topBar_AJAX.php?type=guild",
                method: "get",
                cache: false
            }).then(function (e) {
                $("#topBarMsg_guild").attr("className", "TOP-msg");
                e ? $("#topBarMsg_guild").html('<span>公會社團</span><!--[if (IE 7)|(IE 8)]><style type="text/css">.TOP-msglist{ max-height:450px;}</style><![endif]--><div class="TOP-msglist" id="topBarMsgList_guild"><input type="hidden" id="sendingMsg" value="0">' + e + '</div><p class="TOP-msgbtn"><a href="//home.gamer.com.tw/joinGuild.php">參加的公會社團</a><a href="//guild.gamer.com.tw">公會大廳</a><a href="//wiki2.gamer.com.tw/wiki.php?n=13710:%E5%85%AC%E6%9C%83%E7%A4%BE%E5%9C%98%E7%9A%84%E5%89%B5%E7%AB%8B&ss=13710">創建說明</a></p>') : $("#topBarMsg_guild").html('<span>公會社團</span><div class="TOP-msglist"><p style="text-align:center; padding:10px;">您還沒有加入任何公會社團喔！<br />觀看<a href="//wiki2.gamer.com.tw/wiki.php?n=13710:%E5%85%AC%E6%9C%83%E7%A4%BE%E5%9C%98%E7%9A%84%E5%89%B5%E7%AB%8B&ss=13710" target="_blank">創建說明</a>或前往<a href="//guild.gamer.com.tw/" target="_blank">公會大廳</a></p></div>');
                let guild_list = jQuery("#topBarMsg_guild .TOP-msgpic").map((sort, element) => element.search.replace('?sn=', ''));
                console.log(guild_list, "length: " + guild_list.length);
                guild_list.length > 0 ? setTimeout(function sign(sort) {
                    sort = sort ? sort : 0;
                    GM_xmlhttpRequest({
                        method: 'POST',
                        url: 'https://guild.gamer.com.tw/ajax/guildSign.php',
                        cache: false,
                        data: 'sn=' + guild_list[sort],
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        onload: data => {
                            console.log("signed: ", guild_list[sort]);
                            sort < guild_list.length - 1 ? sign(sort + 1) : console.log('success');
                        }
                    });
                }) : console.log('success');
            });
        }
    } else if (location.hash == "#check") {
        let newAlert_mask = document.createElement('div');
        newAlert_mask.id = 'newAlert_mask';
        newAlert_mask.setAttribute("onmousedown", "javascript:if(!jQuery(this).hasClass('mouseenter')) jQuery(\'#newAlert_mask\').remove();");
        newAlert_mask.style = 'background-color: rgba(0, 0, 0, 0.5); z-index: 95; position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; width: 100%; height: 100%; padding-top: 35px; display: flex; align-items: center; justify-content: center; justify-content: center; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;';
        document.body.appendChild(newAlert_mask);
        document.getElementById('newAlert_mask').innerHTML =
            '<div class="BH-popup" style="max-height: 90%; max-width: 90%; height: 80%; width: 80%; overflow: hidden;" onmouseenter="javascipt:jQuery(this.parentNode).addClass(\'mouseenter\');" onmouseleave="javascipt:jQuery(this.parentNode).removeClass(\'mouseenter\');"">' +
            '<p class="BH-poptitle" style="height: 20%; overflow: hidden; display: flex; align-items: center; justify-content: center; line-height:80px; font-size: 50px; font-family: \'微軟正黑體\', Microsoft JhengHei, \'黑體 - 繁\', \'蘋果儷中黑\', sans-serif;">' + '您尚未登入！' + '</p>' +
            '<div class="BH-popintxt" style="height: 70%; overflow: auto; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; display: flex; align-items: center; justify-content: center; justify-content: center;"><div style="text-align: center; word-break: break-all; line-height: 60px; font-size: 40px; font-family: \'微軟正黑體\', Microsoft JhengHei, \'黑體-繁\', \'蘋果儷中黑\', sans-serif;">' +
            '簽到腳本無法進行簽到作業。<br>請登入後重新打開瀏覽器。<br>（或 <a href="https://www.gamer.com.tw/#check" target="_blank">https://www.gamer.com.tw/#check</a>）' +
            '</div></div><p class="BH-popbtns" style="height: 10%; display: flex; align-items: center; justify-content: center;"><button onclick="javascript:window.location.replace(\'https://user.gamer.com.tw/login.php\');" style="height: 90%; width: 20%; font-size: 30px;">OK</button></p></div>';
        alert("您尚未登入！");
    }
})();