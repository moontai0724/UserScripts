// ==UserScript==
// @name         巴哈黑名單、關鍵詞、字數過少隱藏顯示
// @namespace    https://home.gamer.com.tw/moontai0724
// @version      3.0
// @description  在巴哈姆將黑名單、關鍵詞、字數過少過濾文章留言，在頂端列可以開關過濾器（一次性）
// @author       moontai0724
// @match        https://forum.gamer.com.tw/B.php*
// @match        https://forum.gamer.com.tw/Bo.php*
// @match        https://forum.gamer.com.tw/C.php*
// @match        https://forum.gamer.com.tw/Co.php*
// @match        https://forum.gamer.com.tw/search.php*
// @resource     popup_window https://raw.githubusercontent.com/moontai0724/UserScripts/develop/BlockListHide/popup_window.html
// @resource     main.css https://raw.githubusercontent.com/moontai0724/UserScripts/develop/BlockListHide/main.css
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @connect      home.gamer.com.tw
// @supportURL   https://home.gamer.com.tw/creationDetail.php?sn=3962393
// @license      MIT
// ==/UserScript==

(function (jQuery) {
    'use strict';
    const debug = false;
    var setting = getSetting();

    /**
     * Initialize script, buttons and monitors
     */
    (function initializeScript() {
        if (debug) console.log("BlockListHide: initializing script...");
        jQuery(".BH-menuE").append('<li class="HBL toggleStatus"><a><span></span>過濾器</a></li>');
        jQuery(".BH-menuE").append('<li class="HBL openSetting"><a>過濾器設定</a></li>');
        jQuery("body").append('<button id="HBL_popup_window_loaded_listener" style="display: none;"></button>');
        GM_addStyle(GM_getResourceText("main.css"));

        // monitor
        jQuery(".HBL.toggleStatus").on("click", toggleHideStatus);
        jQuery(".HBL.openSetting").on("click", openSettingWindow);
        jQuery("#HBL_popup_window_loaded_listener").on("click", initializeSettingWindow);

        if (debug) setInterval(() => console.log("BlockListHide: ", setting), 3000);
    })();

    /**
     * To get setting from script storage
     * If old setting exists, convert it from local storage to script storage
     */
    function getSetting() {
        if (debug) console.log("BlockListHide: getting setting...");
        var setting = GM_getValue("HBL_Setting", {
            switch: {
                keywordPostFilter: true,
                keywordCommentFilter: true,
                blacklistPostFilter: true,
                blacklistCommentFilter: true,
                contentLengthPostFilter: false,
                contentLengthCommentFilter: false,
            },
            lengthLimit: {
                contentLengthPostLimit: 2,
                contentLengthCommentLimit: 2
            },
            data: {
                forceShowList: [],
                forceHideList: [],
                blockKeywordsPC: [],
                postBlockKeywordsPC: [],
                commentBlockKeywordsPC: [],
                blockKeywordsFC: [],
                postBlockKeywordsFC: [],
                commentBlockKeywordsFC: []
            }
        });

        // Convert local storage to script storage
        if (localStorage.getItem("BLH_Setting")) {
            if (debug) console.log("BlockListHide: convert setting from local storage to script storage", setting);
            setting = JSON.parse(localStorage.getItem("BLH_Setting"));
            localStorage.removeItem("BLH_Setting");
            GM_setValue("HBL_Setting", setting);
        }

        if (debug) console.log("BlockListHide: returned setting", setting);
        return setting;
    }

    /**
     * To save setting
     */
    function saveSetting() {
        if (debug) console.log("BlockListHide: saving setting...", setting);
        GM_setValue("HBL_Setting", setting);
    }


    /**
     * To reset setting
     */
    function resetSetting() {
        if (debug) console.log("BlockListHide: resetting setting...", setting);
        if (window.confirm("確定要初始化設定？")) {
            GM_deleteValue("HBL_Setting");
            setting = getSetting();
            closeSettingWindow();
        }
    }

    /**
     * Toggle hide element status
     */
    function toggleHideStatus() {
        if (debug) console.log("BlockListHide: toggleing hide status...");
        jQuery('body').toggleClass('HBL_ENABLED');
    }

    /**
     * Open setting window
     */
    function openSettingWindow() {
        if (debug) console.log("BlockListHide: opening setting window...");
        // load setting popup window
        jQuery("body").append(GM_getResourceText("popup_window"));
    }

    /**
     * To initialize setting window, initialize data display and monitors
     */
    function initializeSettingWindow() {
        if (debug) console.log("BlockListHide: initializing setting window...");
        // initialize switch data
        for (let key in setting.switch) {
            if (debug) console.log("BlockListHide: initializing setting window of switch: ", key);
            if (setting.switch[key] == true) {
                jQuery(`.HBL.SW_switch[data-id="${key}"]`).addClass("on");
            }
        }

        // initialize lengthLimit data
        for (let key in setting.lengthLimit) {
            if (debug) console.log("BlockListHide: initializing setting window of lengthLimit: ", key);
            jQuery(`.HBL.SW_lengthLimit[data-id="${key}"] > span.amount`).text(setting.lengthLimit[key]);
        }

        // initialize other data
        for (let key in setting.data) {
            if (debug) console.log("BlockListHide: initializing setting window of data: ", key);
            var target = jQuery(`.HBL.SW_item[data-id="${key}"] .SW_row`);
            setting.data[key].forEach(function (value) {
                target.append(`<label data-value="${value}"><input type="checkbox" data-value="${value}">${decodeURIComponent(value)}</label>`);
            });
        }

        // monitor switch button
        jQuery(".HBL.SW_switch button").on("click", toggleSwitchEventHandler);

        // monitor change content length limit button
        jQuery(".HBL.SW_lengthLimit button").on("click", changeLengthLimitEventHandler);

        // monitor add value button
        jQuery(".HBL.SW_item .SW_addValue").on("click", addValuesEventHandler);

        // monitor remove value button
        jQuery(".HBL.SW_item .SW_removeValue").on("click", removeValuesEventHandler);

        // monitor manual backup button
        jQuery(".HBL.SW_item.manualBackup button").on("click", manualBackupEventHandler);

        // monitor manual restore button
        jQuery(".HBL.SW_item.manualRestore button").on("click", manualRestoreEventHandler);

        // monitor reset setting button
        jQuery(".HBL.SW_item.resetSetting button").on("click", resetSetting);

        // monitor close button
        jQuery("button.HBL.close").on("click", closeSettingWindow);

        // monitor mouseenter event on SW_case
        jQuery(".HBL.SW_case").on("mouseenter", event => jQuery(".HBL.SW_case").addClass("active"));

        // monitor mouseleave event on SW_case
        jQuery(".HBL.SW_case").on("mouseleave", event => jQuery(".HBL.SW_case").removeClass("active"));

        // monitor click event on SW_background
        jQuery(".HBL.SW_background").on("click", event => {
            if (!jQuery(".HBL.SW_case").hasClass("active"))
                closeSettingWindow();
        });
        if (debug) console.log("BlockListHide: initializing setting window finished");
    }

    /**
     * Close setting window
     */
    function closeSettingWindow() {
        if (debug) console.log("BlockListHide: closing setting window ");
        jQuery(".HBL.popup").remove();
    }

    /**
     * Handle click event of toggle switches of setting button
     * @param {Event} event button click event
     */
    function toggleSwitchEventHandler(event) {
        var target = jQuery(event.target).parents(".SW_switch");
        if (debug) console.log("BlockListHide: toggling switch: ", target);
        target.toggleClass("on");
        setting.switch[target.data("id")] = target.hasClass("on");
        saveSetting();
    }

    /**
     * Handle click event of change content length limit button
     * @param {Event} event button click event
     */
    function changeLengthLimitEventHandler(event) {
        var target = jQuery(event.target).parents(".SW_lengthLimit");
        if (debug) console.log("BlockListHide: changing content length limit: ", target);
        var lengthLimit = window.prompt("請輸入半形正整數，若輸入５將過濾５字內（含５字）內容。");
        if (/^\d+$/.test(lengthLimit) && parseInt(lengthLimit) > 0) {
            setting.lengthLimit[target.data("id")] = parseInt(lengthLimit);
            target.find(".amount").text(lengthLimit);
            saveSetting();
        } else {
            window.alert("請確認您的輸入，須為半形數字並大於零。");
        }
    }

    /**
     * Handle click event of add values button
     * @param {Event} event button click event
     */
    function addValuesEventHandler(event) {
        let target = jQuery(event.target).parents(".SW_item");
        if (debug) console.log("BlockListHide: adding values: ", target);
        let dataKey = target.data("id");
        let values = window.prompt("請輸入欲新增的值（不分大小寫，使用空白分隔。）");

        // When canceled prompt, cancel adding.
        if (values == null) return false;

        // Split into arrays by space
        values = values.split(/\s/);

        values.forEach(value => manualAddValue(dataKey, value));
    }

    /**
     * Manual add value, check data before adding
     * @param {String} dataKey key of JSON setting data
     * @param {String} value value ready to add
     */
    function manualAddValue(dataKey, value) {
        if (debug) console.log("BlockListHide: manual add value: ", dataKey, value);
        let settingInfo = {
            forceShowList: {
                type: "ＩＤ",
                name: "ＩＤ封鎖 - 白名單（強制顯示）",
                opposite: ["forceHideList"],
                partner: null,
                parent: null
            }, forceHideList: {
                type: "ＩＤ",
                name: "ＩＤ封鎖 - 黑名單（強制隱藏）",
                opposite: ["forceShowList"],
                partner: null,
                parent: null
            }, blockKeywordsPC: {
                type: "關鍵詞",
                name: "部分符合 - 全域過濾",
                opposite: ["postBlockKeywordsPC", "commentBlockKeywordsPC"],
                partner: null,
                parent: null
            }, postBlockKeywordsPC: {
                type: "關鍵詞",
                name: "部分符合 - 文章過濾",
                opposite: ["blockKeywordsPC"],
                partner: "commentBlockKeywordsPC",
                parent: "blockKeywordsPC"
            }, commentBlockKeywordsPC: {
                type: "關鍵詞",
                name: "部分符合 - 留言過濾",
                opposite: ["blockKeywordsPC"],
                partner: "postBlockKeywordsPC",
                parent: "blockKeywordsPC"
            }, blockKeywordsFC: {
                type: "關鍵詞",
                name: "完全符合 - 全域過濾",
                opposite: ["postBlockKeywordsFC", "commentBlockKeywordsFC"],
                partner: null,
                parent: null
            }, postBlockKeywordsFC: {
                type: "關鍵詞",
                name: "完全符合 - 文章過濾",
                opposite: ["blockKeywordsFC"],
                partner: "commentBlockKeywordsFC",
                parent: "blockKeywordsFC"
            }, commentBlockKeywordsFC: {
                type: "關鍵詞",
                name: "完全符合 - 留言過濾",
                opposite: ["blockKeywordsFC"],
                partner: "postBlockKeywordsFC",
                parent: "blockKeywordsFC"
            }
        };

        // if value is null
        if (value == "") {
            return false;
        }

        // Terminate when value already exists in this list
        if (setting.data[dataKey].includes(encodeURIComponent(value))) {
            window.alert("此清單中已經含有 " + value);
            return false;
        }

        // Prompt when value already exists in opposite list (which means value can't exist in both list at the same time)
        settingInfo[dataKey].opposite.forEach(function (oppositeKey) {
            if (setting.data[oppositeKey].includes(encodeURIComponent(value))) {
                if (window.confirm(`「${settingInfo[oppositeKey].name}」中已經有此${settingInfo[oppositeKey].type}，是否從該清單中移除並加到此清單？`)) {
                    // Remove value from opposite list
                    removeValue(oppositeKey, value);
                } else {
                    // Terminate when user doesn't want to add to opposite list
                    return false;
                }
            }
        });

        // If partner list have this value, remove and put it to parent list.
        if (settingInfo[dataKey].partner && setting.data[settingInfo[dataKey].partner].includes(encodeURIComponent(value))) {
            // Remove value from partner list
            removeValue(settingInfo[dataKey].partner, value);
            // Change adding target to parent list
            dataKey = settingInfo[dataKey].parent;
        }

        addValue(dataKey, value);
    }

    /**
     * Add value to data and view
     * @param {String} dataKey key of JSON setting data
     * @param {String} value value ready to add, which is not been encoded by encodeURIComponent
     */
    function addValue(dataKey, value) {
        if (debug) console.log("BlockListHide: add value: ", dataKey, value);
        value = encodeURIComponent(decodeURIComponent(value));
        // Add value to data
        setting.data[dataKey].push(value);
        // Add value to view
        jQuery(`[data-id="${dataKey}"] > div.SW_row`).append(`<label data-value="${value}"><input type="checkbox" data-value="${value}">${decodeURIComponent(value)}</label>`);
        saveSetting();
    }

    /**
     * Handle click event of remove values button
     * @param {Event} event button click event
     */
    function removeValuesEventHandler(event) {
        var target = jQuery(event.target).parents(".SW_item");
        if (debug) console.log("BlockListHide: remove values: ", target);
        var dataKey = target.data("id");
        target.find("input:checked").each(function (index, element) {
            var value = jQuery(element).data("value");
            removeValue(dataKey, value);
        });
    }

    /**
     * Remove value from data and view
     * @param {String} dataKey key of JSON setting data
     * @param {String} value value ready to remove, which is not been encoded by encodeURIComponent
     */
    function removeValue(dataKey, value) {
        if (debug) console.log("BlockListHide: removing value: ", dataKey, value);
        value = encodeURIComponent(decodeURIComponent(value));
        var valueIndex = setting.data[dataKey].indexOf(value);
        // Remove value from data
        setting.data[dataKey].splice(valueIndex, 1);
        // Remove value from view
        jQuery(`.SW_item[data-id="${dataKey}"] label[data-value="${value}"]`).remove();
        saveSetting();
    }

    /**
     * Handle click event of manual backup button
     * @param {Event} event button click event
     */
    function manualBackupEventHandler(event) {
        var target = jQuery(event.target).parents(".SW_item");
        if (debug) console.log("BlockListHide: manual backup setting", target);
        target.find("input[type=text]").val(JSON.stringify(setting));
    }

    /**
     * Handle click event of manual restore button
     * @param {Event} event button click event
     */
    function manualRestoreEventHandler(event) {
        var target = jQuery(event.target).parents(".SW_item");
        if (debug) console.log("BlockListHide: manual restore setting", target);
        var settingFromUser = target.find("input[type=text]").val().replace(/\s/g, "");

        // check input is JSON or not
        try {
            settingFromUser = JSON.parse(settingFromUser);
        } catch (e) {
            window.alert("請在輸入框中貼上正確的設定！");
            return false;
        }

        const settingStructure = {
            switch: {
                keywordPostFilter: "boolean",
                keywordCommentFilter: "boolean",
                blacklistPostFilter: "boolean",
                blacklistCommentFilter: "boolean",
                contentLengthPostFilter: "boolean",
                contentLengthCommentFilter: "boolean",
            },
            lengthLimit: {
                contentLengthPostLimit: "number",
                contentLengthCommentLimit: "number"
            },
            data: {
                forceShowList: "object",
                forceHideList: "object",
                blockKeywordsPC: "object",
                postBlockKeywordsPC: "object",
                commentBlockKeywordsPC: "object",
                blockKeywordsFC: "object",
                postBlockKeywordsFC: "object",
                commentBlockKeywordsFC: "object"
            }
        }

        if (debug) console.log("BlockListHide: validating settingFromUser...", settingFromUser);
        // check setting structure is correct
        for (let settingKey in setting) {
            if (settingFromUser[settingKey]) {
                for (let dataKey in setting[settingKey]) {
                    console.log("BlockListHide: ", typeof settingFromUser[settingKey][dataKey], settingStructure[settingKey][dataKey])
                    if (typeof settingFromUser[settingKey][dataKey] === "undefined") {
                        window.alert(`設定檔有缺失必要內容：「${settingKey}」下的「${dataKey}」，請重新確認內容。`);
                        return false;
                    } else if (typeof settingFromUser[settingKey][dataKey] !== settingStructure[settingKey][dataKey]) {
                        window.alert(`設定檔資料型態錯誤：「${settingKey}」下的「${dataKey}」，應該要是「${settingStructure[settingKey][dataKey]}」但偵測到「${typeof settingFromUser[settingKey][dataKey]}」請重新確認內容。`);
                        return false;
                    }
                }
            } else {
                window.alert(`設定檔有缺失必要內容：「${settingKey}」，請重新確認內容。`);
                return false;
            }
        }

        if (debug) console.log("BlockListHide: restore setting succeed!");
    }
})(jQuery);