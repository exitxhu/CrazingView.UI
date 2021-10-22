let startButton = document.getElementById("startBtn");

let mainSelector = document.getElementById("mainSelector");
let settinSelector = document.getElementById("settinSelector");
let settingGlobalSelector = document.getElementById("settingGlobalSelector");

let stratsSelect = document.getElementById('strats')
let stratsInfoDiv = document.getElementById('stratInfo')

let main = document.getElementById("main");
let settingGlobal = document.getElementById("settingGlobal");
let setting = document.getElementById("setting");
let startSessionBtn = document.getElementById("startSession")
let result = document.getElementById("result")
let baseUrl = "https://localhost:44334/";

const getStrategiesUrl = baseUrl + 'api/Strategies';
const startSessionUrl = baseUrl + 'api/Sessions/StartNewSession';

let tabStateProt = {
    id: '',
    records: [],
    sessionId: '',
    strat: {},
    strats: []
}
let tabState = {
    id: '',
    records: [],
    sessionId: '',
    strat: {},
    strats: []
}

let rawRecords = [];
let thisTab = {};
let strats = [];
let strat = {}
let config = {
    type: 'RunFlow',
    records: []

}
function bind(event, param) {

}
window.addEventListener('load', async () => {
    console.log('load')
    thisTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    console.log(thisTab);
    tabState = get(thisTab.id)
    if (!tabState) {
        tabState = JSON.parse(JSON.stringify(tabStateProt))
        tabState.id = thisTab.id;
    }
    if (tabState.strats.length == 0) {

        axios.get(getStrategiesUrl)
            .then(response => {
                strats = response.data;
                stratSeletOptionSetter()
                set(thisTab.id, tabState)
            })
            .catch(error => console.error(error));
    }
    else {
        strats = tabState.strats
        strat = tabState.strat
        stratSeletOptionSetter(strat.id)
    }

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

    config.records = tabState.records
    chrome.tabs.sendMessage(tab.id, config, function (response) {
    });
});
stratsSelect.addEventListener('change', () => {
    var t = stratsSelect.value;
    strat = strats.find(n => n.id == t)
    tabState.strat = strat
    set(thisTab.id, tabState)
    if (t < 0)
        return false
    let inp = '';
    strat.inputs.forEach(m => {
        inp += `</br>
        <div style='padding-right:20px;padding-left:20px;'>
        <div>input name: ${m.name}</div>
        <div>input min: ${m.minValue}</div>
        <div>input max: ${m.maxValue}</div>
        <div>input stepSize: ${m.increaseStep}</div>
        </div>`
    })
    stratsInfoDiv.innerHTML = `<div>strat Name: ${strat.name}</div> 
<div>strat inputs: ${strat.inputs.length}</div> ${inp}`;
})

startSessionBtn.addEventListener('click', startSession)

async function startSession() {
    axios.post(startSessionUrl + `?stratId=${strat.id}&tabId=${thisTab.id}`).then(r => {

        rawRecords = [];
        let res = '';
        r.data.records.forEach(element => {
            res += '<div class = "mt-3">'
            let t = element.value.split(',')
            let tr = []
            t.forEach((m, i) => {
                res += `<span class="chip">${i}: ${m}</span>`
                tr.push(m)
            })
            rawRecords.push(tr)
            res += '</div>'
        });
        result.innerHTML = res
        tabState.records = rawRecords;
        tabState.sessionId = r.data.sid
        console.log(tabState);
        set(thisTab.id, tabState)
    })
}

/******** Utilities */

function get(key) {
    var t = localStorage.getItem(key)
    if (t)
        return JSON.parse(t)
    return null
}
function set(key, val) {
    localStorage.setItem(key, JSON.stringify(val))
}
function remove(key) {
    localStorage.removeItem(key)
}


function stratSeletOptionSetter(defKey) {
    let t = '<option id="defOption" value="-1">Select stratergy</option>';
    strats.forEach(n => {
        t += ` <option ${n.id == defKey ? 'selected="selected"' : ''} value="${n.id}">${n.name}</option>`
    })
    stratsSelect.innerHTML = t
    tabState.strats = strats
}
/******** Navigation */
mainSelector.addEventListener("click", navMain)
settinSelector.addEventListener("click", navSetting)
settingGlobalSelector.addEventListener("click", navSettingGlobal)

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