import User from "../models/User.js";

export const getUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      "notificationPreferences timezone timeFormat theme density mobileMenuPosition",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const allowedFields = [
      "notificationPreferences",
      "timezone",
      "timeFormat",
      "theme",
      "density",
      "mobileMenuPosition",
    ];

    const updatePayload = {};
    for (const key of allowedFields) {
      if (Object.hasOwn(req.body, key)) {
        updatePayload[key] = req.body[key];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      updatePayload,
      {
        new: true,
        runValidators: true,
      },
    ).select("notificationPreferences timezone timeFormat theme density");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
