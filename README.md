# Smart Bookmarks
---
## Technologies Used

- **Languages**: JavaScript, HTML, CSS
- **AI APIs**:  Summarization in Chrome with built-in AI, The Prompt API, Google Gemini API
- **Database**: Qdrant Vector DB

---

## Setup Instructions

To fully utilize this project, follow the steps below to configure the required tokens, API keys, and cluster details:

---
### 1. Create a Trial Token for Prompt API
The project uses the Prompt API for specific functionalities. You need to generate a trial token and configure it in the project.
**Steps to Create a Trial Token:**
1. Visit the [Prompt API Trial Token Creation Page](https://developer.chrome.com/docs/extensions/ai/prompt-api).
2. Sign up or log in to your account.
3. Follow the instructions to generate a trial token.
4. Copy the generated token.

**Add Token to Manifest File:**
1. Open the `manifest.json` file located in the root of the project.
2. Add the token under the trial_tokens field. Example:

 ```json
   {
     "name": "Smart Bookmarks",
     "version": "1.0",
     "manifest_version": 3,
     "trial_tokens": [""]
   }
  ```

### 2. Create an API Key for Google Gemini
Google Gemini is used for advanced functionalities in this project. You must generate an API key and configure it in the popup.js file.
**Steps to Create an API Key:**
1. Visit the [Google Gemini API Key Creation Page](https://ai.google.dev/gemini-api/docs)
2. Sign up or log in to your Google account.
3. Navigate to the API key management section.
4. Generate a new API key and copy it.
   
**Add API Key to popup.js:**
1. Open the popup.js file.
2. Put this token in GEMINI_API_KEY.
```
const CONFIG = {
  QDRANT_URL: "" /** Qdrant cluster url */,
  QDRANT_KEY: "" /** Qdrant cluster api key */,
  collection_name: "my_collection" /** Qdrant collection name */,
  GEMINI_API_KEY: "" /** Google gemini api key  */,
};
```
### 3. Create a Cluster in Qdrant
Qdrant is used as the vector database for this project. You need to create a cluster and configure its details.
**Steps to Create a Qdrant Cluster:**
1. Go to the [Qdrant Cluster Creation Page](https://qdrant.tech/).
2. Sign up or log in to your Qdrant account.
3. Create a new cluster by following the provided instructions.
4. Note down the Cluster URL and Cluster Key from your Qdrant dashboard.

**Add Cluster Details to popup.js:**
1. Open the popup.js file.
2. Add the cluster url in QDRANT_URL and cluster key in QDRANT_KEY
```
const CONFIG = {
  QDRANT_URL: "" /** Qdrant cluster url */,
  QDRANT_KEY: "" /** Qdrant cluster api key */,
  collection_name: "my_collection" /** Qdrant collection name */,
  GEMINI_API_KEY: "" /** Google gemini api key  */,
};
```
