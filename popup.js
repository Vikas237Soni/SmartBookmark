const browserListData = [];
/** Please add your Qdrant cluster url, Qdrant cluster api key and google gemini api key */
const CONFIG = {
  QDRANT_URL: "" /** Qdrant cluster url */,
  QDRANT_KEY: "" /** Qdrant cluster api key */,
  collection_name: "my_collection" /** Qdrant collection name */,
  GEMINI_API_KEY: "" /** Google gemini api key  */,
};

function generateRandomId(length = 3) {
  let id = "";
  for (let i = 0; i < length; i++) {
    id += Math.floor(Math.random() * 10); // Generates a random digit from 0 to 9
  }
  return Number(id);
}

const createCollection = async () => {
  const url = `${CONFIG.QDRANT_URL}/collections/${CONFIG.collection_name}`; // Replace with your cluster URL
  const apiKey = CONFIG.QDRANT_KEY; // Replace with your actual API key

  const payload = {
    vectors: {
      size: 768, // Dimensionality of your vectors
      distance: "Cosine", // Similarity metric (Cosine, Euclidean, or Dot)
    },
  };
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // API key for authentication
      },
      body: JSON.stringify(payload), // Convert the payload object to JSON
    });

    if (response.ok) {
      const result = await response.json();
    } else {
      const error = await response.json();
      console.error("Error creating collection:", error);
    }
  } catch (error) {
    console.error("Network or server error:", error);
  }
};

async function embedContent(inputText, signal = null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${CONFIG.GEMINI_API_KEY}`;

  const headers = {
    "Content-Type": "application/json",
  };

  const body = JSON.stringify({
    model: "models/text-embedding-004",
    content: {
      parts: [
        {
          text: inputText,
        },
      ],
    },
  });

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      resolve(responseData);
      return responseData;
    } catch (error) {
      console.error("Error:", error.message);
      reject(error);
    }
  });
}

async function addDataToVectorDb(payload, ele) {
  const url = `${CONFIG.QDRANT_URL}/collections/${CONFIG.collection_name}/points`; // Replace with your cluster URL
  const apiKey = CONFIG.QDRANT_KEY; // Replace with your actual API key
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // API key for authentication
      },
      body: JSON.stringify(payload), // Convert the payload object to JSON
    });

    if (response.ok) {
      const result = await response.json();
    } else {
      const error = await response.json();
      console.error("Error Inserting data:", error);
    }
    if (ele) ele.style.visibility = "hidden";
  } catch (error) {
    console.error("Network or server error:", error);
    if (ele) ele.style.visibility = "hidden";
  }
}

async function getCollectionData() {
  const url = `${CONFIG.QDRANT_URL}/collections/${CONFIG.collection_name}/points/scroll`; // Replace with your cluster URL
  const apiKey = CONFIG.QDRANT_KEY; // Replace with your actual API key
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // API key for authentication
      },
      body: JSON.stringify({
        limit: 100, // Number of points to fetch per request
        with_vector: true, // Include vectors
        with_payload: true, // Include payloads
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.result && result.result.points) {
        result.result.points.forEach((item) => {
          const obj = { id: item.id, ...item.payload };
          browserListData.push(obj);
        });
      }
      renderBookmarksData(browserListData);
    } else {
      const error = await response.json();
      console.error("Error getCollectionData data:", error);
    }
  } catch (error) {
    console.error("Network or server error:", error);
  }
}

async function searchData(payload) {
  const url = `${CONFIG.QDRANT_URL}/collections/${CONFIG.collection_name}/points/query`; // Replace with your cluster URL
  const apiKey = CONFIG.QDRANT_KEY; // Replace with your actual API key
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`, // API key for authentication
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();

      const searchPoints = result.result.points;
      const filteredArray = browserListData.filter((obj1) =>
        searchPoints.some((obj2) => obj1.id === obj2.id)
      );
      renderBookmarksData(filteredArray);
    } else {
      const error = await response.json();
      console.error("Error getCollectionData data:", error);
    }
    enableDisableTextLoading(false);
  } catch (error) {
    console.error("Network or server error:", error);
    enableDisableTextLoading(false);
  }
}

createCollection();

// Add data to the database
async function insertData(data, ele) {
  try {
    const combinedString = data.summary + data.keywords.join("");
    const vectorData = await embedContent(combinedString);
    const requestParams = {
      points: [
        {
          id: generateRandomId(),
          vector: vectorData.embedding.values,
          payload: data,
        },
      ],
    };
    addDataToVectorDb(requestParams, ele);
  } catch (error) {}
}

function renderBookmarksData(data) {
  const bookmarkList = document.getElementById("bookmarkList");
  bookmarkList.innerHTML = ""; // Clear existing bookmarks
  data.forEach((bookmark) => {
    const bookmarkItem = document.createElement("div");
    bookmarkItem.classList.add("bookmark");
    const summaryElement = document.createElement("div");
    renderSummarizeOutput(summaryElement, bookmark.summary, bookmark.keywords);

    bookmarkItem.innerHTML = `
        <a href="${bookmark.bookmarkUrl}" target="_blank">${bookmark.bookmarkUrl}</a>
      `;
    bookmarkItem.appendChild(summaryElement);
    bookmarkList.appendChild(bookmarkItem);
  });
}

function renderSummarizeOutput(element, text, keywords = []) {
  const summaryTitle = document.createElement("p"); // Create a new paragraph
  summaryTitle.textContent = "Summary";
  summaryTitle.classList.add("title");
  element.appendChild(summaryTitle); // Append the paragraph to the div

  // Split the text into words while preserving asterisks as indicators for new lines
  const words = text.split(/\s+/);

  let output = "";
  words.forEach((word) => {
    if (word === "*") {
      const paragraph = document.createElement("p"); // Create a new paragraph
      paragraph.textContent = output.trim(); // Set the paragraph text
      element.appendChild(paragraph); // Append the paragraph to the div
      output = ""; // Reset for the next line
    } else {
      output += word + " ";
    }
  });
  // Handle any remaining text (after the last `*`)
  if (output.trim()) {
    const paragraph = document.createElement("p");
    paragraph.textContent = output.trim();
    element.appendChild(paragraph);
  }

  const keywordsTitle = document.createElement("p"); // Create a new paragraph
  keywordsTitle.textContent = "Keywords";
  keywordsTitle.classList.add("title");
  element.appendChild(keywordsTitle); // Append the paragraph to the div

  const tagElement = document.createElement("div");
  tagElement.classList.add("tags");

  keywords.forEach((item) => {
    const spanElement = document.createElement("span");
    spanElement.classList.add("tag");
    spanElement.textContent = item;
    tagElement.appendChild(spanElement);
  });
  element.appendChild(tagElement);
}

async function callSummarizationAndPrompAPI(url) {
  if ("ai" in self && "summarizer" in self.ai) {
    const options = {
      sharedContext: "Need only summary",
      type: "key-points",
      format: "markdown",
      length: "medium",
    };

    const available = (await self.ai.summarizer.capabilities()).available;

    if (available === "readily") {
      // The Summarizer API can be used immediately .
      const summarizer = await self.ai.summarizer.create(options);
      const laoderElement = document.getElementsByClassName("loader")[0];
      try {
        if (laoderElement) laoderElement.style.visibility = "visible";
        const summary = await summarizer.summarize(url, {
          context: "This article is intended for a tech-savvy audience.",
        });
        const pageContent = document.body.innerText;

        // Send the content back to the extension
        const summarytextElement = document.getElementById("summarytext");
        const bookmarkUrl = document.getElementById("bookmark-url");
        const span = document.createElement("span");
        span.textContent = "Bookmarked Url : ";
        span.classList.add("title");
        bookmarkUrl.appendChild(span);
        const paragraph = document.createElement("span");
        paragraph.textContent = url;
        bookmarkUrl.appendChild(paragraph);

        const capabilities =
          await chrome.aiOriginTrial.languageModel.capabilities();

        const session = await chrome.aiOriginTrial.languageModel.create({
          systemPrompt:
            "Please provide keywords only of the content that defines the context of content and there keyowrds should be comma seprated",
        });

        const keywords = await session.prompt(summary);
        renderSummarizeOutput(summarytextElement, summary, keywords.split(","));

        const dataToAddInDb = {
          bookmarkUrl: url,
          summary,
          keywords: keywords.split(","),
        };
        insertData(dataToAddInDb, laoderElement);
      } catch (error) {
        console.error("error", error.message);
        if (laoderElement) laoderElement.style.visibility = "hidden";
      }
    }

    // The Summarizer API is supported.
  } else {
    console.log("No Summarizer API supported");
  }
}

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function enableDisableTextLoading(show) {
  const textLoadingElement = document.getElementById("text-loading");
  if (show) {
    textLoadingElement.style.display = "block";
  } else {
    textLoadingElement.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  let controller; // To store the AbortController instance

  // Retrieve the bookmarked URL from storage
  chrome.storage.local.get("bookmarkedUrl", (result) => {
    const bookmarkedUrl = result.bookmarkedUrl;
    if (bookmarkedUrl) {
      setTimeout(() => {
        callSummarizationAndPrompAPI(bookmarkedUrl);
        chrome.storage.local.remove("bookmarkedUrl");
      }, 200);
    } else {
      searchInput.style.display = "block";
      getCollectionData();
    }
  });

  async function performSearch(query) {
    try {
      // Cancel the previous request
      if (controller) {
        controller.abort();
      }
      if (query.trim().length > 0) {
        controller = new AbortController();
        const signal = controller.signal;
        const vectorData = await embedContent(query, signal);
        const vector = vectorData.embedding.values;
        const payload = {
          query: vector,
          limit: 5,
        };
        searchData(payload);
      } else {
        enableDisableTextLoading(false);
        renderBookmarksData(browserListData);
      }
      // Create a new AbortController for the current request
    } catch (error) {
      console.error("error", error.message);
    }
  }

  const debouncedSearch = debounce(
    (event) => performSearch(event.target.value),
    300
  );
  searchInput.addEventListener("input", (e) => {
    enableDisableTextLoading(true);
    debouncedSearch(e);
  });
});
