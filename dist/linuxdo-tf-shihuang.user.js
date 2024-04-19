// ==UserScript==
// @name       LinuxDo@真假始皇
// @namespace  bmqy.net
// @version    1.0.0
// @author     bmqy
// @icon       https://cdn.linux.do/uploads/default/original/1X/3a18b4b0da3e8cf96f7eea15241c3d251f28a39b.png
// @match      https://linux.do/*
// @connect    cfw.887776.xyz
// @grant      GM_getValue
// @grant      GM_setValue
// @grant      GM_xmlhttpRequest
// ==/UserScript==

(function () {
  'use strict';

  const api = "https://cfw.887776.xyz/linuxdo-tf-shihuang";
  let blacklist = [];
  let update = 0;
  let storeKey = "TFShiHuangBlacklist";
  function init() {
    getBlacklist();
    onMutationObserver();
  }
  function getBlacklist() {
    let storeVal = GM_getValue(storeKey) || {
      blacklist: [],
      update: 0
    };
    blacklist = storeVal.blacklist;
    update = storeVal.update;
    update = parseInt(update);
  }
  function syncBlacklist() {
    let $syncBtn = document.querySelector(".sync-blacklist-btn");
    $syncBtn.innerText = "上次同步：同步中...";
    GM_xmlhttpRequest({
      method: "get",
      url: api,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      responseType: "json",
      onload: function(xhr) {
        if (xhr.status == 200) {
          blacklist = xhr.response.blacklist;
          update = xhr.response.update;
          update = parseInt(update);
        } else {
          blacklist = [];
        }
        GM_setValue(storeKey, {
          blacklist,
          update
        });
        $syncBtn.innerText = "上次同步：" + new Date(update).toLocaleString();
      },
      onerror: function(xhr) {
        console.log("获取黑名单错误：" + xhr.responseText);
      }
    });
  }
  function getRandomString() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let random = "";
    for (var i = 0; i < 18; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return random;
  }
  function insertAddBlacklistBtn(element, cardName) {
    let $addBtn = document.createElement("button");
    $addBtn.type = "button";
    $addBtn.title = "LinuxDo@真假始皇 - 标记按钮，如无效，请刷新页面";
    $addBtn.setAttribute("class", "add-blacklist-btn widget-button btn-flat post-action-menu__copy-link no-text btn-icon");
    $addBtn.setAttribute("cardName", cardName);
    if (!blacklist.includes(cardName)) {
      $addBtn.innerText = "+ 标记他 +";
      $addBtn.addEventListener("click", function() {
        updateBlacklist(element, cardName, "add");
      });
    } else {
      $addBtn.innerText = "- 标错了 -";
      $addBtn.addEventListener("click", function() {
        updateBlacklist(element, cardName, "remove");
      });
    }
    let parent = element.querySelector(".actions");
    parent.insertBefore($addBtn, parent.firstChild);
  }
  function insertSyncBlacklistBtn() {
    let $syncBtnBox = document.createElement("div");
    $syncBtnBox.setAttribute("style", "position:relative;top: 80px;margin-top: 1em;display: flex;gap: .5em;flex-wrap:wrap;transition: opacity .2s ease-in;");
    let $syncBtn = document.createElement("button");
    $syncBtn.type = "button";
    $syncBtn.title = "LinuxDo@真假始皇 - 同步按钮，如无效，请刷新页面";
    $syncBtn.setAttribute("class", "sync-blacklist-btn show-summary btn btn-small");
    $syncBtn.setAttribute("style", "white-space: nowrap;");
    $syncBtn.innerText = "上次同步：" + (!update ? "从未" : new Date(update).toLocaleString());
    $syncBtn.addEventListener("click", function() {
      syncBlacklist();
    });
    $syncBtnBox.appendChild($syncBtn);
    let parent = document.querySelector(".topic-timeline");
    if (parent && !parent.querySelector(".sync-blacklist-btn")) {
      parent.appendChild($syncBtnBox);
    }
  }
  function updateBlacklist(element, cardName, action) {
    if (cardName === "neo" || !cardName) {
      return false;
    }
    let $addBtn = element.querySelector(".add-blacklist-btn");
    $addBtn.innerText = action === "add" ? "· 标记中... ·" : "· 移除中... ·";
    GM_xmlhttpRequest({
      method: "post",
      url: api,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      data: JSON.stringify({ cardName, action }),
      responseType: "json",
      onload: function(xhr) {
        if (xhr.status == 200) {
          blacklist.push(cardName);
          changeFakeAvatar(element, action);
          $addBtn.innerText = action === "add" ? "- 标错了 -" : "+ 标记他 +";
          $addBtn.removeEventListener("click", updateBlacklist);
          $addBtn.addEventListener("click", function() {
            updateBlacklist(element, cardName, action);
          });
          syncBlacklist();
        } else {
          console.log("标记失败：" + xhr.responseText);
        }
      },
      onerror: function(xhr) {
        console.log("标记失败：" + xhr.responseText);
      }
    });
  }
  function changeFakeAvatar(element, action) {
    let $fullName = element.querySelector(".names .first a");
    let $avatar = element.querySelector(".post-avatar .avatar");
    if (action === "add") {
      $fullName.setAttribute("style", "border:1px dotted red;padding:0px 5px;border-radius:5px;");
      let randomAvatar = `https://api.multiavatar.com/${getRandomString()}.png`;
      if ($avatar.getAttribute("src").indexOf("api.multiavatar.com") == -1) {
        $avatar.setAttribute("src", randomAvatar);
      }
    } else {
      $fullName.setAttribute("style", "");
    }
  }
  function onMutationObserver() {
    let mos = new MutationObserver(function(mutations, observer) {
      for (const mutation in mutations) {
        if (Object.hasOwnProperty.call(mutations, mutation)) {
          const element = mutations[mutation];
          if (element.target.nodeName == "DIV") {
            if (element.target.classList.contains("topic-post")) {
              insertSyncBlacklistBtn();
              let $fullName = element.target.querySelector(".names .first a");
              let cardName = $fullName.getAttribute("data-user-card");
              cardName = cardName.toLowerCase();
              if (cardName != "neo") {
                if (!element.target.querySelector(".add-blacklist-btn")) {
                  insertAddBlacklistBtn(element.target, cardName);
                }
                if (blacklist.includes(cardName)) {
                  changeFakeAvatar(element.target, "add");
                }
              }
            }
          }
        }
      }
    });
    if (document.querySelector("#main")) {
      mos.observe(document.querySelector("#main"), {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
  }
  init();

})();