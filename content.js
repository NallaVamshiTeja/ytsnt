// Load the Google API client library
let script = document.createElement("script");
script.src = "https://apis.google.com/js/api.js";
document.head.appendChild(script);

// Listen for message from popup.js
window.addEventListener("message", function (event) {
  // Only listen to messages from our extension
  if (event.source != window) return;

  if (event.data.action === "getTranscript") {
    // Get video ID from message
    const videoId = event.data.videoId;

    getVideoTranscript(videoId, function (transcript) {
      // Send transcript text back to popup.js
      event.source.postMessage(
        {
          transcript: transcript,
        },
        event.origin
      );
    });
  }
});

// Get transcript for a video
function getVideoTranscript(videoId, callback) {
  gapi.load("client", () => {
    gapi.client
      .init({
        apiKey: "AIzaSyDVMj2rHCBZPTva81lsUu7n7e6_VJV9kHU",
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
        ],
      })
      .then(() => {
        return gapi.client.youtube.captions.list({
          part: "snippet",
          videoId: videoId,
        });
      })
      .then((response) => {
        const captions = response.result.items;

        if (!captions || captions.length == 0) {
          callback("No captions found");
          return;
        }

        // Build transcript from caption snippets
        const transcript = captions.map((c) => c.snippet.text).join("\n");

        callback(transcript);
      })
      .catch((err) => {
        callback("Error getting transcript");
        console.error(err);
      });
  });
}

// window.onload = function () {
//   chrome.runtime.onMessage.addListener(function (
//     request,
//     sender,
//     sendResponse
//   ) {
//     if (request.action === "summarize") {
//       // const videoId = sender.tab.id.toString();
//       const videoId = "https://youtu.be/i9LPoGmWPSA?si=GkfBMOfQ0LgnGuS4";
//       if (videoId) {
//         getVideoTranscript(videoId, function (transcript) {
//           sendResponse({ summary: transcript });
//         });
//       } else {
//         sendResponse({ summary: "not a valid video page" });
//       }
//     }
//   });
// };

// function getVideoTranscript(videoId, callback) {
//   gapi.load("client", () => {
//     gapi.client
//       .init({
//         apiKey: "AIzaSyDVMj2rHCBZPTva81lsUu7n7e6_VJV9kHU",
//         discoveryDocs: [
//           "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
//         ],
//       })
//       .then(() => {
//         return gapi.client.youtube.captions.list({
//           part: "snippet",
//           videoId: videoId,
//         });
//       })
//       .then((response) => {
//         const captions = response.result.items;

//         if (captions && captions.length > 0) {
//           const transcript = captions
//             .map((caption) => caption.snippet.text)
//             .join("\n");
//           callback(transcript);
//         } else {
//           callback("No captions found for this video.");
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching transcript:", error);
//         callback("An error occurred. Please check the console for details.");
//       });
//   });
// }
