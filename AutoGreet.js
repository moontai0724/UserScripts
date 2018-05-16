// ==UserScript==
// @name         巴哈姆特打招呼小工具
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      1.1
// @description  在巴哈姆特對好友、訂閱者或來訪的巴友打招呼
// @author       moontai0724
// @match        https://home.gamer.com.tw/broadcastMore.php*
// @match        https://home.gamer.com.tw/friendMore.php*
// @match        https://home.gamer.com.tw/friend.php*
// @grant        none
// @supportURL   https://home.gamer.com.tw/moontai0724
// ==/UserScript==

(function () {
    'use strict';
    // 例外名單，若將 id 加入名單中，就不會對該人進行打招呼。
    // 範例：var exception = ['moontai0724', 'userid', 'guest'];
    var exception = [];

    // 程式開始
    var owner = location.search.split('&').find(element => { return element.includes('owner='); }).split('=')[1];

    if (sessionStorage.getItem('AutoGreet_greetOrNot') && (location.pathname == '/friendMore.php' || location.pathname == '/broadcastMore.php')) startGuestGreet();
    else if (BAHAID == owner && location.pathname == '/broadcastMore.php') jQuery('img[src="https://i2.bahamut.com.tw/h1_img.gif"]')[0].parentNode.innerHTML += '<button style="margin-left: 10px;" id="AutoGreet_startGreet">向訂閱的巴友打招呼</button>';
    else if (BAHAID == owner && location.pathname == '/friendMore.php') jQuery('img[src="https://i2.bahamut.com.tw/h1_img.gif"]')[0].parentNode.innerHTML += '<button style="margin-left: 10px;" id="AutoGreet_startGreet">向來訪的巴友打招呼</button>';
    else if (BAHAID == owner && location.pathname == '/friend.php') jQuery('#FOLLOWctrbar')[0].innerHTML += '<button style="margin-left: 10px;" id="AutoGreet_startFriendGreet">向好友們打招呼</button>';

    // 當按鈕點擊就開始
    if (document.getElementById('AutoGreet_startGreet')) document.getElementById('AutoGreet_startGreet').onclick = () => {
        document.getElementById('AutoGreet_startGreet').setAttribute('disabled', true);
        // 導向到第一頁
        if (BAHAID) {
            sessionStorage.setItem('AutoGreet_greetOrNot', true);
            location.search = '?page=1&owner=' + owner;
        } else window.alert('您尚未登入！');
    };
    if (document.getElementById('AutoGreet_startFriendGreet')) document.getElementById('AutoGreet_startFriendGreet').onclick = () => BAHAID ? startFriendGreet() : window.alert('您尚未登入！');

    function startGuestGreet() {
        // 取得總頁數與目前頁數
        sessionStorage.setItem('AutoGreet_totalPages', document.getElementsByClassName('BH-pagebtnA')[0].childElementCount);
        var totalPages = sessionStorage.getItem('AutoGreet_totalPages');
        var nowPage = Number(location.search.split('&').find(element => { return element.includes('page'); }).split('=')[1]);

        if (nowPage == 1) {
            let time = new Date();
            let today = new Date(time.getFullYear(), time.getMonth(), time.getDate(), 0, 0, 0, 0);
            if (!localStorage.getItem('AutoGreet_lastGreetTime') || !(today.getTime() < Number(localStorage.getItem('AutoGreet_lastGreetTime')) && Number(localStorage.getItem('AutoGreet_lastGreetTime')) < today.getTime() + 86400000)) {
                localStorage.setItem('AutoGreet_lastGreetTime', time.getTime());
                localStorage.removeItem('AutoGreet_greetedIds');
            }
        }

        // 獲取清單 Ids 為目前清單(前幾頁獲取到的)，greeted 為儲存下來的，今天打過招呼的清單
        var ids = sessionStorage.getItem('AutoGreet_guestIds') ? sessionStorage.getItem('AutoGreet_guestIds').split(',') : [],
            guestData = sessionStorage.getItem('AutoGreet_guestData') ? JSON.parse(sessionStorage.getItem('AutoGreet_guestData')) : [],
            greeted = localStorage.getItem('AutoGreet_greetedIds') ? (localStorage.getItem('AutoGreet_greetedIds') + ',' + exception).split(',') : exception;

        // 開始獲取清單
        for (let i = 0; i < jQuery('.BH-lbox strong').length; i++) {
            // 確認沒有打過招呼，如果沒有就加入清單中
            if (greeted.indexOf(jQuery('.BH-lbox strong')[i].innerHTML) == -1) {
                ids[ids.length] = jQuery('.BH-lbox strong')[i].innerHTML;
                guestData[guestData.length] = {
                    id: jQuery('.BH-lbox strong')[i].innerHTML,
                    name: jQuery('.BH-lbox span')[i].innerHTML,
                    imgsrc: jQuery('.BH-lbox img')[i].src
                };
            }

            // 當獲取本頁面清單結束後
            if (i == jQuery('.BH-lbox strong').length - 1) {
                // 將獲取到的 id 儲存進 sessionStorage
                sessionStorage.setItem('AutoGreet_guestIds', ids.toString());
                sessionStorage.setItem('AutoGreet_guestData', JSON.stringify(guestData));

                if (totalPages > nowPage)
                    // 如果還有下一頁就前往下一頁
                    location.replace(location.pathname + location.search.replace('page=' + nowPage, 'page=' + (nowPage + 1)));
                else {
                    sessionStorage.removeItem('AutoGreet_greetOrNot');
                    sessionStorage.removeItem('AutoGreet_guestIds');
                    sessionStorage.removeItem('AutoGreet_guestData');
                    if (ids.length > 0) {
                        console.log('Target: ', ids, guestData);
                        jQuery.ajax({ url: "/ajax/getCSRFToken.php", cache: false }).done(token => {
                            setTimeout(function Greet(sort, pausetime) {
                                if (!sort) sort = 0;
                                if (!pausetime) pausetime = 0;
                                setTimeout(function () {
                                    jQuery.ajax({
                                        url: "/ajax/homeSayHello.php",
                                        data: {
                                            owner: ids[sort],
                                            token: token
                                        },
                                        method: "POST"
                                    }).done(function (e) {
                                        console.log(sort + ': 向 ' + guestData[sort].name + ' (' + guestData[sort].id + ') 打招呼');
                                        e ? sort < ids.length - 1 ? Greet(sort + 1) : finish() : Greet(sort, 1000);
                                        function finish() {
                                            localStorage.setItem('AutoGreet_greetedIds', localStorage.getItem('AutoGreet_greetedIds') + ',' + ids.toString());
                                            console.log('已經向以下名單中的巴友打招呼：', guestData);
                                            newAlert('打招呼已經完成，可以關閉視窗。已經向以下名單中的巴友打招呼：', guestData);
                                        }
                                    });
                                }, pausetime);
                            });
                        });
                    } else {
                        console.log('Target: none; 名單中的巴友都已經打過招呼了哦！');
                        newAlert('名單中的巴友都已經打過招呼了哦！');
                    }
                }
            }
        }
    }

    function startFriendGreet() {
        document.getElementById('AutoGreet_startFriendGreet').setAttribute('disabled', true);
        $.ajax({
            method: "GET",
            url: "/ajax/friend_getData.php",
            param: "here=all",
            success: function (data) {
                let time = new Date();
                let today = new Date(time.getFullYear(), time.getMonth(), time.getDate(), 0, 0, 0, 0);
                if (!localStorage.getItem('AutoGreet_lastGreetTime') || !(today.getTime() < Number(localStorage.getItem('AutoGreet_lastGreetTime')) && Number(localStorage.getItem('AutoGreet_lastGreetTime')) < today.getTime() + 86400000)) {
                    localStorage.setItem('AutoGreet_lastGreetTime', time.getTime());
                    localStorage.removeItem('AutoGreet_greetedIds');
                }

                var ids = [], greeted = localStorage.getItem('AutoGreet_greetedIds') ? (localStorage.getItem('AutoGreet_greetedIds') + ',' + exception).split(',') : exception;
                data.split('<div id="BMW_nlist" style="display:none;">')[1].replace('</div>', '').split(',').forEach(element => { if (greeted.indexOf(element) == -1) ids[ids.length] = element; });

                if (ids.length > 0) {
                    console.log('Target: ', ids);
                    jQuery.ajax({ url: "/ajax/getCSRFToken.php", cache: false }).done(token => {
                        setTimeout(function Greet(sort, pausetime) {
                            if (!sort) sort = 0;
                            if (!pausetime) pausetime = 0;
                            setTimeout(function () {
                                jQuery.ajax({
                                    url: "/ajax/homeSayHello.php",
                                    data: {
                                        owner: ids[sort],
                                        token: token
                                    },
                                    method: "POST"
                                }).done(function (e) {
                                    console.log(sort + ': 向 ' + ids[sort] + ' 打招呼');
                                    e ? sort < ids.length - 1 ? Greet(sort + 1) : finish() : Greet(sort, 1000);
                                    async function finish() {
                                        localStorage.setItem('AutoGreet_greetedIds', localStorage.getItem('AutoGreet_greetedIds') + ',' + ids.toString());
                                        console.log('已經向以下名單中的巴友打招呼：', ids);
                                        newAlert('打招呼已經完成，可以關閉視窗。已經向以下名單中的巴友打招呼：', await getGuestData(ids));
                                    }
                                });
                            }, pausetime);
                        });
                    });
                } else {
                    console.log('Target: none; 好友們都打過招呼了哦！');
                    newAlert('名單中的巴友都已經打過招呼了哦！');
                }
            }
        });
    }

    function newAlert(msg, guestData) {
        var newAlert_mask = document.createElement('div');
        newAlert_mask.id = 'newAlert_mask';
        newAlert_mask.setAttribute("onmousedown", "javascript:if(!jQuery(this).hasClass('mouseenter')) jQuery(\'#newAlert_mask\').remove();");
        newAlert_mask.style = 'background-color: rgba(0, 0, 0, 0.5); z-index: 95; position: fixed; top: 0px; bottom: 0px; left: 0px; right: 0px; width: 100%; height: 100%; padding-top: 35px; display: flex; align-items: center; justify-content: center; justify-content: center; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box;';
        document.body.appendChild(newAlert_mask);
        document.getElementById('newAlert_mask').innerHTML =
            '<div class="BH-popup" style="max-height: 90%; max-width: 90%;' + (guestData ? ' height: 90%; ' : ' ') + 'overflow: hidden;" onmouseenter="javascipt:jQuery(this.parentNode).addClass(\'mouseenter\');" onmouseleave="javascipt:jQuery(this.parentNode).removeClass(\'mouseenter\');"">' +
            '<p class="BH-poptitle" style="height: 10%; display: flex; align-items: center; justify-content: center; font-size: 22px; font-family: \'微軟正黑體\', Microsoft JhengHei, \'黑體 - 繁\', \'蘋果儷中黑\', sans-serif;">打招呼完成！</p>' +
            '<div class="BH-popintxt" style="max-height: 80%;' + (guestData ? ' height: 80%; ' : ' ') + 'overflow: auto; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; word-break: break-all; text-align: center; font-size: 16px; font-family: \'微軟正黑體\', Microsoft JhengHei, \'黑體-繁\', \'蘋果儷中黑\', sans-serif;">' + msg +
            (guestData ? '<div id="newAlert_msg" style="display: flex; flex-wrap: wrap; align-items: stretch; justify-content: center; margin-top: 10px;"></div>' : '') +
            '</div><p class="BH-popbtns" style="height: 10%; display: flex; align-items: center; justify-content: center;"><button onclick="javascript:jQuery(\'#newAlert_mask\').remove();">OK</button></p></div>';
        if (guestData) guestData.forEach(user => document.getElementById('newAlert_msg').innerHTML += '<a class="user-info" style="margin: 5px;" href="//home.gamer.com.tw/' + user.id + '" target="_blank"><img src="' + user.imgsrc + '"><strong>' + user.id + '</strong><span>' + user.name + '</span></a>');
    }

    function getGuestData(ids) {
        return new Promise(resolve => {
            let guestData = [];
            ids.forEach((id, sort) => jQuery.get('/ajax/gamercard.php?u=' + id, data => {
                guestData[guestData.length] = {
                    id: data.userid.toLowerCase(),
                    name: data.nickname,
                    imgsrc: 'https://avatar2.bahamut.com.tw/avataruserpic/' + data.userid[0].toLowerCase() + '/' + data.userid[1].toLowerCase() + '/' + data.userid.toLowerCase() + '/' + data.userid.toLowerCase() + '_s.png'
                };
                if (sort == ids.length - 1) resolve(guestData);
            }));
        });
    }
})();