const Lead = require('../models/Lead');
const User = require('../models/User');

// Create a new lead (Admin and Sales)
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, lead_source, status, assigned_to } = req.body;
    const lead = await Lead.create({
      name,
      email,
      phone,
      lead_source,
      status,
      assigned_to: assigned_to || req.user.userId // default to self if not provided
    });
    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create lead', error: error.message });
  }
};

// Get all leads (Admin: all, Sales: only assigned)
exports.getLeads = async (req, res) => {
  try {
    const { status, lead_source, assigned_to, name, email, page = 1, limit = 10 } = req.query;
    const where = {};

    // Filtering
    if (status) where.status = status;
    if (lead_source) where.lead_source = lead_source;
    if (assigned_to) where.assigned_to = assigned_to;

    // Searching
    if (name) where.name = { [require('sequelize').Op.iLike]: `%${name}%` };
    if (email) where.email = { [require('sequelize').Op.iLike]: `%${email}%` };

    // RBAC: Sales reps only see their leads
    if (req.user.role !== 'admin') {
      where.assigned_to = req.user.userId;
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const leads = await Lead.findAll({
      where,
      offset,
      limit: parseInt(limit)
    });

    res.json({ leads });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch leads', error: error.message });
  }
};

// Get a single lead by ID (Admin: any, Sales: only assigned)
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role !== 'admin' && lead.assigned_to !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    res.json({ lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lead', error: error.message });
  }
};

// Update a lead (Admin: any, Sales: only assigned)
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role !== 'admin' && lead.assigned_to !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    await lead.update(req.body);
    res.json({ message: 'Lead updated successfully', lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update lead', error: error.message });
  }
};

// Delete a lead (Admin: any, Sales: only assigned)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (req.user.role !== 'admin' && lead.assigned_to !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    await lead.destroy();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete lead', error: error.message });
  }
};

// Admin only: Assign/Reassign a lead to a sales rep
exports.assignLead = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: admin only' });
    }
    const { assigned_to } = req.body;
    const lead = await Lead.findByPk(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await lead.update({ assigned_to });
    res.json({ message: 'Lead assigned successfully', lead });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign lead', error: error.message });
  }
};
