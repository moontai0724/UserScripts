// ==UserScript==
// @name         巴哈姆特自動簽到（含公會）
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      3.2
// @description  巴哈姆特自動簽到（含公會） by.moontai0724
// @author       moontai0724
// @match        https://*.gamer.com.tw/*
// @grant        GM_xmlhttpRequest
// @connect      www.gamer.com.tw
// @supportURL   https://home.gamer.com.tw/creationDetail.php?sn=3852242
// ==/UserScript==

(function () {
    'use strict';
    // 是否自動簽到公會？如不需要自動簽到公會，請將下方 signguild 變數 true 改為 false
    var signguild = true;

    // 作者的話：本人僅於 Chrome 上測試，照理說應能通用，但如有錯誤，將不提供其他瀏覽器的完全支援與改動。
    //          （如果有錯誤還是可以回報，也許某天會改動。）
    // ----------------------------------------------------------------------------------------------------

    // 程式開始

    var LastAutoSignTime = localStorage.getItem('LastAutoSignTime') ? Number(localStorage.getItem('LastAutoSignTime')) : 0;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDay()).getTime();
    if (!(today < LastAutoSignTime && LastAutoSignTime < today + 86400000)) {
        checkSign().then(data => {
            switch (data.signin) {
                case 1:
                    console.log("Signed", data);
                    break;
                case 0:
                    startSign().then(data => console.log(data));
                    break;
                case -1:
                    console.log("Not logged in");
                    if (location.href != 'https://user.gamer.com.tw/login.php') {
                        if (window.confirm('您尚未登入！簽到作業無法正確執行。是否立刻導向至登入網頁？')) {
                            location.href = 'https://user.gamer.com.tw/login.php';
                        }
                    }
                    break;
            }
            if (signguild && data.signin != -1) {
                GM_xmlhttpRequest({
                    method: "get",
                    url: "/ajax/topBar_AJAX.php?type=guild",
                    cache: false,
                    onload: data => {
                        data = data.response;
                        if (data != '') {
                            let guild_list = data.replace(/\n/g, '').split('</div><div>').map(value => value.split('sn=')[1].split('"')[0]);
                            console.log(guild_list, "length: " + guild_list.length);
                            guild_list.length > 0 ? (function sign(sort) {
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
                                        sort < guild_list.length - 1 ? sign(sort + 1) : (console.log('Guild sign success!'), localStorage.getItem('LastAutoSignTime', (new Date()).getTime()));
                                    }
                                })();
                            }) : console.log('No guild.');
                        }
                    }
                });
            }
        });
    }

    // days: 已連續簽到天數

    // check
    // signed: {"signin": 1,"days": xxx}
    // not signed: {"signin":0,"days":0}
    // not logged in: {"signin":-1}
    function checkSign() {
        return new Promise(function (resolve) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://www.gamer.com.tw/ajax/signin.php",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded;",
                },
                data: 'action=2',
                responseType: "json",
                cache: false,
                onload: data => resolve(data.response)
            });
        });
    }

    // sign
    // signed: {"code":-2,"message":"今天您已經簽到過了喔"}
    // not signed: {"nowd": xxx,"days": xxx,"message":"簽到成功"}
    // not logged in: {"signin":-1}
    function startSign() {
        return new Promise(function (resolve) {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://www.gamer.com.tw/ajax/get_csrf_token.php",
                cache: false,
                onload: token => GM_xmlhttpRequest({
                    method: "POST",
                    url: "https://www.gamer.com.tw/ajax/signin.php",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;",
                    },
                    data: 'action=1&token=' + token.response,
                    responseType: "json",
                    cache: false,
                    onload: data => resolve(data.response)
                })
            });
        });
    }
})();