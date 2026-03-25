import mongoose from "mongoose";

const notificationPreferencesSchema = new mongoose.Schema(
  {
    matchStart: { type: Boolean, default: true },
    delay: { type: Boolean, default: true },
    noShow: { type: Boolean, default: true },
    roomChange: { type: Boolean, default: true },
    participantUpdate: { type: Boolean, default: true },
    tournamentUpdate: { type: Boolean, default: true },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    displayName: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    password: { type: String, required: true, minlength: 6 },
    university: { type: String, trim: true, maxlength: 120 },
    role: {
      type: String,
      enum: ["admin", "organizer", "participant"],
      default: "participant",
    },
    createdTournaments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
      },
    ],
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    timezone: { type: String, default: "UTC" },
    timeFormat: { type: String, enum: ["12h", "24h"], default: "24h" },
    theme: {
      type: String,
      enum: ["dark", "light", "system"],
      default: "system",
    },
    density: {
      type: String,
      enum: ["comfortable", "compact"],
      default: "comfortable",
    },
    mobileMenuPosition: {
      type: String,
      enum: ["left", "right"],
      default: "right",
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
