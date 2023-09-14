import { getCurrentTab } from './utils.js'

// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement, bookmark) => {
  const bookmarkElement = document.createElement('div')
  bookmarkElement.id = `bookmark-${bookmark.time}`
  bookmarkElement.className = 'bookmark'
  bookmarkElement.setAttribute('timestamp', bookmark.time)

  const bookmarkTitleElement = document.createElement('div')
  bookmarkTitleElement.textContent = bookmark.desc
  bookmarkTitleElement.className = 'bookmark-title'

  const bookmarkControlsElement = document.createElement('div')
  bookmarkControlsElement.className = 'bookmark-controls'
  setBookmarkAttributes('play', onPlay, bookmarkControlsElement)
  setBookmarkAttributes('delete', onDelete, bookmarkControlsElement)

  bookmarkElement.appendChild(bookmarkTitleElement)
  bookmarkElement.appendChild(bookmarkControlsElement)
  bookmarksElement.appendChild(bookmarkElement)
};

const viewBookmarks = (currentVideoBookmarks = []) => {
  const bookmarksElement = document.querySelector('#bookmarks')
  bookmarksElement.innerHTML = ''

  if (currentVideoBookmarks.length === 0) {
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>'
    return
  }
  currentVideoBookmarks.forEach(bookmark => {
    addNewBookmark(bookmarksElement, bookmark)
  });
};

const onPlay = async e => {
  const timestamp = e.target.parentNode.parentNode.getAttribute('timestamp')
  const currentTab = await getCurrentTab()

  chrome.tabs.sendMessage(currentTab.id, {
    type: 'PLAY',
    value: timestamp
  })
};

const onDelete = async e => {
  const timestamp = e.target.parentNode.parentNode.getAttribute('timestamp')
  const currentTab = await getCurrentTab()
  const bookmarkToDelete = document.getElementById(`bookmark-${timestamp}`)
  bookmarkToDelete.parentNode.removeChild(bookmarkToDelete)

  chrome.tabs.sendMessage(currentTab.id, {
    type: 'DELETE',
    value: timestamp
  })
};

const setBookmarkAttributes =  (action, eventListener, parentElement) => {
  const actionElement = document.createElement('img')
  actionElement.src = `assets/${action}.png`
  actionElement.title = action
  actionElement.addEventListener('click', eventListener)

  parentElement.appendChild(actionElement)
};

document.addEventListener("DOMContentLoaded", async () => {
  const currentTab = await getCurrentTab()
  const queryParameters = currentTab.url.split('?')[1]
  const urlParameters = new URLSearchParams(queryParameters)

  const currentVideoId = urlParameters.get('v')
  if (currentTab.url.includes('youtube.com/watch') && currentVideoId) {
    chrome.storage.sync.get([currentVideoId], (obj) => {
      const currentVideoBookmarks = obj[currentVideoId] ? JSON.parse(obj[currentVideoId]) : []

      viewBookmarks(currentVideoBookmarks)
    })
  } else {
    document.querySelector('.title').innerText = 'This is not a youtube watch page.'
  }

});
