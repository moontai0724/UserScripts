// ==UserScript==
// @name         動漫電玩通題庫系統
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      2.0
// @description  動漫電玩通題庫系統，歡迎提供題目。
// @author       moontai0724
// @match        https://forum.gamer.com.tw/B.php*
// @require      https://apis.google.com/js/api.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/aes.js
// @supportURL   https://home.gamer.com.tw/creationDetail.php?sn=3924920
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var this_quiz = document.getElementsByClassName('BH-rbox BH-qabox1');
    var this_quiz_sn = this_quiz[0].getAttribute('data-quiz-sn');
    var this_quiz_question = this_quiz[0].innerHTML.replace(/\n/g, '').split('<ul>')[0];
    var this_quiz_option = [], bsn = location.search.split('&')[0].split('=')[1], AlreadyAnswered = false;

    this_quiz[0].getElementsByTagName('li')[0].getElementsByTagName('a')[0].onclick = function () { answered(1); };
    this_quiz[0].getElementsByTagName('li')[1].getElementsByTagName('a')[0].onclick = function () { answered(2); };
    this_quiz[0].getElementsByTagName('li')[2].getElementsByTagName('a')[0].onclick = function () { answered(3); };
    this_quiz[0].getElementsByTagName('li')[3].getElementsByTagName('a')[0].onclick = function () { answered(4); };

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
    creatediv('quick_answer', '回答答案：', 'display: none;');
    creatediv('get_db', '題庫獲取狀態：');
    createspan('get_db', '尚未獲取。', 'color: red;', 'get_db_status');
    creatediv('report_db', '回報狀態：');
    createspan('report_db', '尚未回報。', 'color: red;', 'report_db_status');
    creatediv('autoanswer', '自動回答並回報：');
    createspan('autoanswer', '若志願提供題庫，按下按鈕開啟此功能。開啟後，當瀏覽至Ｂ頁時，即會自動作答題目。再次按下切換即可關閉功能。目前狀態：');
    if (localStorage.quizrp_autoanswer) {
        createspan('autoanswer', '開啟。', 'color: green;', 'autoanswer_status');
    } else {
        createspan('autoanswer', '關閉。', 'color: red;', 'autoanswer_status');
    }
    creatediv('hint', '提示：');
    createbtn('gethint', '獲得提示', 'hint');
    createbtn('autoanswer_btn', '切換', 'autoanswer');
    creatediv('show_original', '');
    createbtn('show_original_btn', '顯示原題目與答案', 'show_original');

    for (let i = 0; i < 4; i++) {
        this_quiz_option[i] = this_quiz[0].getElementsByTagName('li')[i].getElementsByTagName('a')[0].innerHTML;
        this_quiz[0].getElementsByTagName('li')[i].getElementsByTagName('a')[0].removeAttribute('href');
    }

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
                getDB().then(function () {
                    if (quizDB.findIndex(element => { return element.sn == this_quiz_sn; }) > -1) {
                        let targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; });
                        if (quizDB[targetsort].answer) {
                            document.getElementById('quizrp_report_db_status').innerHTML = '題庫中有答案，無須回報。';
                            document.getElementById('quizrp_report_db_status').setAttribute('style', 'color: green;');
                        } else if (quizDB[targetsort].answer_1 != 'N') answered(1);
                        else if (quizDB[targetsort].answer_2 != 'N') answered(2);
                        else if (quizDB[targetsort].answer_3 != 'N') answered(3);
                        else if (quizDB[targetsort].answer_4 != 'N') answered(4);
                    } else {
                        answered(1);
                    }
                });
            }
        }
    };

    function createbtn(id, text, place) {
        let createbtn = document.createElement('button');
        if (id != '') createbtn.id = 'quizrp_' + id;
        createbtn.appendChild(document.createTextNode(text));
        createbtn.setAttribute('style', 'margin: 0px 4px 0px 4px;');
        document.getElementById('quizrp_' + place).appendChild(createbtn);
    }

    function creatediv(id, text, style) {
        if (style) style = 'margin: 10px 0px 10px 0px;' + style; else style = 'margin: 10px 0px 10px 0px;';
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

    function getNowTime() {
        let time = new Date(), time_ms = time.getMilliseconds(), time_sec = time.getSeconds(), time_min = time.getMinutes(), time_hr = time.getHours(), time_day = time.getDate(), time_month = time.getMonth() + 1, time_year = time.getFullYear();
        if (time_ms < 10) time_ms = '00' + time_ms; else if (time_ms < 100) time_ms = '0' + time_ms;
        if (time_sec < 10) time_sec = '0' + time_sec;
        if (time_min < 10) time_min = '0' + time_min;
        if (time_hr < 10) time_hr = '0' + time_hr;
        if (time_day < 10) time_day = '0' + time_day;
        if (time_month < 10) time_month = '0' + time_month;
        return time_year + '/' + time_month + '/' + time_day + ' ' + time_hr + ':' + time_min + ':' + time_sec + ':' + time_ms + '-> ';
    }

    var dbget = false, quizDB = [], Dd = '';
    function getDB() {
        return new Promise(function (resolve) {
            if (dbget == true) { resolve(quizDB); } else {
                quizDB = [];
                start(1)
                function start(z) {
                    jQuery.get('https://spreadsheets.google.com/feeds/list/1bV8nZP0Iahgp1GoqTT7qNlgvQYPWmg2yT5Wcsta6lbo/' + z + '/public/values?alt=json', function (data) {
                        if (z > 1) {
                            for (let i = 0; i < data.feed.entry.length; i++) {
                                quizDB[i] = {
                                    sn: data.feed.entry[i].gsx$quizsn.$t,
                                    answer_1: data.feed.entry[i].gsx$quizanswer1.$t,
                                    answer_2: data.feed.entry[i].gsx$quizanswer2.$t,
                                    answer_3: data.feed.entry[i].gsx$quizanswer3.$t,
                                    answer_4: data.feed.entry[i].gsx$quizanswer4.$t,
                                    answer: data.feed.entry[i].gsx$quizanswer.$t,
                                    reporter: data.feed.entry[i].gsx$reporter.$t,
                                    bsn: data.feed.entry[i].gsx$boardsn.$t
                                };
                                if (i == data.feed.entry.length - 1) {
                                    document.getElementById('quizrp_get_db_status').innerHTML = '獲取成功。';
                                    document.getElementById('quizrp_get_db_status').setAttribute('style', 'color: green;');
                                    dbget = true;
                                    resolve(quizDB);
                                }
                            }
                        } else if (z == 1) {
                            let A = ['', '', '', '', ''];
                            for (let y = 0; y < data.feed.entry.length; y++) {
                                let k;
                                if (y < 20) { k = 0; } else if (y < 41) { k = 1; } else if (y < 52) { k = 2; } else if (y < 68) { k = 3; } else if (y < 75) { k = 4; }
                                A[k] += data.feed.entry[y].gsx$z.$t;
                            }
                            for (let x = 0; x < 5; x++) {
                                Dd += CryptoJS.AES.decrypt(A[x], 'gamerquizreport').toString(CryptoJS.enc.Utf8);
                                if (x == 4) {
                                    start(Math.ceil(this_quiz_sn / 10000) + 1);
                                }
                            }
                        }
                    });
                }
            }
        });
    }

    function answered(this_answered) {
        quiz.answer(this_answered);
        AlreadyAnswered = true;
        console.log(getNowTime(), 'answered: ', this_answered);
        if (BAHAID) {
            new Promise(function (resolve) {
                removeElements();
                function keep() {
                    if (document.getElementsByClassName('BH-rbox BH-qabox1')[0].getElementsByTagName('img')[0]) {
                        console.log(getNowTime(), '圖片已載入，開始判斷對錯。');
                        resolve(true);
                    } else {
                        console.log(getNowTime(), '圖片尚未載入，等待中。');
                        window.setTimeout(function () { keep(); }, 500);
                    }
                }
                keep();
            }).then(function () {
                let qabox = document.getElementsByClassName('BH-rbox BH-qabox1');
                this_quiz[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
                let after_answered_pic_src = qabox[0].getElementsByTagName('img')[0].getAttribute('src');
                if (after_answered_pic_src == 'https://i2.bahamut.com.tw/quiz_correct.png') {
                    console.log(getNowTime(), '答案正確，呼叫 function handledata');
                    handledata(this_answered, true);
                } else if (after_answered_pic_src == 'https://i2.bahamut.com.tw/quiz_wrong.png') {
                    console.log(getNowTime(), '答案錯誤，呼叫 function handledata');
                    handledata(this_answered, false);
                }
            });
        }
    }

    function handledata(this_answered, correctness) {
        console.log(getNowTime(), 'handledata 收到呼叫，開始獲取資料庫 function getDB');
        getDB().then(quizDB => {
            let this_quiz_answer = [], this_quiz_reporter, targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; }), ansindata = false;
            console.log(getNowTime(), '開始判斷資料');

            if (targetsort > -1 && correctness == false) {
                for (let i = 1; i < 5; i++) {
                    if (quizDB[targetsort]['answer_' + i].replace(/\s/, '') != '') {
                        this_quiz_answer[i - 1] = quizDB[targetsort]['answer_' + i];
                    } else if (Number(this_answered) == i) {
                        if (correctness == true) {
                            this_quiz_answer[i - 1] = 'Y';
                        } else if (correctness == false) {
                            this_quiz_answer[i - 1] = 'N';
                        }
                    } else {
                        this_quiz_answer[i - 1] = ' ';
                    }
                }

                this_answered = ' ';

                let count_no = 0, count_empty = -1;
                for (let count = 0; count < 4; count++) {
                    if (this_quiz_answer[count] == 'Y') {
                        this_answered = count + 1;
                    } else if (this_quiz_answer[count] == 'N') {
                        count_no++;
                    } else if (this_quiz_answer[count] == ' ') {
                        count_empty = count;
                    }
                }

                if (count_no == 3 && count_empty != -1) {
                    this_quiz_answer[count_empty] = 'Y';
                    this_answered = count_empty + 1;
                }

                if (quizDB[targetsort].reporter.indexOf(BAHAID) == -1) {
                    this_quiz_reporter = quizDB[targetsort].reporter + ', ' + BAHAID;
                } else {
                    this_quiz_reporter = quizDB[targetsort].reporter;
                }
            } else {
                if (correctness == true) {
                    this_quiz_answer = ['N', 'N', 'N', 'N'];
                    this_quiz_answer[this_answered - 1] = 'Y';
                } else if (correctness == false) {
                    this_quiz_answer = [' ', ' ', ' ', ' '];
                    this_quiz_answer[this_answered - 1] = 'N';
                    this_answered = ' ';
                }
            }

            if (targetsort != -1) {
                for (let i = 1; i < 5; i++) {
                    if (quizDB[targetsort].answer.replace(/\s/, '') != '') ansindata = true;
                    else if (this_answered == i && quizDB[targetsort]['answer_' + i] == 'N') ansindata = true;
                }
                if (quizDB[targetsort].bsn.indexOf(bsn) == -1) {
                    bsn = quizDB[targetsort].bsn + ', ' + bsn;
                    let bsns = bsn.split(', ');
                    if (bsns.length > 1) {
                        for (let x = 0; x < bsns.length; x++) {
                            for (let y = x; y < bsns.length; y++) {
                                if (bsns[x] > bsns[y]) {
                                    let temp = bsns[x];
                                    bsns[x] = bsns[y];
                                    bsns[y] = temp;
                                }
                            }
                        }
                        for (let i = 0; i < bsns.length; i++) {
                            if (i == 0) {
                                bsn = bsns[0];
                            } else {
                                bsn = bsn + ', ' + bsns[i];
                            }
                        }
                    }
                }
                if (quizDB[targetsort].reporter.indexOf(BAHAID) == -1) {
                    this_quiz_reporter = quizDB[targetsort].reporter + ', ' + BAHAID;
                } else {
                    this_quiz_reporter = quizDB[targetsort].reporter;
                }
            } else {
                targetsort = quizDB.length;
                this_quiz_reporter = BAHAID;
            }

            quizDB[targetsort] = {
                sn: this_quiz_sn,
                answer_1: this_quiz_answer[0],
                answer_2: this_quiz_answer[1],
                answer_3: this_quiz_answer[2],
                answer_4: this_quiz_answer[3]
            };
            quizrp_show_original_function();

            if (ansindata == false) {
                console.log(getNowTime(), '呼叫 reporttodb，開始回報');
                reporttodb(this_answered, this_quiz_answer, targetsort + 2, this_quiz_reporter);
            } else {
                console.log(getNowTime(), '題庫中有答案，無須回報。');
                document.getElementById('quizrp_report_db_status').innerHTML = '題庫中有答案，無須回報。';
                this_quiz[0].setAttribute('style', 'text-align: center;');
                document.getElementById('quizrp_report_db_status').setAttribute('style', 'color: green;');
            }
        });
    }

    function reporttodb(this_answered, this_quiz_answer, targetsort, this_quiz_reporter) {
        console.log(getNowTime(), 'reporttodb 收到呼叫');
        console.log(getNowTime(), 'this_quiz_answer: ', this_quiz_answer);
        console.log(this_quiz_sn, this_quiz_question, this_quiz_option[0], this_quiz_option[1], this_quiz_option[2], this_quiz_option[3],
            this_quiz_answer[0], this_quiz_answer[1], this_quiz_answer[2], this_quiz_answer[3], this_answered,
            this_quiz_reporter, bsn);

        jQuery.post('https://www.googleapis.com/oauth2/v4/token', Dd, function (data) {
            jQuery.ajax({
                type: 'PUT',
                contentType: 'application/json;',
                url: 'https://sheets.googleapis.com/v4/spreadsheets/1bV8nZP0Iahgp1GoqTT7qNlgvQYPWmg2yT5Wcsta6lbo/values/' + Math.floor(this_quiz_sn / 10000) +
                    '0000!A' + targetsort + ':M' + targetsort + '?valueInputOption=USER_ENTERED&access_token=' + data.access_token,
                data: JSON.stringify({
                    'range': Math.floor(this_quiz_sn / 10000) + '0000!A' + targetsort + ':M' + targetsort,
                    'majorDimension': 'ROWS',
                    'values': [
                        [this_quiz_sn, this_quiz_question, this_quiz_option[0], this_quiz_option[1], this_quiz_option[2], this_quiz_option[3],
                            this_quiz_answer[0], this_quiz_answer[1], this_quiz_answer[2], this_quiz_answer[3], this_answered,
                            this_quiz_reporter, bsn],
                    ],
                }),
                success: function (data, status, xhr) {
                    document.getElementById('quizrp_report_db_status').innerHTML = '回報完成。';
                    this_quiz[0].setAttribute('style', 'text-align: center;');
                    document.getElementById('quizrp_report_db_status').setAttribute('style', 'color: green;');
                    console.log(getNowTime(), 'Responsed Data: ', data);
                    console.log(getNowTime(), 'Responsed Status: ', status);
                    console.log(getNowTime(), 'Responsed xhr: ', xhr);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(getNowTime(), 'Responsed jqXHR: ', jqXHR);
                    console.log(getNowTime(), 'Responsed textStatus: ', textStatus);
                    console.log(getNowTime(), 'Responsed errorThrown: ', errorThrown);
                }
            });
        });
    }

    if (localStorage.quizrp_autoanswer) {
        window.setTimeout(function () {
            if (AlreadyAnswered == false) {
                getDB().then(function () {
                    if (quizDB.findIndex(element => { return element.sn == this_quiz_sn; }) > -1) {
                        let targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; });
                        if (quizDB[targetsort].answer) {
                            document.getElementById('quizrp_report_db_status').innerHTML = '題庫中有答案，無須回報。';
                            document.getElementById('quizrp_report_db_status').setAttribute('style', 'color: green;');
                        } else if (quizDB[targetsort].answer_1 != 'N') answered(1);
                        else if (quizDB[targetsort].answer_2 != 'N') answered(2);
                        else if (quizDB[targetsort].answer_3 != 'N') answered(3);
                        else if (quizDB[targetsort].answer_4 != 'N') answered(4);
                    } else {
                        answered(1);
                    }
                });
            }
        }, 1000);
    }

    quizrp_gethint.onclick = function () {
        getDB().then(quizDB => {
            if (quizDB.findIndex(element => { return element.sn == this_quiz_sn; }) > -1) {
                let targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; });
                let hint_quiz_answer = [quizDB[targetsort].answer_1, quizDB[targetsort].answer_2, quizDB[targetsort].answer_3, quizDB[targetsort].answer_4];
                hint_start();
                function hint_start() {
                    let rn = getRandomNumber(0, 3);
                    if (hint_quiz_answer[rn] == 'N') {
                        this_quiz[0].getElementsByTagName('a')[rn].setAttribute('style', 'color: red; text-decoration: line-through;');
                        document.getElementById('quizrp_gethint').parentNode.removeChild(document.getElementById('quizrp_gethint'));
                        createspan('hint', '提示已獲取。', 'color: green;');
                    } else hint_start();

                }
            } else {
                document.getElementById('quizrp_gethint').parentNode.removeChild(document.getElementById('quizrp_gethint'));
                createspan('hint', '題庫中無資料。', 'color: red;');
            }
        });
    };

    var quizrp_show_original_showed = false;
    quizrp_show_original_btn.onclick = function () { quizrp_show_original_function(); };

    function quizrp_show_original_function() {
        if (quizrp_show_original_showed == false) {
            quizrp_show_original_showed = true;
            document.getElementById('quizrp_show_original_btn').parentNode.removeChild(document.getElementById('quizrp_show_original_btn'));
            document.getElementById('quizrp_show_original').setAttribute('style', 'margin: 10px 0px 10px 0px; padding:10px 10px 0px 10px; border: 1px solid #cccccc;');
            document.getElementById('quizrp_show_original').innerHTML = '題目編號：' + this_quiz_sn + '<br>原題目：' + this_quiz_question +
                '<ul style="list-style-type:decimal; padding:10px 0px 10px 30px;"><li>' + this_quiz_option[0] + '</li>' +
                '<li>' + this_quiz_option[1] + '</li>' +
                '<li>' + this_quiz_option[2] + '</li>' +
                '<li>' + this_quiz_option[3] + '</li></ul>';
        }
        getDB().then(function () {
            let targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; });
            if (targetsort > -1) {
                for (let i = 0; i < 4; i++) {
                    if (quizDB[targetsort]['answer_' + (i + 1)] == 'N') {
                        document.getElementById('quizrp_show_original').getElementsByTagName('li')[i].setAttribute('style', 'color: red; text-decoration: line-through;');
                    } else if (quizDB[targetsort]['answer_' + (i + 1)] == 'Y') {
                        document.getElementById('quizrp_show_original').getElementsByTagName('li')[i].setAttribute('style', 'color: green; font-weight: bold;');
                    }
                }
            }
        });
    }

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function removeElements() {
        if (document.getElementById('quizrp_gethint')) {
            document.getElementById('quizrp_gethint').parentNode.removeChild(document.getElementById('quizrp_gethint'));
            createspan('hint', '已作答題目。');
        }
    }
})();