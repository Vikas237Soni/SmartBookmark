chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  const bookmarkUrl = bookmark.url;
  setTimeout(async () => {
    chrome.storage.local.set({ bookmarkedUrl: bookmarkUrl }, () => {
      chrome.action.openPopup().catch((err) => {
        console.error("Failed to open popup:", err);
      });
    });
  }, 2000);
});
