// ==UserScript==
// @name         巴哈姆特信件自訂文字（簽名檔／快速回信）
// @namespace    https://greasyfork.org/users/165315
// @version      1.1
// @description  在巴哈姆特寄信件時加上自訂文字（簽名檔／快速回信）
// @author       moontai0724
// @match        https://mailbox.gamer.com.tw/send.php*
// @match        https://mailbox.gamer.com.tw/reply.php*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    if (!localStorage.signature_setting) {
        localStorage.setItem('signature_setting', JSON.stringify([{ amount: 5, defaultName: undefined }]));
    }

    var div = document.createElement("DIV");
    div.id = 'signature_setting';
    div.setAttribute('style', 'padding: 10px; border: 1px solid lightgrey; background-color: #FFFFFF');
    document.getElementById('frmMail').after(div);

    var signatures = JSON.parse(localStorage.signature_setting);

    if (signatures[0].defaultName && signatures.findIndex(function (element) { return element.name == signatures[0].defaultName; }) > -1) {
        document.getElementsByName('content')[0].innerHTML += signatures[signatures.findIndex(function (element) { return element.name == signatures[0].defaultName; })].data;
    } else {
        signatures[0].defaultName = undefined;
    }

    var clearAll = document.createElement("BUTTON");
    clearAll.setAttribute('style', 'margin: 0px 0px 0px 10px;');
    clearAll.innerHTML = '恢復預設值';
    clearAll.onclick = function () {
        if (window.confirm('將清除所有內容並重整頁面，請確認頁面內容皆已存檔後再執行。') == true) {
            localStorage.setItem('signature_setting', JSON.stringify([{ amount: 5, defaultName: undefined }]));
            setTimeout(function () { window.location.reload(); }, 1000);
        }
    };
    document.getElementById('signature_setting').appendChild(clearAll);

    var setAmount = document.createElement("BUTTON");
    setAmount.setAttribute('style', 'margin: 0px 0px 0px 10px;');
    setAmount.innerHTML = '設置設定檔數量';
    setAmount.onclick = function () {
        let response = window.prompt('此功能將重整頁面，請確認頁面內容皆已存檔後再執行。如設置數量小於現有數量，將會從最後面刪至符合指定數量；如大於目前數量，將會新增至指定數量。請輸入要調整為多少個設定檔，目前為 ' + signatures[0].amount + ' 個設定檔：');
        if (Number(response) > 0) {
            signatures[0].amount = Number(response);
            if (signatures.length > signatures[0].amount) {
                signatures.splice(signatures[0].amount, signatures.length - signatures[0].amount);
            }
            localStorage.setItem('signature_setting', JSON.stringify(signatures));
            setTimeout(function () { window.location.reload(); }, 1000);
        } else {
            window.alert('輸入錯誤。');
        }
    };
    document.getElementById('signature_setting').appendChild(setAmount);

    var setDefault = document.createElement("BUTTON");
    setDefault.setAttribute('style', 'margin: 0px 0px 0px 10px;');
    setDefault.innerHTML = '設置預設簽名檔';
    setDefault.onclick = function () {
        let response = window.prompt('請輸入欲設置為預設值的編號，輸入 0 即為不設置預設值：');
        if (Number(response) == 0) {
            signatures[0].defaultName = undefined;
            localStorage.setItem('signature_setting', JSON.stringify(signatures));
            window.alert('已經清除預設值。');
        } else if (Number(response) > 0 && Number(response) < Number(signatures[0].amount)) {
            signatures[0].defaultName = signatures[Number(response)].name;
            localStorage.setItem('signature_setting', JSON.stringify(signatures));
            window.alert('預設簽名檔已經設置為 ' + signatures[0].defaultName + '，若名稱更改，必須要重新指定預設簽名檔（內容更改不須）。');
        } else {
            window.alert('輸入錯誤。');
        }
    };
    document.getElementById('signature_setting').appendChild(setDefault);

    for (let i = 1; i < Number(signatures[0].amount) + 1; i++) {
        if (!signatures[i]) {
            signatures[i] = {
                name: '自訂文字',
                data: ''
            };
        }

        let div = document.createElement("DIV");
        div.id = 'signature_' + i;
        div.setAttribute('style', 'padding: 10px 0px 10px 0px; border-bottom: 1px solid lightgrey;');
        document.getElementById('signature_setting').appendChild(div);

        let word = document.createElement("DIV");
        word.id = 'signature_word_' + i;
        word.innerHTML = i + '. ' + signatures[i].name + '：';
        if (signatures[0].defaultName == signatures[i].name) {
            word.setAttribute('style', 'color: green;');
        }
        document.getElementById('signature_' + i).appendChild(word);

        let textarea = document.createElement("TEXTAREA");
        textarea.setAttribute('type', 'text');
        textarea.setAttribute('rows', '5');
        textarea.setAttribute('style', 'width: 96%; margin: 10px;');
        textarea.setAttribute('placeholder', '請輸入 ' + signatures[i].name + ' 的內容...');
        textarea.setAttribute('name', 'signature_input_' + i);
        textarea.innerHTML = signatures[i].data;
        document.getElementById('signature_' + i).appendChild(textarea);

        let div2 = document.createElement("DIV");
        div2.id = 'signature_button_' + i;
        document.getElementById('signature_' + i).appendChild(div2);

        let setData = document.createElement("BUTTON");
        setData.setAttribute('style', 'margin: 0px 0px 0px 10px;');
        setData.innerHTML = '儲存並設置';
        setData.onclick = function () {
            if (document.getElementsByName('signature_input_' + i)[0].value) {
                document.getElementsByName('content')[0].innerHTML += document.getElementsByName('signature_input_' + i)[0].value;
                signatures[i].data = document.getElementsByName('signature_input_' + i)[0].value;
                localStorage.setItem('signature_setting', JSON.stringify(signatures));
                window.alert('成功儲存並設置！');
            } else {
                if (window.confirm('設置內容為清除，將移除並重新整理頁面，請確認頁面內容皆已經存檔再點擊！') == true) {
                    signatures.splice(signatures.findIndex(function (element) { return element.name == signatures[i].name; }), 1);
                    localStorage.setItem('signature_setting', JSON.stringify(signatures));
                    setTimeout(function () { window.location.reload(); }, 1000);
                }
            }
        };
        document.getElementById('signature_button_' + i).appendChild(setData);

        let changeName = document.createElement("BUTTON");
        changeName.setAttribute('style', 'margin: 0px 0px 0px 10px;');
        changeName.innerHTML = '更改名稱';
        changeName.onclick = function () {
            signatures[i].name = window.prompt('請輸入欲將 ' + signatures[i].name + ' 更改之名稱：');
            localStorage.setItem('signature_setting', JSON.stringify(signatures));
            document.getElementById('signature_word_' + i).innerHTML = i + '. ' + signatures[i].name + '：';
            document.getElementsByName('signature_input_' + i)[0].setAttribute('placeholder', '請輸入 ' + signatures[i].name + ' 的內容...');
            window.alert('成功更改名稱！');
        };
        document.getElementById('signature_button_' + i).appendChild(changeName);

        let setThisDefault = document.createElement("BUTTON");
        setThisDefault.setAttribute('style', 'margin: 0px 0px 0px 10px;');
        setThisDefault.innerHTML = '設為預設';
        setThisDefault.onclick = function () {
            signatures[0].defaultName = signatures[i].name;
            localStorage.setItem('signature_setting', JSON.stringify(signatures));
            document.getElementById('signature_word_' + i).setAttribute('style', 'color: green;');
            window.alert('預設簽名檔已經設置，若項目名稱更改，必須要重新指定預設簽名檔。');
        };
        document.getElementById('signature_button_' + i).appendChild(setThisDefault);

        let deleteSignature = document.createElement("BUTTON");
        deleteSignature.setAttribute('style', 'margin: 0px 0px 0px 10px;');
        deleteSignature.innerHTML = '移除';
        deleteSignature.onclick = function () {
            if (window.confirm('設置內容為清除，將移除並重新整理頁面，請確認頁面內容皆已經存檔再點擊！') == true) {
                signatures.splice(signatures.findIndex(function (element) { return element.name == signatures[i].name; }), 1);
                localStorage.setItem('signature_setting', JSON.stringify(signatures));
                setTimeout(function () { window.location.reload(); }, 1000);
            }
        };
        document.getElementById('signature_button_' + i).appendChild(deleteSignature);
    }
})();