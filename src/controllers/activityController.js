const Activity = require('../models/Activity');
const Lead = require('../models/Lead');

// Add a new activity/note to a lead
exports.addActivity = async (req, res) => {
  try {
    const { type, description } = req.body;
    const { leadId } = req.params;

    // Check if lead exists
    const lead = await Lead.findByPk(leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const activity = await Activity.create({
      lead_id: leadId,
      type,
      description,
      created_by: req.user.userId,
      created_at: new Date()
    });

    res.status(201).json({ message: 'Activity added successfully', activity });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add activity', error: error.message });
  }
};

// Get all activities/notes for a lead
exports.getActivities = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Check if lead exists
    const lead = await Lead.findByPk(leadId);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const activities = await Activity.findAll({ where: { lead_id: leadId } });
    res.json({ activities });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activities', error: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    await Activity.destroy({ where: { id: activityId } });
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete activity' });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { type, description } = req.body;
    const activity = await Activity.findByPk(activityId);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });

    activity.type = type;
    activity.description = description;
    await activity.save();

    res.json({ message: 'Activity updated successfully', activity });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update activity' });
  }
};
