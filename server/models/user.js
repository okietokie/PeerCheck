import mongoose from "mongoose"; //used to interact with MongoDB and Node js 

/*declare a constant called "userSchema" 
 new mongoose.Schema({}) creates a new schema/structure in a collection */
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },  /*The name field must be a string and is required */
  username: {type: String, unique: true, required: true},
  email: { type: String, required: true, unique: true }, /*The email field must be a string, is required, and must be unique in the collection. */
  dob : {type: Date, required: true},
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  joinedOn: {type: Date, default: Date.now },
  status : { type : String, enum: ["active", "banned"], default : "active"},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});


const User = mongoose.model("User", userSchema, "peerCheck_users");

export default User;
