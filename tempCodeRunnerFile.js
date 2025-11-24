// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("peerCheckDB");

// Find a document in a collection.
db.getCollection("peerCheck_users").findOne({

});
db.findOneAndUpdate(
  { email: userEmail },
  { onlineStatus: "offline" }
);