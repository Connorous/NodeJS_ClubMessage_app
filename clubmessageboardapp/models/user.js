const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: { type: String, required: true, maxLength: 100, minLength: 3 },
  displayname: { type: String, required: true, maxLength: 100, minLength: 3 },
  password: { type: String, required: true, maxLength: 100, minLength: 3 },
  member: { type: Boolean, required: true },
  admin: { type: Boolean, required: true },
});

// Export model
module.exports = mongoose.model("User", UserSchema);
