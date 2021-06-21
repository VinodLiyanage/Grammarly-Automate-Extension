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
    this.running = true;
  }

  init() {
    this.observer = new MutationObserver((mutationsList, observer) =>
      this.observerCallback(mutationsList, observer)
    );
    this.observer.observe(this.target, this.config);
  }

  setEndOfContenteditable(contentEditableElement) {
    if (
      !(contentEditableElement && contentEditableElement instanceof HTMLElement)
    )
      return;

    let range, selection;
    if (document.createRange) {
      range = document.createRange(); //Create a range (a range is a like the selection but invisible)
      range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
      range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
      selection = window.getSelection(); //get the selection object (allows you to change selection)
      selection.removeAllRanges(); //remove any selections already made
      selection.addRange(range); //make the range you have just created the visible selection
    } else if (document.selection) {
      //IE 8 and lower
      range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
      range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
      range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
      range.select(); //Select the range (make it the visible selection
    }
  }

  start() {
    this.running = true;

    this.observer.disconnect()
    this.observer.observe(this.target, this.config)

    const target = this.target.querySelector(
      'div[data-purpose="card-list-connector"]'
    )

    if(!(target instanceof HTMLElement)) return;

    const prevTemp = document.getElementById('grammaly-automator-fake-card')
    if(prevTemp instanceof HTMLElement) {
      prevTemp.remove()
    }

    const temp = document.createElement("div")
    temp.setAttribute('data-id', 'grammaly-automator-fake-card')
    temp.setAttribute('id', 'grammaly-automator-fake-card')

    temp.style.display = 'none';
    target.append(temp)
  } 
  stop() {
    this.running = false;
    this.observer.disconnect()
  }
  async replacer() {
    while (this.running) {
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

      for (let parentElement of suggestionCardsList) {
        if(!this.running) return; // immediate exit

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
        this.setEndOfContenteditable(document.querySelector(".ql-editor"));
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

async function checkerCallback(element) {
  addButtons();
  const observer = new Observer(element);
  observer.init();
  handleButton(observer)
  
}

async function handleButton(observer) {

  const startbtn = document.getElementById("btnStartAutomator");
  const stopbtn = document.getElementById("btnStopAutomator");

  if (!(startbtn instanceof HTMLElement && stopbtn instanceof HTMLElement))
    return;

  const handleStart = () => {
    observer.start()

    startbtn.classList.add('grammarly-btn-click')
    const startbtnTimeOut = setTimeout(()=> {
      startbtn.classList.remove('grammarly-btn-click')
      clearTimeout(startbtnTimeOut)
    }, 500)
   
  };
  const handleStop = () => {
    observer.stop()

    stopbtn.classList.add('grammarly-btn-click')
    const stopbtnTimeOut = setTimeout(()=> {
      stopbtn.classList.remove('grammarly-btn-click')
      clearTimeout(stopbtnTimeOut)
    }, 500)
  };

  startbtn.addEventListener("click", handleStart);
  stopbtn.addEventListener("click", handleStop);
}

function addButtons() {
  const parser = new DOMParser();

  const htmlString = `<div class="grammarly-automator-shortcut-container" id="automatorBtnContainer">
  <!--<p class="grammarly-automator-title">Grammarly Automator</p>-->
  <button class="grammarly-automator-start-btn" id="btnStartAutomator">Start</button>
  <button class="grammarly-automator-stop-btn" id="btnStopAutomator">Stop</button>
  </div>`;
  const element = parser.parseFromString(htmlString, "text/html");
  document.body.insertAdjacentElement("afterbegin", element.body.firstChild);
}

(() => {
  checker(checkerCallback);
})();
