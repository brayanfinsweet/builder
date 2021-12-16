import { getData } from './htmlData';
// Starter example. Check the comments!
document.addEventListener('DOMContentLoaded', () => {
  let htmlData = getData();
  let doc = new DOMParser().parseFromString(htmlData, "text/html");

  // define all dom nodes
  let closeButton = doc.querySelector<HTMLButtonElement>('[button="closePicker"]')
  let templates = doc.querySelectorAll('[var="template"]')
  let shareLink = doc.querySelector('#link')
  let preview = doc.querySelector<HTMLDivElement>('.preview')
  let saveText = doc.querySelector<HTMLDivElement>('#save')
  let onDelete = doc.querySelector<HTMLDivElement>('[var="onDelete"]')
  let onMoveDown = doc.querySelector<HTMLElement>('[var="onMoveDown"]')
  let prevStart = doc.querySelector<HTMLDivElement>(".preview_start")

  // logic
  if (!shareLink || !templates || !preview || !saveText || !doc || !onDelete) {
    console.log("Couldn't find in dom")
    return
  }
  else {
    let insertPoint: [string, any] = ['undefined', null]
    templates.forEach((template) => {
      template.remove()
    })
    load(preview)


    if (!localStorage.getItem("id")) {
      localStorage.setItem("id", makeid(8))
    }
    const id = localStorage.getItem("id")
    shareLink.setAttribute('href', '/preview?id=' + id)

    async function save(saveText: HTMLDivElement, preview: HTMLDivElement) {
      const url = "https://fsbuilder.b-finsweet.workers.dev/api/submit_data"
      let all_content = <HTMLDivElement>preview.cloneNode(true)

      all_content.querySelectorAll(".controls").forEach((ele) => {
        ele.remove()
      })
      all_content.querySelectorAll(".preview_start").forEach((ele) => {
        ele.remove()
      })
      let data = { "token": id, "html": all_content.innerHTML }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(async response => response.json())
        .then(async (data) => {
          let originalSaveHtml = saveText?.innerHTML
          saveText.innerText = 'Saved!'
          console.log('Success:', data);
          await sleep(3000);
          saveText.innerHTML = originalSaveHtml
        })
      localStorage.setItem("components", preview.innerHTML);
    }

    async function load(preview: HTMLDivElement) {
      let components = localStorage.getItem("components")
      if (components) {
        if (components.length > 0) {
          preview.style.display = "none"
          preview.prepend(components);
        }
      }

    }


    /*
        Listeners
    */

    doc.querySelectorAll(".component-item").forEach((ele, index) => {
      ele.addEventListener("mouseenter", function (this: HTMLElement, ev: Event) {
        let componentItem = this.querySelector<HTMLDivElement>(".component-item")
        let componentBG = this.querySelector<HTMLDivElement>(".component_overlay-bg")
        let componentControls = this.querySelector<HTMLDivElement>(".component_overlay-controls")
        let componentInsertPoint = this.querySelector<HTMLDivElement>(".component_insert-point-button")
        if (componentItem && componentBG && componentControls && componentInsertPoint) {
          componentItem.style.display = "block"
          componentBG.style.display = "block";
          componentControls.style.display = "flex"
          componentInsertPoint.style.display = "flex"
        }
      })

    })
    doc.querySelectorAll(".component-item").forEach((ele, index) => {
      ele.addEventListener("mouseleave", function (this: HTMLDivElement, ev: Event) {
        let componentBG = this.querySelector<HTMLDivElement>(".component_overlay-bg")
        let componentControls = this.querySelector<HTMLDivElement>(".component_overlay-controls")
        let componentInsertPoint = this.querySelector<HTMLDivElement>(".component_insert-point-button")
        if (componentBG && componentControls && componentInsertPoint) {
          componentBG.style.display = "none";
          componentControls.style.display = "none"
          componentInsertPoint.style.display = "none"
        }
      });
    })

    if (onDelete) {
      onDelete.addEventListener("click", function (this: HTMLElement) {
        this.parentElement?.parentElement?.parentElement?.parentElement?.remove()
        if (doc.querySelectorAll('.preview .component-item').length == 0) {
          if (prevStart)
            prevStart.style.display = "flex";
        }
        if (saveText && preview)
          save(saveText, preview)
      });
    }

    if (onMoveDown) {
      onMoveDown.addEventListener("click", function (this: HTMLElement) {
        let ele = this.parentElement?.parentElement?.closest(".preview .component-item")
        let nextEle = ele?.nextSibling
        if (ele)
          nextEle?.after(ele)
        if (saveText && preview)
          save(saveText, preview)
      });
    }

    let moveUp = doc.querySelector('[var="onMoveUp"]')
    moveUp?.addEventListener("click", function (this: HTMLElement) {
      let ele = this?.parentElement?.parentElement?.closest(".preview .component-item")
      let prevEle = ele?.previousSibling
      if (ele && prevEle)
        ele.after(prevEle)
      if (saveText && preview)
        save(saveText, preview)
    });

    let openPicker = doc.querySelector('[var="onOpenPicker"]')
    openPicker?.addEventListener("click", function (this: HTMLElement) {
      console.log("mama")
      let component = this.closest(".preview .component-item")
      if (this?.parentElement?.getAttribute('class')?.includes('is-top')) {
        insertPoint = ["top", component]
      } else { insertPoint = ["bottom", component] }
      ;
      doc.querySelector<HTMLButtonElement>('[button="onOpenPicker"]')?.click()
      if (prevStart)
        prevStart.style.display = "flex";
    })

    let openPickerButton = doc.querySelector('[button="onOpenPicker"]')
    openPickerButton?.addEventListener("click", function () {
      doc.querySelectorAll(".component-library_tab-inner-wrapper .controls").forEach((ele) => {
        ele.remove()
      })
    })

    // Listener for picker close
    let closePickerButton = doc.querySelector('[button="closePicker"]')
    closePickerButton?.addEventListener("click", function () {
      let components = preview?.querySelectorAll('.component-item')
      if (components) {
        if (components.length > 0) {
          if (prevStart)
            prevStart.style.display = "none";
        }
      }
    })

    // Listener for reset
    let reset = doc.querySelector('#reset')
    reset?.addEventListener('click', function () {
      doc.querySelectorAll('.preview .component-item').forEach((ele) => {
        ele.remove()
      })
      if (prevStart)
        prevStart.style.display = "flex";
    });

    saveText?.addEventListener('click', async function () {
      if (saveText && preview)
        await save(saveText, preview)
    });

    shareLink?.addEventListener('click', async function () {
      if (saveText && preview)
        await save(saveText, preview)
    });

    function getParents(el: HTMLElement, parentSelector: any) {

      // If no parentSelector defined will bubble up all the way to *document*
      if (parentSelector === undefined) {
        parentSelector = document;
      }

      let parents = [];
      let p = el.parentNode;

      while (p !== parentSelector && p) {
        let o = p;
        parents.push(o);
        p = o?.parentNode;
      }
      parents.push(parentSelector); // Push that parentSelector you wanted to stop at

      return parents;
    }

    // add component to page
    let addComponent = doc.querySelector('[var="onAddComponent"]')
    addComponent?.addEventListener("click", async function (this: HTMLElement) {
      let found = getParents(this, '.item-wrapper')
      let component_div = found[0].cloneNode()
      component_div.querySelector(".component_overlay-bg").remove();
      component_div.querySelector(".component_overlay-controls").remove();
      closeButton?.click()
      // add controls
      let overlayHtml = `<div class="controls"> <div class="component_overlay-bg pointer-events-none" style="display: none; opacity: 1;"></div><div class="component_overlay-controls pointer-events-none" style="display: flex; opacity: 1;"> <div class="component-overlay-button-group pointer-events-auto"> <a href="#" class="button-alt w-inline-block" var="onMoveDown"> <div class="ico margin-right margin-xxsmall w-embed"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"> <rect x="7" y="1" width="2" height="14" rx="1" style="fill:CurrentColor"></rect> <line x1="8" y1="14" x2="3" y2="9" style="fill:none;stroke:CurrentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:2px"></line> <line x1="8" y1="14" x2="13" y2="9" style="fill:none;stroke:CurrentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:2px"></line> </svg> </div><div class="text-size-tiny">Move down</div></a> <a href="#" class="button-alt w-inline-block" var="onMoveUp"> <div class="ico margin-right margin-xxsmall w-embed"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"> <rect x="7" y="1" width="2" height="14" rx="1" style="fill:CurrentColor"></rect> <line x1="8" y1="2" x2="13" y2="7" style="fill:none;stroke:CurrentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:2px"></line> <line x1="8" y1="2" x2="3" y2="7" style="fill:none;stroke:CurrentColor;stroke-linecap:round;stroke-miterlimit:10;stroke-width:2px"></line> </svg> </div><div class="text-size-tiny">Move up</div></a> <a href="#" class="button-alt is-delete w-inline-block" var="onDelete"> <div class="ico margin-right margin-xxsmall w-embed"> <svg viewBox="0 0 16 16"> <path fill="CurrentColor" d="M13 5H3a1 1 0 0 0 0 2v6.42A1.58 1.58 0 0 0 4.58 15h6.84A1.58 1.58 0 0 0 13 13.42V7a1 1 0 0 0 0-2zM5 7h2v6H5zm6 6H9V7h2zM6 3h4a1 1 0 0 0 0-2H6a1 1 0 0 0 0 2z"></path> </svg> </div><div class="text-size-tiny">Delete</div></a> </div></div><div class="component_insert-points pointer-events-none" style="opacity: 1;" > <div class="component_insert-point is-bottom pointer-events-auto"> <div class="component_insert-point-button" var="onOpenPicker"> <div class="ico w-embed"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"> <rect x="7" y="2" width="2" height="12" rx="1" style="fill:CurrentColor"></rect> <rect x="2" y="7" width="12" height="2" rx="1" style="fill:CurrentColor"></rect> </svg> </div></div></div><div class="component_insert-point is-top pointer-events-auto" > <div class="component_insert-point-button" var="onOpenPicker"> <div class="ico w-embed"> <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"> <rect x="7" y="2" width="2" height="12" rx="1" style="fill:CurrentColor"></rect> <rect x="2" y="7" width="12" height="2" rx="1" style="fill:CurrentColor"></rect> </svg> </div></div></div></div></div>`
      component_div.querySelector('.component-item').innerHTML += overlayHtml
      if (prevStart)
        prevStart.style.display = "none";
      // add component div to .preview
      let component_html = component_div.innerHTML;
      if (insertPoint[0] === "undefined") {
        if (preview)
          preview.innerHTML += component_html;
      }
      else if (insertPoint[0] === "top") {
        insertPoint[1].before(component_html)
      }
      else if (insertPoint[0] === "bottom") { insertPoint[1].after(component_html) }
      else { }
      insertPoint[0] = 'undefined'
      if (saveText && preview)
        save(saveText, preview)

    })


    function populate_component_picker() {
      // Get all unique component names.
      let url = "/wireframe/components-test"
      let xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
          if (xmlhttp.status == 200) {
            let data = xmlhttp.responseText;
            let dataStruct = new DOMParser().parseFromString(data, "text/html");
            let componentNames = dataStruct.querySelectorAll(`[fs-styleguide-builder]`)
            let uniqueComponentNames: [string] = [''];
            uniqueComponentNames.pop()
            componentNames?.forEach((ele) => {
              let name = ele.getAttribute('fs-styleguide-builder')?.toLowerCase()
              if (name) {
                if (!uniqueComponentNames.includes(name)) {
                  uniqueComponentNames.push(name)
                }
              }
            })
            let originalTab = document.querySelector<HTMLDivElement>("#w-tabs-0-data-w-tab-0")
            let originalPanel = document.querySelector("#w-tabs-0-data-w-pane-0")
            uniqueComponentNames.forEach((name, i) => {
              if (originalTab && originalPanel) {
                let tab = originalTab.cloneNode(true) as HTMLElement;
                //let i = index + 1
                // update attributes
                tab.setAttribute("data-w-tab", `Tab ${i + 1}`);
                tab.setAttribute('id', `w-tabs-0-data-w-tab-${i}`);
                tab.setAttribute('href', `#w-tabs-0-data-w-pane-${i}`);
                tab.setAttribute('aria-controls', `w-tabs-0-data-w-pane-${i}`);
                tab.setAttribute('aria-selected', 'false');
                tab.classList.remove("w--current");
                // remove id from tab
                tab.removeAttribute("tabindex");
                //tab.removeAttribute("href");
                tab.classList.remove("w--current");
                let tinyText = tab.querySelector('.text-size-tiny')
                if (tinyText)
                  tinyText.textContent = name

                // add tab to tab list
                let tabsMenu = document.querySelector(".component-library_tabs-menu")
                if (tabsMenu) {
                  if (i === 0) {
                    tab.classList.add("w--current")
                    tabsMenu.innerHTML = ''
                  }
                  tabsMenu.appendChild(tab)
                }

                // create pane
                let pane = originalPanel.cloneNode(true) as HTMLElement;
                pane.setAttribute("data-w-tab", 'Tab ' + i);
                pane.setAttribute('id', `w-tabs-0-data-w-pane-${i}`);
                pane.setAttribute('aria-labelledby', `w-tabs-0-data-w-tab-${i}`);
                let componentLibraryTab = pane.querySelector(".component-library_tab-inner-wrapper")
                if (componentLibraryTab)
                  componentLibraryTab.innerHTML = ''

                dataStruct.querySelectorAll(`[fs-styleguide-builder="${name}"]`)
                  .forEach((ele) => {
                    let component_div = ele.innerHTML;
                    if (componentLibraryTab)
                      componentLibraryTab.innerHTML += `
                    <div class="item-wrapper is-library-item">
                        <div class="component-item">
                            <div>${component_div}</div>
                            <div class="component_overlay-bg is-library-item" style="display: none; opacity: 1;"></div>
                            <div class="component_overlay-controls is-library-item" style="display: none; opacity: 1;">
                            <div class="component-overlay-button-group is-library-item" var="onAddComponent">
                            <a data-w-id="638d75c1-a7a0-2dc6-4b48-6cec7d15e69c" href="#" class="button-alt w-inline-block">
                            <div class="ico margin-right margin-xxsmall w-embed"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
                            <rect x="7" y="2" width="2" height="12" rx="1" style="fill:CurrentColor"></rect>
                            <rect x="2" y="7" width="12" height="2" rx="1" style="fill:CurrentColor"></rect>
                            </svg></div><div class="text-size-tiny">Add component</div></a></div></div>
                        </div>
                    </div>`;
                  });

                // add pane to tab pane list
                let tabContent = document.querySelector(".component-library_tabs-content")
                if (tabContent) {
                  if (i === 0) {
                    tabContent.innerHTML = ""
                  }
                  tabContent.appendChild(pane)
                }


              }

            })
          }
          else if (xmlhttp.status == 400) {
            alert('There was an error 400');
          }
          else {
            alert('something else other than 200 was returned');
          }
        }
      };

      xmlhttp.open("GET", url, true);
      xmlhttp.send();


    }

    populate_component_picker()

  }


});



/**
 * This function: outputs unique ids.
 * @param length - String conatinind unique is.
 */

function makeid(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

/**
 * This function delays execution for a certain amount of time.
 * @param ms - time in milliseconds.
**/
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
