console.log('background js loaded', new Date());
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log('tabId', tabId)
  // console.log('djzhao-changeInfo:\n', changeInfo);
  // console.log('djzhao-tab:\n', tab);
  // https://www.youtube.com/watch?v=0n809nd4Zu4
  if (tab.url && tab.url.includes('youtube.com/watch')) {
    const queryParameters = tab.url.split('?')[1]
    const urlParameters = new URLSearchParams(queryParameters)
    console.log('djzhao-urlParameters:\n', urlParameters)

    chrome.tabs.sendMessage(tabId, {
      type: 'NEW',
      videoId: urlParameters.get('v')
    })
  }
})