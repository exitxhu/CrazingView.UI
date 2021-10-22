let startButton = document.getElementById("startBtn");

let mainSelector = document.getElementById("mainSelector");
let settinSelector = document.getElementById("settinSelector");
let settingGlobalSelector = document.getElementById("settingGlobalSelector");

let main = document.getElementById("main");
let settingGlobal = document.getElementById("settingGlobal");
let setting = document.getElementById("setting");
let startSessionBtn = document.getElementById("startSession")
let result = document.getElementById("result")
let baseUrl = "https://localhost:44334/";
const getStrategiesUrl = baseUrl + 'api/Strategies';
const startSessionUrl = baseUrl + 'api/Sessions/StartNewSession';

let thisTab = {};
let strat = {};

let config = {
    type: 'RunFlow',

    leftBarHighMin: 0,
    leftBarHighMax: 10,
    leftBarHighStep: 1,

    rightBarHighMin: 0,
    rightBarHighMax: 10,
    rightBarHighStep: 1,

    leftBarLowMin: 0,
    leftBarLowMax: 10,
    leftBarLowStep: 1,

    rightBarLowMin: 0,
    rightBarLowMax: 10,
    rightBarLowStep: 1,
}
function bind(event, param) {

}
window.addEventListener('load', async () => {
    console.log('load')
    thisTab = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.storage.sync.get("color", ({ color }) => {
        startButton.style.backgroundColor = color;
    });
})
//Handlers
// When the button is clicked, inject setPageBackgroundColor into current page
startButton.addEventListener("click", async () => {
    console.log('clicked in ext')
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // chrome.scripting.executeScript({
    //     target: { tabId: tab.id },
    //     function: setPageBackgroundColor,
    // });
    chrome.tabs.sendMessage(tab.id, config, function (response) {
    });
});
mainSelector.addEventListener("click", navMain)
settinSelector.addEventListener("click", navSetting)
settingGlobalSelector.addEventListener("click", navSettingGlobal)
startSessionBtn.addEventListener('click', getSample)

async function getSample() {
    console.log(strat)
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // let tab = { id: 21 };

    console.log(tab)
    axios.get(getStrategiesUrl)
        .then(response => {
            const users = response.data.data;
            console.log(`GET users`, response.data);
            strat = response.data[0]
            startSession(tab.id)
        })
        .catch(error => console.error(error));
}
function startSession(tabid) {
    axios.post(startSessionUrl + `?stratId=${strat.id}&tabId=${tabid}`).then(r => {
        let res='';
        r.data.records.forEach(element => {
            res += '<div class = "mt-3">'
            let t = element.value.split(',')
            t.forEach((m, i) => {
                res += `<span class="chip">${i}: ${ m}</span>`

            })
            res += '</div>'
        });
        result.innerHTML=res
    })
}


/******** Navigation */
function navSetting() {
    settinSelector.classList.add("selected")
    mainSelector.classList.remove("selected")
    settingGlobalSelector.classList.remove("selected")

    setting.classList.remove("hidden")
    main.classList.add("hidden")
    settingGlobal.classList.add("hidden")
}
function navMain() {
    main.classList.remove("hidden")
    setting.classList.add("hidden")
    settingGlobal.classList.add("hidden")

    mainSelector.classList.add("selected")
    settinSelector.classList.remove("selected")
    settingGlobalSelector.classList.remove("selected")
}
function navSettingGlobal() {
    settingGlobal.classList.remove("hidden")
    setting.classList.add("hidden")
    main.classList.add("hidden")

    settingGlobalSelector.classList.add("selected")
    mainSelector.classList.remove("selected")
    settinSelector.classList.remove("selected")
}