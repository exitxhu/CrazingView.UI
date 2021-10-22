try {



  var attachedTabs = {};
  var version = "1.3";
  var letsdo = null;
  var debugIdGlobal;

  let debuggerEnabled = false;

  var xC, yC;
  function setValue(xC, yC, tabid, val) {
    console.log("down");
    let v = val.toString();

    let yfixer = 0;
    let xfixer = 0;

    chrome.debugger.sendCommand({ tabId: tabid }, "Input.dispatchMouseEvent", { type: "mousePressed", x: xC + xfixer, y: yC + yfixer, button: "left", clickCount: 1 }, function (e) { console.log('clickDown', e) });
    chrome.debugger.sendCommand({ tabId: tabid }, "Input.dispatchMouseEvent", { type: "mouseReleased", x: xC + xfixer, y: yC + yfixer, button: "left", clickCount: 1 }, function (e) { console.log('clickUp', e) });
    for (let index = 0; index < v.length; index++) {
      const charcode = v.charCodeAt(index);

      chrome.debugger.sendCommand({ tabId: tabid }, 'Input.dispatchKeyEvent', { type: 'keyDown', windowsVirtualKeyCode: charcode, nativeVirtualKeyCode: charcode, macCharCode: charcode });
      chrome.debugger.sendCommand({ tabId: tabid }, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: charcode, nativeVirtualKeyCode: charcode, macCharCode: charcode });
    }

  }
  chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
      console.log(sender.tab ?
        "from a content script:" + sender.tab.id :
        "from the extension");
      if (request.eventPlease === "trusted") {
        if (true) {
          sendResponse({ yourEvent: "dispatching event, one moment" });



          xC = request.x;
          yC = request.y;

          setValue(xC, yC, sender.tab.id, request.val)

        }
        else {
          sendResponse({ yourEvent: "please click the extension icon to enable debugger" });
        }
      } else if (request.eventPlease === "debug") {
        chrome.debugger.attach({ tabId: request.tabid }, version);

      }


    });


  chrome.debugger.onEvent.addListener(onEvent);
  chrome.debugger.onDetach.addListener(onDetach);

  chrome.browserAction.onClicked.addListener(function (tab) {
    var tabId = tab.id;
    var debuggeeId = { tabId: tabId };
    debugIdGlobal = debuggeeId;

    if (!attachedTabs[tabId]) {
      chrome.debugger.attach(debuggeeId, version, onAttach.bind(null, debuggeeId));
    }
    else {
      chrome.debugger.detach(debuggeeId, onDetach.bind(null, debuggeeId));
    }

  });

  function onAttach(debuggeeId) {
    if (chrome.runtime.lastError) {
      alert(chrome.runtime.lastError.message);
      return;
    }

    tabId = debuggeeId.tabId;
    chrome.browserAction.setIcon({ tabId: tabId, path: "debuggerPause.png" });
    chrome.browserAction.setTitle({ tabId: tabId, title: "pause debugger" });
    attachedTabs[tabId] = "working";
    chrome.debugger.sendCommand(
      debuggeeId, "Debugger.enable", {},
      onDebuggerEnabled.bind(null, debuggeeId));
  }


  function onDebuggerEnabled(debuggeeId) {
    debuggerEnabled = true
  }

  function onDebuggerDisabled(debuggeeId) {
    debuggerEnabled = false
  }

  function onEvent(debuggeeId, method, frameId, resourceType) {

    tabId = debuggeeId.tabId;
    if (method == "Debugger.paused") {
      attachedTabs[tabId] = "paused";
      chrome.browserAction.setIcon({ tabId: tabId, path: "debuggerStart.png" });
      chrome.browserAction.setTitle({ tabId: tabId, title: "Resume debugging" });
    }
  }

  function onDetach(debuggeeId) {
    var tabId = debuggeeId.tabId;
    chrome.debugger.sendCommand(
      debuggeeId, "Debugger.disable", {},
      onDebuggerDisabled.bind(null, debuggeeId));
    delete attachedTabs[tabId];
    chrome.browserAction.setIcon({ tabId: tabId, path: "debuggerStart.png" });
    chrome.browserAction.setTitle({ tabId: tabId, title: "Resume debugging" });
    debuggerEnabled = false
  }






} catch (error) {
  console.log(error)
}