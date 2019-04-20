// ==UserScript==
// @name         巴哈板務工具箱
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      0.1
// @description  更方便的刪除、水桶、寄信等操作，也可以組合各種操作進行管理。
// @author       moontai0724
// @match        https://forum.gamer.com.tw/*
// @resource     BMAssistantCss https://raw.githubusercontent.com/moontai0724/UserScripts/master/BMAssistant.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';
    GM_addStyle(GM_getResourceText("BMAssistantCss"));

    jQuery(`<div style="float: right; margin-top: 2px; margin-right: 12px;">
    <button type="button" class="btn--sm btn--normal BMAssistant_Button">板務功能</button>
</div>`).insertAfter(".jumptomanage");

    let manageMenu = document.createElement("div");
    manageMenu.id = "BMAssistant_manageMenu";
    manageMenu.style = "display: none;";
    manageMenu.innerHTML = `<div class="dropdown-menu"><ul><li><a href="javascript:;">刪除</a></li><li><a href="javascript:;">水桶</a></li><li><a href="javascript:;">寄信</a></li><li><a href="javascript:;">組合操作</a></li></ul></div>`;
    document.body.appendChild(manageMenu);

    let tippyBtn = tippy(".BMAssistant_Button", {
        html: "#BMAssistant_manageMenu",
        position: "top",
        arrow: true,
        interactive: true,
        hideOnClick: false,
        theme: "light",
        duration: 240,
        onShow: function () {
            let postData = JSON.parse(jQuery(tippyBtn.getReferenceElement(this)).parents(".c-post__body__buttonbar").find(".jumptomanage>button")[0].dataset.tippy);

            jQuery(this).find("a:eq(0)").off("click").on("click", () => openSettingWindow("Delete", postData));
            jQuery(this).find("a:eq(1)").off("click").on("click", () => openSettingWindow("Water", postData));
            jQuery(this).find("a:eq(2)").off("click").on("click", () => openSettingWindow("Mail", postData));
            jQuery(this).find("a:eq(3)").off("click").on("click", () => openSettingWindow("Combined Action", postData));

            jQuery(this).on("click", () => jQuery(this).remove());
        }
    });

    /**
     * Create a window includes background and a box include title, body, close button.
     * @param {String} type Type of action. (Delete, Water, Mail, Combined Action.)
     * @param {JSON} postData Data infomations of the post in JSON format.
     */
    function openSettingWindow(type, postData) {
        console.log(type, postData);
        let ch = ["刪除文章", "水桶", "寄信", "組合操作"];
        let types = ["Delete", "Water", "Mail", "Combined Action"];

        // black background
        let background = document.createElement("div");
        background.id = "BMAssistant_SW_Background";
        background.setAttribute("onmousedown", "javascript:if(!jQuery(this).hasClass('mouseenter')) jQuery(this).remove();");
        document.body.appendChild(background);

        // window case
        let Case = document.createElement("div");
        Case.id = "BMAssistant_SW_Case";
        Case.setAttribute("onmouseenter", "javascipt:jQuery('#BMAssistant_SW_Background').addClass('mouseenter');");
        Case.setAttribute("onmouseleave", "javascipt:jQuery('#BMAssistant_SW_Background').removeClass('mouseenter');");
        document.getElementById("BMAssistant_SW_Background").appendChild(Case);

        // Title
        let Title = document.createElement("div");
        Title.id = "BMAssistant_SW_Title";
        Title.innerHTML = `<h1>${ch[types.indexOf(type)]}</h1>`;
        document.getElementById("BMAssistant_SW_Case").appendChild(Title);

        // Body
        let Body = document.createElement("div");
        Body.id = "BMAssistant_SW_Body";
        Body.innerHTML = returnBody(types.indexOf(type), postData);
        document.getElementById("BMAssistant_SW_Case").appendChild(Body);

        // bottom element
        let Bottom = document.createElement("div");
        Bottom.id = "BMAssistant_SW_Bottom";
        document.getElementById('BMAssistant_SW_Case').appendChild(Bottom);

        // close button
        let CloseButton = document.createElement("button");
        CloseButton.innerHTML = "關閉";
        CloseButton.setAttribute("onclick", "jQuery('#BMAssistant_SW_Background').remove();");
        document.getElementById('BMAssistant_SW_Bottom').appendChild(CloseButton);
    }

    function returnBody(index, postData) {
        let doby = [];
    }
})();