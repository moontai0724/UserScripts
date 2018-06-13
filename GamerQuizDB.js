// ==UserScript==
// @name         巴哈動漫電玩通題庫與解答系統
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      3.0
// @description  巴哈動漫電玩通題庫與解答系統，蒐集題庫中～
// @author       moontai0724
// @match        https://forum.gamer.com.tw/B.php*
// @supportURL   https://home.gamer.com.tw/creationDetail.php?sn=3924920
// @grant        GM_xmlhttpRequest
// @connect      script.google.com
// @connect      script.googleusercontent.com
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    var qabox = document.getElementsByClassName('BH-rbox BH-qabox1');
    var quizSN = qabox[0].getAttribute('data-quiz-sn');
    var quizQuestion = qabox[0].innerHTML.replace(/\n/g, '').split('<ul>')[0];
    var quizOption = [];
    var bsn = location.search.split('&')[0].split('=')[1];
    var AlreadyAnswered = false;
    var BAHAID = document.cookie.split(';').map(value => value.startsWith(' ') ? value.replace(' ', '').split('=', 2) : value.split('=', 2)).find(value => value[0] == 'BAHAID') == undefined ? undefined : document.cookie.split(';').map(value => value.startsWith(' ') ? value.replace(' ', '').split('=', 2) : value.split('=', 2)).find(value => value[0] == 'BAHAID')[1];

    qabox[0].getElementsByTagName('li')[0].getElementsByTagName('a')[0].onclick = function () { answered(1); };
    qabox[0].getElementsByTagName('li')[1].getElementsByTagName('a')[0].onclick = function () { answered(2); };
    qabox[0].getElementsByTagName('li')[2].getElementsByTagName('a')[0].onclick = function () { answered(3); };
    qabox[0].getElementsByTagName('li')[3].getElementsByTagName('a')[0].onclick = function () { answered(4); };

    // UI
    var info_title = document.createElement('h5');
    info_title.innerHTML = '動漫電玩通題庫系統';
    info_title.setAttribute('style', 'color: #CCFFCC;');
    document.getElementById('BH-slave').appendChild(info_title);

    var info_div = document.createElement('div');
    info_div.id = 'quizrp_info_div';
    info_div.setAttribute('style', 'padding: 0px 10px 0px 10px; border: 1px solid lightgrey; background-color: #FFFFFF');
    document.getElementById('BH-slave').appendChild(info_div);

    creatediv('version', '系統版本：' + GM_info.script.version);
    creatediv('', '查看題庫：<a target="_blank" href="https://goo.gl/k8e7vr" style="color: #0055aa;">https://goo.gl/k8e7vr</a>');
    creatediv('report_db', '回報狀態：');
    createspan('report_db', '尚未回報。', 'color: red;', 'report_db_status');
    creatediv('autoanswer', '自動回答並回報：');
    createspan('autoanswer', '若志願提供題庫，按下按鈕開啟此功能。開啟後，當瀏覽至Ｂ頁時，即會自動作答題目。再次按下切換即可關閉功能。目前狀態：');
    createspan('autoanswer', localStorage.quizrp_autoanswer ? '開啟。' : '關閉。', localStorage.quizrp_autoanswer ? 'color: green;' : 'color: red;', 'autoanswer_status');
    createbtn('autoanswer_btn', '切換', 'autoanswer');
    creatediv('hint', '提示：');
    createbtn('gethint', '獲得提示', 'hint');
    creatediv('show_original', '');
    createbtn('show_original_btn', '顯示原題目與答案', 'show_original');

    function createbtn(id, text, place) {
        let createbtn = document.createElement('button');
        if (id != '') createbtn.id = 'quizrp_' + id;
        createbtn.appendChild(document.createTextNode(text));
        createbtn.setAttribute('style', 'margin: 0px 4px 0px 4px;');
        document.getElementById('quizrp_' + place).appendChild(createbtn);
    }

    function creatediv(id, text, style) {
        style = style ? 'margin: 10px 0px 10px 0px;' + style : 'margin: 10px 0px 10px 0px;';
        let creatediv = document.createElement('div');
        if (id != '') creatediv.id = 'quizrp_' + id;
        creatediv.innerHTML = text;
        creatediv.setAttribute('style', style);
        document.getElementById('quizrp_info_div').appendChild(creatediv);
    }

    function createspan(place, text, style, id) {
        let createspan = document.createElement('span');
        createspan.innerHTML = text;
        if (style) createspan.setAttribute('style', style);
        if (id) createspan.id = 'quizrp_' + id;
        document.getElementById('quizrp_' + place).appendChild(createspan);
    }

    // Get options and remove original answer function
    for (let i = 0; i < 4; i++) {
        quizOption[i] = qabox[0].getElementsByTagName('li')[i].getElementsByTagName('a')[0].innerHTML;
        qabox[0].getElementsByTagName('li')[i].getElementsByTagName('a')[0].removeAttribute('href');
    }

    // Change status of auto answer function
    quizrp_autoanswer_btn.onclick = function () {
        if (localStorage.quizrp_autoanswer) {
            localStorage.removeItem('quizrp_autoanswer');
            document.getElementById('quizrp_autoanswer_status').innerHTML = '關閉。';
            document.getElementById('quizrp_autoanswer_status').setAttribute('style', 'color: red;');
        } else {
            localStorage.setItem('quizrp_autoanswer', 'true');
            document.getElementById('quizrp_autoanswer_status').innerHTML = '開啟。';
            document.getElementById('quizrp_autoanswer_status').setAttribute('style', 'color: green;');
            if (AlreadyAnswered == false) {
                AlreadyAnswered = true;
                getDB('getAns').then(function (data) {
                    if (data == 1 || data == 2 || data == 3 || data == 4) {
                        document.getElementById('quizrp_report_db_status').innerHTML = '題庫中有答案，無須回報。';
                        document.getElementById('quizrp_report_db_status').setAttribute('style', 'color: green;');
                    } else getAns().then(ans => reportToDB(ans, true));
                });
            }
        }
    };

    // Get a return of answer or a space
    function getDB(action) {
        return new Promise(function (resolve) {
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://script.google.com/macros/s/AKfycbxYKwsjq6jB2Oo0xwz4bmkd3-5hdguopA6VJ5KD/exec?action=" + action + "&sn=" + quizSN,
                onload: data => {
                    console.log(data.response);
                    resolve(data.response);
                }
            });
        });
    }

    // When answered
    function answered(this_answered) {
        if (BAHAID) {
            AlreadyAnswered = true;
            removeElements();
            answerQuiz(this_answered).then(correctness => {
                qabox[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
                console.log('答案: ' + this_answered + correctness ? ' 正確' : ' 錯誤' + '，開始回報');
                reportToDB(this_answered, correctness);
            });
        } else {
            if (window.confirm('您尚未登入！')) location.href = 'https://user.gamer.com.tw/login.php';
        }
    }

    // Start report to database
    function reportToDB(this_answered, correctness) {
        console.log({
            "quiz_sn": quizSN,
            "quiz_question": quizQuestion,
            "quiz_option_1": quizOption[0],
            "quiz_option_2": quizOption[1],
            "quiz_option_3": quizOption[2],
            "quiz_option_4": quizOption[3],
            "reporter": BAHAID,
            "BoardSN": bsn,
            "this_answered": this_answered,
            "correctness": correctness
        });

        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://script.google.com/macros/s/AKfycbxYKwsjq6jB2Oo0xwz4bmkd3-5hdguopA6VJ5KD/exec',
            data: JSON.stringify({
                "quiz_sn": quizSN,
                "quiz_question": quizQuestion,
                "quiz_option_1": quizOption[0],
                "quiz_option_2": quizOption[1],
                "quiz_option_3": quizOption[2],
                "quiz_option_4": quizOption[3],
                "reporter": BAHAID,
                "BoardSN": bsn,
                "this_answered": this_answered,
                "correctness": correctness
            }),
            onload: function (data) {
                console.log(data.response);
                data = JSON.parse(data.response);
                document.getElementById('quizrp_report_db_status').innerHTML = data.message;
                document.getElementById('quizrp_report_db_status').setAttribute('style', data.status == '200' ? 'color: green;' : 'color: red;');
                qabox[0].setAttribute('style', qabox[0].getAttribute('style') ? qabox[0].getAttribute('style').replace('background-color: #cccccc;', '') : '');
            }
        });
    }

    // If auto answer is enable
    if (localStorage.quizrp_autoanswer) {
        window.setTimeout(function () {
            if (AlreadyAnswered == false) {
                AlreadyAnswered = true;
                getDB('getAns').then(function (data) {
                    if (data == 1 || data == 2 || data == 3 || data == 4) {
                        document.getElementById('quizrp_report_db_status').innerHTML = '題庫中有答案，無須回報。';
                        document.getElementById('quizrp_report_db_status').setAttribute('style', 'color: green;');
                    } else {
                        getAns().then(ans => reportToDB(ans, true));
                        removeElements();
                        quizrp_show_original_function();
                    }
                });
            }
        }, 1000);
    }

    // When trying to get a hint
    quizrp_gethint.onclick = function () {
        getDB('getHint').then(hint => {
            if (hint != ' ') {
                qabox[0].getElementsByTagName('a')[hint].setAttribute('style', 'color: red; text-decoration: line-through;');
                document.getElementById('quizrp_gethint').parentNode.removeChild(document.getElementById('quizrp_gethint'));
                createspan('hint', '提示已獲取。', 'color: green;');
            } else {
                document.getElementById('quizrp_gethint').parentNode.removeChild(document.getElementById('quizrp_gethint'));
                createspan('hint', '題庫中無資料。', 'color: red;');
            }
        });
    };

    var quizrp_show_original_showed = false;
    quizrp_show_original_btn.onclick = function () { quizrp_show_original_function(); };
    getDB('getAnnouncement').then(announcement => {
        if (announcement != 'No Message') window.alert(announcement);
    });

    // To show the original QA and ans
    function quizrp_show_original_function() {
        if (quizrp_show_original_showed == false) {
            quizrp_show_original_showed = true;
            document.getElementById('quizrp_show_original_btn').parentNode.removeChild(document.getElementById('quizrp_show_original_btn'));
            document.getElementById('quizrp_show_original').setAttribute('style', 'margin: 10px 0px 10px 0px; padding:10px 10px 0px 10px; border: 1px solid #cccccc;');
            document.getElementById('quizrp_show_original').innerHTML = '題目編號：' + quizSN + '<br>原題目：' + quizQuestion +
                '<ul style="list-style-type:decimal; padding:10px 0px 10px 30px;"><li>' + quizOption[0] + '</li>' +
                '<li>' + quizOption[1] + '</li>' +
                '<li>' + quizOption[2] + '</li>' +
                '<li>' + quizOption[3] + '</li></ul>';
        }

        getDB('getAns').then(function (ans) {
            if (ans == 1 || ans == 2 || ans == 3 || ans == 4) {
                for (let i = 0; i < 4; i++) {
                    document.getElementById('quizrp_show_original').getElementsByTagName('li')[i].setAttribute('style', (ans - 1) == i ? 'color: green; font-weight: bold;' : 'color: red; text-decoration: line-through;');
                }
            } else {
                getAns().then(function (ans) {
                    if (AlreadyAnswered == false) reportToDB(ans, true);
                    for (let i = 0; i < 4; i++) {
                        document.getElementById('quizrp_show_original').getElementsByTagName('li')[i].setAttribute('style', (ans - 1) == i ? 'color: green; font-weight: bold;' : 'color: red; text-decoration: line-through;');
                    }
                });
            }
        });
    }

    function removeElements() {
        if (document.getElementById('quizrp_gethint')) {
            document.getElementById('quizrp_gethint').parentNode.removeChild(document.getElementById('quizrp_gethint'));
            createspan('hint', '已作答題目。');
        }
    }

    function getAns() {
        return new Promise(resolve => {
            jQuery.ajax({
                url: "/ajax/getCSRFToken.php",
                cache: false
            }).then(function (token) {
                (function next(ans) {
                    return new Promise(resolve => {
                        jQuery.get("/ajax/quiz_answer.php", { sn: quizSN, o: ans, token: token }, data => {
                            if (/答對/.test(data)) resolve(ans);
                            else next(Number(ans) + 1).then(ans => resolve(ans));
                        });
                    });
                })(1).then(ans => {
                    console.log('Answer: ' + ans);
                    resolve(ans);
                });
            });
        });
    }

    function answerQuiz(ans) {
        return new Promise(resolve => {
            jQuery.ajax({
                url: "/ajax/getCSRFToken.php",
                cache: false
            }).then(token => jQuery.get("/ajax/quiz_answer.php", { sn: quizSN, o: ans, token: token }, data => {
                jQuery("div.BH-qabox1").css("text-align", "center").html(data);
                resolve(/答對/.test(data));
            }));
        });
    }
})();