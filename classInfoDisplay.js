// ==UserScript==
// @name         靜宜大學課程清單選課人數顯示
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      1.0
// @description  於靜宜大學課程清單網頁顯示目前選課人數與人數上限
// @author       moontai0724
// @match        http://alcat.pu.edu.tw/2011courseAbstract/main.php*
// @grant        none
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// ==/UserScript==

(function () {
    'use strict';

    jQuery('head').append('<style type="text/css">#menu>li { padding: 0px 0px 0px 0px !important; }</style>')
    jQuery('#menu').append('<li><a href="javascript:getInfo();">獲取目前修課人數</a></li>');
    jQuery('tr>th:nth-child(2)').append('(目前人數/人數上限)');

    jQuery('body').append('<script>' + function getInfo() {
        if (Number(sessionStorage.getItem("delayTime")) < (new Date()).getTime()) {
            sessionStorage.setItem("delayTime", (new Date()).getTime() + 100000);
            jQuery('[data-name="classInfo"]').remove();
            jQuery('tr').each((index, value) => {
                var classNumber = jQuery(value).find('td:first-child').text().replace(/\D/g, "");
                if (classNumber != "") {
                    jQuery.ajax({
                        type: "POST",
                        url: "http://alcat.pu.edu.tw/choice/q_person.html",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded;",
                        },
                        data: 'selectno=' + classNumber,
                        cache: false,
                        success: data => {
                            var classInfo = /<td>人數上限<\/td><td>(\d*)<\/td>[\s\S]*?<td>修課人數<\/td><td>(\d*)<\/td>/.exec(data.replace(/\s/g, ""));
                            jQuery(jQuery(value).find('td')[1]).append('<span data-name="classInfo">(' + classInfo[2] + '/' + classInfo[1] + ')</span>');
                        },
                        error: console.error
                    });
                }
            });
        } else window.alert('請稍後再嘗試！冷卻時間十秒！');
    } + '</script>');
})();