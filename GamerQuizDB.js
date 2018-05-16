// ==UserScript==
// @name         動漫電玩通題庫系統
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      3.0
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

    var this_quiz = document.getElementsByClassName('BH-rbox BH-qabox1'), this_quiz_sn = this_quiz[0].getAttribute('data-quiz-sn'),
        this_quiz_question = this_quiz[0].innerHTML.replace(/\n/g, '').split('<ul>')[0],
        this_quiz_option = [], bsn = location.search.split('&')[0].split('=')[1], AlreadyAnswered = false;

    this_quiz[0].getElementsByTagName('li')[0].getElementsByTagName('a')[0].onclick = () => answered(1);
    this_quiz[0].getElementsByTagName('li')[1].getElementsByTagName('a')[0].onclick = () => answered(2);
    this_quiz[0].getElementsByTagName('li')[2].getElementsByTagName('a')[0].onclick = () => answered(3);
    this_quiz[0].getElementsByTagName('li')[3].getElementsByTagName('a')[0].onclick = () => answered(4);

    var info_title = document.createElement('h5');
    info_title.innerHTML = '動漫電玩通題庫系統';
    info_title.setAttribute('style', 'color: #CCFFCC;');
    document.getElementById('BH-slave').appendChild(info_title);

    var info_div = document.createElement('div');
    info_div.id = 'quizrp_div_info';
    info_div.setAttribute('style', 'padding: 0px 10px 0px 10px; border: 1px solid lightgrey; background-color: #FFFFFF');
    document.getElementById('BH-slave').appendChild(info_div);

    creatediv('version', '系統版本：' + GM_info.script.version);
    creatediv('', '查看題庫：<a target="_blank" href="https://goo.gl/k8e7vr" style="color: #0055aa;">https://goo.gl/k8e7vr</a>');
    creatediv('getDB', '題庫獲取狀態：');
    createspan('getDB', '尚未獲取。', 'color: red;', 'getDB');
    creatediv('reportToDB', '回報狀態：');
    createspan('reportToDB', '尚未回報。', 'color: red;', 'reportToDB');
    creatediv('autoReport', '自動回報：');
    createspan('autoReport', '若志願提供題庫，按下按鈕開啟此功能。開啟後，當瀏覽至Ｂ頁時，即會回報題目與答案。再次按下切換即可關閉功能。目前狀態：');
    if (localStorage.quizrp_autoReport) createspan('autoReport', '開啟。', 'color: green;', 'autoReport');
    else createspan('autoReport', '關閉。', 'color: red;', 'autoReport');
    createbtn('autoReport', '切換', 'autoReport');
    creatediv('getHint', '提示：');
    createbtn('getHint', '獲得提示', 'getHint');
    creatediv('showOriginal', '');
    createbtn('showOriginal', '顯示原題目與答案', 'showOriginal');

    for (let i = 0; i < 4; i++) {
        this_quiz_option[i] = this_quiz[0].getElementsByTagName('li')[i].getElementsByTagName('a')[0].innerHTML;
        this_quiz[0].getElementsByTagName('li')[i].getElementsByTagName('a')[0].removeAttribute('href');
    }

    function createbtn(id, text, place) {
        let createbtn = document.createElement('button');
        if (id != '') createbtn.id = 'quizrp_btn_' + id;
        createbtn.appendChild(document.createTextNode(text));
        createbtn.setAttribute('style', 'margin: 0px 4px 0px 4px;');
        document.getElementById('quizrp_div_' + place).appendChild(createbtn);
    }

    function creatediv(id, text, style) {
        if (style) style = 'margin: 10px 0px 10px 0px;' + style; else style = 'margin: 10px 0px 10px 0px;';
        let creatediv = document.createElement('div');
        if (id != '') creatediv.id = 'quizrp_div_' + id;
        creatediv.innerHTML = text;
        creatediv.setAttribute('style', style);
        document.getElementById('quizrp_div_info').appendChild(creatediv);
    }

    function createspan(place, text, style, id) {
        let createspan = document.createElement('span');
        createspan.innerHTML = text;
        if (style) createspan.setAttribute('style', style);
        if (id) createspan.id = 'quizrp_span_' + id;
        document.getElementById('quizrp_div_' + place).appendChild(createspan);
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

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function getAns() {
        return new Promise(resolve =>
            jQuery.ajax({ url: '/ajax/getCSRFToken.php', cache: false }).then(token => [1, 2, 3, 4].forEach(ans =>
                jQuery.get("/ajax/quiz_answer.php", { sn: jQuery('.BH-rbox.BH-qabox1').data('quiz-sn'), o: ans, token: token }, o => {
                    if (o.match(/quiz_correct\.png/)) resolve(ans);
                }))));
    }

    function checkAns(ans) {
        return new Promise(resolve => jQuery.ajax({ url: '/ajax/getCSRFToken.php', cache: false }).then(token =>
            jQuery.get("/ajax/quiz_answer.php", { sn: jQuery('.BH-rbox.BH-qabox1').data('quiz-sn'), o: ans, token: token }, o => {
                egg("div.BH-qabox1").css("text-align", "center").html(o);
                if (o.match(/quiz_correct\.png/)) resolve(true); else resolve(false);
            })));
    }

    var dbget = false, quizDB = [], Dd = '';
    function getDB() {
        return new Promise(function (resolve, reject) {
            if (dbget) resolve(quizDB); else {
                quizDB = [];
                jQuery.get('https://spreadsheets.google.com/feeds/list/1bV8nZP0Iahgp1GoqTT7qNlgvQYPWmg2yT5Wcsta6lbo/' + (Math.ceil(this_quiz_sn / 10000) + 1) + '/public/values?alt=json', (data) => {
                    for (let i = 0; i < data.feed.entry.length; i++) {
                        quizDB[i] = {
                            sn: data.feed.entry[i].gsx$quizsn.$t,
                            isAns: [data.feed.entry[i].gsx$quizanswer1.$t, data.feed.entry[i].gsx$quizanswer2.$t, data.feed.entry[i].gsx$quizanswer3.$t, data.feed.entry[i].gsx$quizanswer4.$t],
                            answer: data.feed.entry[i].gsx$quizanswer.$t,
                            reporter: data.feed.entry[i].gsx$reporter.$t,
                            bsn: data.feed.entry[i].gsx$boardsn.$t
                        };
                        if (i == data.feed.entry.length - 1) {
                            document.getElementById('quizrp_span_getDB').innerHTML = '獲取成功。';
                            document.getElementById('quizrp_span_getDB').setAttribute('style', 'color: green;');
                            dbget = true;
                            resolve(quizDB);
                        }
                    }
                });
            }
        });
    }

    function reporttodb(this_answered, this_quiz_answer, targetsort, this_quiz_reporter) {
        jQuery.get('https://spreadsheets.google.com/feeds/list/1bV8nZP0Iahgp1GoqTT7qNlgvQYPWmg2yT5Wcsta6lbo/1/public/values?alt=json', data => {
            Dd = ''; let A = ['', '', '', '', ''];
            for (let y = 0; y < data.feed.entry.length; y++) { let k; if (y < 20) k = 0; else if (y < 41) k = 1; else if (y < 52) k = 2; else if (y < 68) k = 3; else if (y < 75) k = 4; A[k] += data.feed.entry[y].gsx$z.$t; }
            for (let x = 0; x < 5; x++)  Dd += CryptoJS.AES.decrypt(A[x], 'gamerquizreport').toString(CryptoJS.enc.Utf8);
            jQuery.post('https://www.googleapis.com/oauth2/v4/token', Dd, data => {
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
                    success: (data, status, xhr) => {
                        this_quiz[0].setAttribute('style', 'text-align: center;');
                        document.getElementById('quizrp_span_reportToDB').innerHTML = '回報完成。';
                        document.getElementById('quizrp_span_reportToDB').setAttribute('style', 'color: green;');
                    },
                    error: (jqXHR, textStatus, errorThrown) => {
                        console.log(getNowTime(), 'Responsed jqXHR: ', jqXHR);
                        console.log(getNowTime(), 'Responsed textStatus: ', textStatus);
                        console.log(getNowTime(), 'Responsed errorThrown: ', errorThrown);
                    }
                });
            });
        });
    }


    // ======================================================================================================================================================

    function answered(this_answered) {
        if (!BAHAID) eval(window.confirm("您需要先登入才能使用此項功能喔") && (location.href = "https://user.gamer.com.tw/login.php"));
        else {
            AlreadyAnswered = true;
            if (document.getElementById('quizrp_btn_getHint')) {
                document.getElementById('quizrp_btn_getHint').parentNode.removeChild(document.getElementById('quizrp_btn_getHint'));
                createspan('getHint', '已作答題目。');
            }
            console.log(getNowTime(), 'answered: ', this_answered);
            checkAns(this_answered).then(correctness => {
                this_quiz[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
                handledata(this_answered, correctness);
            });
        }
    }

    function handledata(this_answered, correctness) {
        getDB().then(quizDB => {
            let targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; }), this_quiz_reporter, ansindata = false, correctnessYN;
            let this_quiz_answer = [];

            if (correctness) correctnessYN = 'Y'; else correctnessYN = 'N';
            if (targetsort > -1) {
                if (quizDB[targetsort].answer.replace(/\s/, '') != '') ansindata = true;
                else {
                    for (let i = 1; i < 5; i++) {
                        if (this_answered == i && quizDB[targetsort].ans[i - 1].replace(/\s/, '') != '') ansindata = true;
                    }
                }
            }

            if (targetsort > -1 && correctness == false && ansindata == false) {
                quizDB[targetsort].ans[this_answered - 1] = correctnessYN;
                let empty = true;
                for (let i = 0; i < 4; i++) {
                    if (quizDB[targetsort].ans[i].replace(/\s/, '') != '') empty = false;
                }
            }

            // old
            if (targetsort > -1 && correctness == false) {
                for (let i = 1; i < 5; i++) {
                    if (quizDB[targetsort]['answer_' + i].replace(/\s/, '') != '') this_quiz_answer[i - 1] = quizDB[targetsort]['answer_' + i];
                    else if (Number(this_answered) == i) {
                        if (correctness == true) this_quiz_answer[i - 1] = 'Y';
                        else if (correctness == false) this_quiz_answer[i - 1] = 'N';
                    } else this_quiz_answer[i - 1] = ' ';
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
            showOriginalQA();

            if (ansindata == false) {
                reporttodb(this_answered, this_quiz_answer, targetsort + 2, this_quiz_reporter);
            } else {
                document.getElementById('quizrp_span_reportToDB').innerHTML = '題庫中有答案，無須回報。';
                this_quiz[0].setAttribute('style', 'text-align: center;');
                document.getElementById('quizrp_span_reportToDB').setAttribute('style', 'color: green;');
            }
        });
    }

    quizrp_btn_autoReport.onclick = function () {
        if (localStorage.quizrp_autoReport) {
            localStorage.removeItem('quizrp_autoReport');
            document.getElementById('quizrp_span_autoReport').innerHTML = '關閉。';
            document.getElementById('quizrp_span_autoReport').setAttribute('style', 'color: red;');
        } else {
            localStorage.setItem('quizrp_autoReport', 'true');
            document.getElementById('quizrp_span_autoReport').innerHTML = '開啟。';
            document.getElementById('quizrp_span_autoReport').setAttribute('style', 'color: green;');
            if (AlreadyAnswered == false) {
                getDB().then(function () {
                    if (quizDB.findIndex(element => { return element.sn == this_quiz_sn; }) > -1) {
                        if (quizDB[quizDB.findIndex(element => { return element.sn == this_quiz_sn; })].answer) {
                            document.getElementById('quizrp_span_autoReport').innerHTML = '題庫中有答案，無須回報。';
                            document.getElementById('quizrp_span_autoReport').setAttribute('style', 'color: green;');
                        } else getAns().then(ans => handledata(ans, true)) && this_quiz[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
                    } else {
                        getAns().then(ans => handledata(ans, true)) && this_quiz[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
                    }
                });
            }
        }
    };

    if (localStorage.quizrp_autoReport && AlreadyAnswered == false) {
        getDB().then(quizDB => {
            if (quizDB.findIndex(element => { return element.sn == this_quiz_sn; }) > -1) {
                if (quizDB[quizDB.findIndex(element => { return element.sn == this_quiz_sn; })].answer) {
                    document.getElementById('quizrp_span_autoReport').innerHTML = '題庫中有答案，無須回報。';
                    document.getElementById('quizrp_span_autoReport').setAttribute('style', 'color: green;');
                } else getAns().then(ans => handledata(ans, true)) && this_quiz[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
            } else {
                getAns().then(ans => handledata(ans, true)) && this_quiz[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
            }
        });
    }

    quizrp_btn_getHint.onclick = function () {
        getDB().then(quizDB => {
            if (quizDB.findIndex(element => { return element.sn == this_quiz_sn; }) > -1 && quizDB[quizDB.findIndex(element => { return element.sn == this_quiz_sn; })].answer.replace(/\s/, '') != '') {
                let targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; });
                let hint_quiz_answer = [quizDB[targetsort].answer_1, quizDB[targetsort].answer_2, quizDB[targetsort].answer_3, quizDB[targetsort].answer_4];
                setTimeout(function start() {
                    let rn = getRandomNumber(0, 3);
                    if (hint_quiz_answer[rn] == 'N') {
                        this_quiz[0].getElementsByTagName('a')[rn].setAttribute('style', 'color: red; text-decoration: line-through;');
                        document.getElementById('quizrp_span_getHint').parentNode.removeChild(document.getElementById('quizrp_span_getHint'));
                        createspan('hint', '提示已獲取。', 'color: green;');
                    } else start();
                });
            } else {
                getAns().then(ans => {
                    handledata(ans, true);
                    this_quiz[0].setAttribute('style', 'text-align: center; background-color: #cccccc;');
                    setTimeout(function start() {
                        let rn = getRandomNumber(0, 3);
                        if (rn != ans) {
                            this_quiz[0].getElementsByTagName('a')[rn].setAttribute('style', 'color: red; text-decoration: line-through;');
                            document.getElementById('quizrp_span_getHint').parentNode.removeChild(document.getElementById('quizrp_span_getHint'));
                            createspan('hint', '提示已獲取。', 'color: green;');
                        } else start();
                    });
                });
            }
        });
    };

    var originalQAShowed = false;
    quizrp_btn_showOriginal.onclick = () => showOriginalQA();

    function showOriginalQA() {
        if (originalQAShowed == false) {
            originalQAShowed = true;
            document.getElementById('quizrp_btn_showOriginal').parentNode.removeChild(document.getElementById('quizrp_btn_showOriginal'));
            document.getElementById('quizrp_div_showOriginal').setAttribute('style', 'margin: 10px 0px 10px 0px; padding:10px 10px 0px 10px; border: 1px solid #cccccc;');
            document.getElementById('quizrp_div_showOriginal').innerHTML = '題目編號：' + this_quiz_sn + '<br>原題目：' + this_quiz_question +
                '<ul style="list-style-type:decimal; padding:10px 0px 10px 30px;"><li>' + this_quiz_option[0] + '</li>' +
                '<li>' + this_quiz_option[1] + '</li>' +
                '<li>' + this_quiz_option[2] + '</li>' +
                '<li>' + this_quiz_option[3] + '</li></ul>';
        }
        getDB().then(quizBD => {
            let targetsort = quizDB.findIndex(element => { return element.sn == this_quiz_sn; });
            if (targetsort > -1 && quizDB[targetsort].answer) {
                for (let i = 0; i < 4; i++) {
                    if (quizDB[targetsort]['answer_' + (i + 1)] == 'N') {
                        document.getElementById('quizrp_div_showOriginal').getElementsByTagName('li')[i].setAttribute('style', 'color: red; text-decoration: line-through;');
                    } else if (quizDB[targetsort]['answer_' + (i + 1)] == 'Y') {
                        document.getElementById('quizrp_div_showOriginal').getElementsByTagName('li')[i].setAttribute('style', 'color: green; font-weight: bold;');
                    }
                }
            } else {
                getAns().then(ans => {
                    handledata(ans, true);
                    for (let i = 0; i < 4; i++) {
                        if (i != ans) {
                            document.getElementById('quizrp_div_showOriginal').getElementsByTagName('li')[i].setAttribute('style', 'color: red; text-decoration: line-through;');
                        } else {
                            document.getElementById('quizrp_div_showOriginal').getElementsByTagName('li')[i].setAttribute('style', 'color: green; font-weight: bold;');
                        }
                    }
                });
            }
        });
    }
})();