(() => {
  let youtubeLeftControls, youtubePlayer
  let currentVideoId
  let currentVideoBookmarks = []

  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const { type, videoId, value } = obj
    console.log('djzhao-obj:\n', obj)

    if (type === 'NEW') {
      currentVideoId = videoId
      newVideoLoaded()
    } else if (type === 'PLAY') {
      youtubePlayer.currentTime = value
    } else if (type === 'DELETE') {
      debugger
      currentVideoBookmarks = currentVideoBookmarks.filter(bookmark => bookmark.time !== +value)
      chrome.storage.sync.set({
        [currentVideoId]: JSON.stringify(currentVideoBookmarks)
      })
      response(currentVideoBookmarks)
    }
  })

  const fetchBookmarks = () => new Promise((resolve) => {
    chrome.storage.sync.get([currentVideoId], (obj) => {
      resolve(obj[currentVideoId] ? JSON.parse(obj[currentVideoId]) : [])
    })
  })

  const newVideoLoaded = async () => {
    currentVideoBookmarks = await fetchBookmarks()

    const bookmarkBtnExists = document.getElementsByClassName('bookmark-btn')[0]
    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement('img')
      bookmarkBtn.src = chrome.runtime.getURL('assets/bookmark.png')
      bookmarkBtn.className = 'ytp-button bookmark-btn'
      bookmarkBtn.title = 'Click to bookmark current timestamp'

      bookmarkBtn.addEventListener('click', addNewBookmarkEventHandler)

      youtubeLeftControls = document.getElementsByClassName('ytp-left-controls')[0]
      youtubePlayer = document.getElementsByClassName('video-stream')[0]

      youtubeLeftControls.appendChild(bookmarkBtn)
    }
  }

  const addNewBookmarkEventHandler = async () => {
    const currentTime = youtubePlayer.currentTime
    const newBookmark = {
      time: currentTime,
      desc: `Bookmark at ${getTime(currentTime)}`
    }

    currentVideoBookmarks = await fetchBookmarks()
    currentVideoBookmarks.push(newBookmark)
    console.log('djzhao-currentVideoBookmarks:\n', currentVideoBookmarks);
    currentVideoBookmarks.sort((a, b) => a.time - b.time)

    chrome.storage.sync.set({
      [currentVideoId]: JSON.stringify(currentVideoBookmarks)
    })
  }

  const getTime = (seconds) => {
    const date = new Date(0)
    date.setSeconds(seconds)

    return date.toISOString().substring(11, 19)
  }
})();