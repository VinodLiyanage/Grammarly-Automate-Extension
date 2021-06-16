/**
 * @name automate.js
 * @version 1.0
 * @author Vinod Liyanage
 * @license MIT
 * @description Automate all the suggestions on grammarly.com
 */

class Observer {
  constructor(target) {
    this.target = target;
    this.config = { attributes: false, childList: true, subtree: true };
  }

  init() {
    this.observer = new MutationObserver((mutationsList, observer) =>
      this.observerCallback(mutationsList, observer)
    );
    this.observer.observe(this.target, this.config);
  }

  async replacer() {
    while (true) {
      let suggestionCardsList = Array.from(
        this.target.querySelectorAll(
          'div[data-purpose="card-list-connector"] div[data-id]'
        ) || []
      );

      if (!suggestionCardsList.length) break;

      const isCardsAvailable = suggestionCardsList.some((card) => {
        return card.querySelector("div[data-aid]") ? true : false;
      });

      if (!isCardsAvailable) break;

      let isCardFake = true;

      const editor = document.querySelector(".ql-editor");
      if (editor instanceof HTMLElement) {
        editor.setAttribute("contenteditable", "false");
      }

      for (let parentElement of suggestionCardsList) {
        const card = parentElement.querySelector("div[data-aid]");
        if (!(card && card instanceof HTMLElement)) continue;

        card.click();

        const replaceBtn = parentElement.querySelector(
          'div[data-name="card/apply-insert"]'
        );
        const removeBtn = parentElement.querySelector(
          'div[data-name="card/apply-remove"]'
        );
        const updateAll = parentElement.querySelector(
          'div[data-name="card/update-all"]'
        );
        const ignoreBtn = parentElement.querySelector(
          'div[data-name="card/ignore"]'
        );
        const bulkAccept = parentElement.querySelector(
          'div[data-name="card/bulk-accept-apply"]'
        );

        if (
          !(replaceBtn || removeBtn || updateAll || ignoreBtn || bulkAccept)
        ) {
          continue;
        } else {
          isCardFake = false;
        }

        await new Promise((resolve) => {
          const timeOut = setTimeout(() => {
            if (replaceBtn && replaceBtn instanceof HTMLElement) {
              replaceBtn.click();
            } else if (removeBtn && removeBtn instanceof HTMLElement) {
              removeBtn.click();
            } else if (bulkAccept && bulkAccept instanceof HTMLElement) {
              bulkAccept.click();
            } else if (updateAll && updateAll instanceof HTMLElement) {
              updateAll.click();
            } else if (ignoreBtn && ignoreBtn instanceof HTMLElement) {
              ignoreBtn.click();
            }

            try {
              if (
                replaceBtn.dataset.disabled === "true" ||
                removeBtn.dataset.disabled === "true" ||
                bulkAccept.dataset.disabled === "true" ||
                updateAll.dataset.disabled === "true"
              ) {
                ignoreBtn.click();
              }
            } catch (e) {
              null;
            }
            clearTimeout(timeOut);
            resolve(true);
          }, 100);
        });
      }

      if (editor instanceof HTMLElement) {
        editor.setAttribute("contenteditable", "true");
      }

      if (isCardFake) break;
    }
  }

  async observerCallback(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (!mutation.addedNodes.length) continue;
      if (mutation.removedNodes.length) continue;
      if (mutation.addedNodes[0].nodeName !== "DIV") continue;
      if (!this.target.querySelector('div[data-purpose="card-list-connector"]'))
        continue;

      if (
        this.target.querySelector(
          'div[data-purpose="card-list-connector"] div[data-id]'
        )
      ) {
        //* kick start, when it is needed.
        const firstSpanElem = document.querySelector(".ql-editor span");
        if (firstSpanElem && firstSpanElem instanceof HTMLElement) {
          firstSpanElem.click();
        }

        observer.disconnect();
        await this.replacer();
        observer.observe(this.target, this.config);
      }
    }
  }
}

function checker(checkerCallback) {
  const checkerInterval = setInterval(() => {
    const element = document.querySelector(
      'div[data-name="sidebar-tier"] div[data-name="sidebar"]'
    );

    if (element && element instanceof HTMLElement) {
      clearInterval(checkerInterval);
      checkerCallback(element);
    }
  }, 200);
}

function checkerCallback(element) {
  const observer = new Observer(element);
  observer.init();
}

(() => {
  checker(checkerCallback);
})();
