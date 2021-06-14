const log = console.log;

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

  async replacer(suggestionCardsList) {
    for (let parentCard of suggestionCardsList) {
      const card = parentCard.querySelector('div[data-aid]')
      if(!(card && card instanceof HTMLElement)) continue;

      await new Promise((resolve) => {
        setTimeout(() => {
          card.click();

          const replaceBtn = parentCard.querySelector(
            'div[data-name="card/apply-insert"]'
          );
          const removeBtn = parentCard.querySelector(
            'div[data-name="card/apply-remove"]'
          );

          if (replaceBtn && replaceBtn instanceof HTMLElement) {
            replaceBtn.click() 
          }
          if (removeBtn && removeBtn instanceof HTMLElement) {
            removeBtn.click()
          }
          resolve(true);
        }, 1000);
      });
    }
  }

  setEndOfContenteditable(contentEditableElement) {
    if(!(contentEditableElement && contentEditableElement instanceof HTMLElement)) return;

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

  async observerCallback(mutationsList, observer) {
    log("observer is called!");

    for (let mutation of mutationsList) {
      if (!mutation.addedNodes.length) continue;
      if (mutation.removedNodes.length) continue;
      if (mutation.addedNodes[0].nodeName !== "DIV") continue;
      if (!this.target.querySelector('div[data-purpose="card-list-connector"]')) continue;

      let suggestionCardsList = Array.from(
        this.target.querySelectorAll(
          'div[data-purpose="card-list-connector"] div[data-id]'
        ) || []
      );
      if (!suggestionCardsList.length) continue;

      log("mutation", mutation);

      observer.disconnect();
      await this.replacer(suggestionCardsList);
      this.setEndOfContenteditable(document.querySelector(".ql-editor"));
      observer.observe(this.target, this.config);
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
