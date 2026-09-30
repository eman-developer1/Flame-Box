import MenuItem from "../models/MenuItem.js";

export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({}).sort({ createdAt: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const upsertMenuItem = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const item = await MenuItem.findOneAndUpdate(
      { id },
      { id, ...data },
      { new: true, upsert: true }
    );
    res.json([item]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await MenuItem.findOneAndDelete({ id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
