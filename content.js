
var pressed = false;
var cx, cy;
var n = 0;
var nowDownEvent, nowUpEvent;

let config = {
    type: '',
    records: []
}

const pattern_bottom_area = '//*[@id="bottom-area"]';

const pattern_strategy_btn = '//*[@id="footer-chart-panel"]/div[1]/div[1]/div[4]/div';

const query_format_btn = '.icon-button.js-backtesting-open-format-dialog.apply-common-tooltip';

const id_overlap_manager = 'overlap-manager-root';

const pattern_format_leftBarHigh_input = '//*[@id="overlap-manager-root"]/div/div/div[1]/div/div[3]/div/div[2]/div/span/span[1]/input';
const pattern_format_rightBarHigh_input = '//*[@id="overlap-manager-root"]/div/div/div[1]/div/div[3]/div/div[4]/div/span/span[1]/input';
const pattern_format_leftBarLow_input = '//*[@id="overlap-manager-root"]/div/div/div[1]/div/div[3]/div/div[6]/div/span/span[1]/input';
const pattern_format_rightBarLow_input = '//*[@id="overlap-manager-root"]/div/div/div[1]/div/div[3]/div/div[8]/div/span/span[1]/input';
const pattern_format_ok_input_btn = '//*[@id="overlap-manager-root"]/div/div/div[1]/div/div[4]/div/span/button';

const pattern_netProfit = '//*[@id="bottom-area"]/div[4]/div[3]/div/div/div/table/tbody/tr[1]/td[2]/div[2]/span';
const pattern_maxDrawdown = '//*[@id="bottom-area"]/div[4]/div[3]/div/div/div/table/tbody/tr[4]/td[2]/div[2]/span/span';
const pattern_sharpRatio = '//*[@id="bottom-area"]/div[4]/div[3]/div/div/div/table/tbody/tr[6]/td[2]';
const pattern_profitFactor = '//*[@id="bottom-area"]/div[4]/div[3]/div/div/div/table/tbody/tr[7]/td[2]';
const pattern_percentProfitable = '//*[@id="bottom-area"]/div[4]/div[3]/div/div/div/table/tbody/tr[15]/td[2]';

var netProfit = 0;
var maxDrawdown = 0;
var sharpRatio = 0;
var profitFactor = 0;
var percentProfitable = 0;

var recCount = 0;
var recProcessed = 0;

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type === 'RunFlow') {
            config = request;
            flow();
        }
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(request)
        console.log(sender)
        console.log(sendResponse)
    }
);
let check_for_format_btn = true;
const callFormatButtonTimout = 250;
let strategyObserver = new MutationObserver(function (mutationRecords) {
    formatBtn = document.querySelector(query_format_btn);;
    if (formatBtn && check_for_format_btn) {
        check_for_format_btn = false;
        setTimeout(() => formatBtn.click(), callFormatButtonTimout)
        strategyObserver.disconnect();
    }
});
let overlapObserver = new MutationObserver(function (mutationRecords) {
    overlapObserver.disconnect();
    let inputs = [findElementByXpath(pattern_format_leftBarHigh_input)
        , findElementByXpath(pattern_format_rightBarHigh_input)
        , findElementByXpath(pattern_format_leftBarLow_input)
        , findElementByXpath(pattern_format_rightBarLow_input)]
    console.log(inputs);
    if (inputs) {
        setTimeout(() => {
            let timer = setInterval(() => {
                console.log(config);
                // console.log(input1.value, config.leftBarHighMax, +input.value > +config.leftBarHighMax);
                if (recProcessed + 1 == recCount) {
                    console.log('done incrementing');
                    clearInterval(timer);
                }
                else {
                    let temprec = config.records[recProcessed]
                    console.log(temprec);
                    for (let i = 0; i < temprec.length; i++) {
                        const tr = temprec[i];
                        console.log(i, tr, inputs[i].value);
                        inputs[i].value = tr;
                    }
                    recProcessed += 1;
                }

            }, 1500)
        }, callFormatButtonTimout)
    }
});
function flow() {
    recCount = config.records.length
    let formatBtn = document.querySelector(query_format_btn);
    console.log(formatBtn);
    console.log(query_format_btn);
    if (!formatBtn) {
        let btmarea = findElementByXpath(pattern_bottom_area);
        let strat = findElementByXpath(pattern_strategy_btn);
        strategyObserver.observe(btmarea, { childList: true, subtree: true })
        strat.click();
    }
    else {
        formatBtn.click();
        let overl = document.getElementById(id_overlap_manager)
        // console.log(overl,);
        overlapObserver.observe(overl, { childList: true })
    }
}

function findElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}



// setTimeout(function () {



//     console.log('content')
//     window.addEventListener('mousedown', onDownEvent);
//     window.addEventListener('mouseup', onUpEvent);

//     document.addEventListener('keydown', downKey, true);
//     document.addEventListener('keyup', upKey, true);
//     // document.addEventListener('mousemove', mouseMove)
//     function downKey(e) {
//         nowDownEvent = performance.now()
//         var key = e.key.toLowerCase();

//         if (key === 't' && !pressed) {
//             e.preventDefault();
//             pressed = true;
//             setInterval(function () {
//                 chrome.runtime.sendMessage({ eventPlease: "trusted", el: t, x: cx, y: cy, mouse: "D" }, function (response) {
//                     console.log(response.yourEvent);
//                 });
//             }, 2000)

//         }
//         else if (key === 'r') {
//             let clickEvent = document.createEvent('MouseEvents');
//             clickEvent.initEvent('mousedown', true, true);
//             document.dispatchEvent(clickEvent);
//         }

//     }
//     function upKey(e) {
//         nowUpEvent = performance.now()
//         var key = e.key.toLowerCase();
//         if (key === 't' && pressed) {
//             e.preventDefault();
//             pressed = false;
//             setInterval(function () {
//                 chrome.runtime.sendMessage({ eventPlease: "trusted", el: t, x: cx, y: cy, mouse: "U" }, function (response) {
//                     console.log(response.yourEvent);
//                 });
//             }, 2000)
//         }
//         else if (key === 'r') {
//             let clickEvent = document.createEvent('MouseEvents');
//             clickEvent.initEvent('mouseup', true, true);
//             document.dispatchEvent(clickEvent);
//         }

//     }


//     function mouseMove(e) {
//         cx = e.clientX;
//         cy = e.clientY;
//     }

// }, 300);

// function onDownEvent(e) {
//     n++;
//     t = document.querySelector(".button-5-QHyx-s.button-2qy9YC6D.isTransparent-5-QHyx-s")
//     let m = getCoordinates(t)
//     cx = m.x;
//     cy = m.y;
//     console.dir(t)
//     console.log(e, n, performance.now() - nowDownEvent);
// }
// function onUpEvent(e) { console.log(e, performance.now() - nowUpEvent); }

// function getCoordinates(el) {
//     console.log('from coor')
//     console.log(el)
//     var top = el.offsetHeight / 2,
//         left = el.offsetWidth / 2;
//     do {
//         top += el.offsetTop || 0;
//         left += el.offsetLeft || 0;
//         el = el.offsetParent;
//     } while (el);
//     console.log('top', top, 'lett', left)
//     return {
//         y: top,
//         x: left
//     };
// }

