export async function getCurrentTab() {
  const queryParameters = { active: true, currentWindow: true }
  const [tab] = await chrome.tabs.query(queryParameters)
  return tab
}