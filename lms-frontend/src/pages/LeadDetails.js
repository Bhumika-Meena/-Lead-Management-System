import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Add, Phone, Email, Event, Note, Edit, Delete } from '@mui/icons-material';
import { leadsAPI, activitiesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const activityTypes = [
  { value: 'Call', label: 'Call', icon: <Phone /> },
  { value: 'Email', label: 'Email', icon: <Email /> },
  { value: 'Meeting', label: 'Meeting', icon: <Event /> },
  { value: 'Note', label: 'Note', icon: <Note /> },
];

const getActivityIcon = (type) => {
  const found = activityTypes.find((a) => a.value === type);
  return found ? found.icon : <Note />;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'New': return 'primary';
    case 'Contacted': return 'warning';
    case 'Qualified': return 'info';
    case 'Converted': return 'success';
    case 'Disqualified': return 'error';
    default: return 'default';
  }
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityForm, setActivityForm] = useState({ type: 'Note', description: '' });
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState(null);
  const [deleteActivityId, setDeleteActivityId] = useState(null);
  const [activitySuccess, setActivitySuccess] = useState(null);
  const [editActivity, setEditActivity] = useState(null);
  const [editActivityForm, setEditActivityForm] = useState({ type: 'Note', description: '' });
  const [editActivityLoading, setEditActivityLoading] = useState(false);
  const [editActivityError, setEditActivityError] = useState(null);

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line
  }, [id]);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const [leadRes, actRes] = await Promise.all([
        leadsAPI.getById(id),
        activitiesAPI.getByLeadId(id),
      ]);
      setLead(leadRes.data.lead);
      setActivities(actRes.data.activities || []);
    } catch (err) {
      setError('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityChange = (e) => {
    setActivityForm({ ...activityForm, [e.target.name]: e.target.value });
    if (activityError) setActivityError(null);
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    setActivityLoading(true);
    setActivityError(null);
    try {
      await activitiesAPI.create(id, { ...activityForm });
      setActivityForm({ type: 'Note', description: '' });
      fetchLead();
    } catch (err) {
      setActivityError('Failed to add activity');
    } finally {
      setActivityLoading(false);
    }
  };

  const handleDeleteActivity = async () => {
    try {
      await activitiesAPI.delete(id, deleteActivityId);
      setDeleteActivityId(null);
      setActivitySuccess('Activity deleted successfully');
      fetchLead();
      setTimeout(() => setActivitySuccess(null), 3000);
    } catch (err) {
      setActivityError('Failed to delete activity');
    }
  };

  const handleEditActivityOpen = (activity) => {
    setEditActivity(activity);
    setEditActivityForm({ type: activity.type, description: activity.description });
    setEditActivityError(null);
  };

  const handleEditActivityChange = (e) => {
    setEditActivityForm({ ...editActivityForm, [e.target.name]: e.target.value });
    if (editActivityError) setEditActivityError(null);
  };

  const handleEditActivitySubmit = async (e) => {
    e.preventDefault();
    setEditActivityLoading(true);
    setEditActivityError(null);
    try {
      await activitiesAPI.update(id, editActivity.id, editActivityForm);
      setEditActivity(null);
      setEditActivityForm({ type: 'Note', description: '' });
      setActivitySuccess('Activity updated successfully');
      fetchLead();
      setTimeout(() => setActivitySuccess(null), 3000);
    } catch (err) {
      setEditActivityError('Failed to update activity');
    } finally {
      setEditActivityLoading(false);
    }
  };

  const handleEditActivityClose = () => {
    setEditActivity(null);
    setEditActivityForm({ type: 'Note', description: '' });
    setEditActivityError(null);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!lead) {
    return <Alert severity="warning">Lead not found.</Alert>;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{lead.name}</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>{lead.email} • {lead.phone}</Typography>
              <Chip label={lead.status} color={getStatusColor(lead.status)} sx={{ mb: 2 }} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">Lead Source</Typography>
              <Typography sx={{ mb: 2 }}>{lead.lead_source}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
              <Typography sx={{ mb: 2 }}>{lead.assigned_to || 'Unassigned'}</Typography>
              <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
              <Typography>{new Date(lead.created_at).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Activity Timeline</Typography>
              {activities.length === 0 ? (
                <Typography color="text.secondary">No activities yet.</Typography>
              ) : (
                <List>
                  {activities.map((act) => (
                    <ListItem key={act.id} alignItems="flex-start" secondaryAction={
                      <>
                        <IconButton edge="end" size="small" onClick={() => handleEditActivityOpen(act)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton edge="end" size="small" color="error" onClick={() => setDeleteActivityId(act.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    }>
                      <ListItemIcon>{getActivityIcon(act.type)}</ListItemIcon>
                      <ListItemText
                        primary={act.type}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {act.description}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption" color="text.secondary">
                              {new Date(act.created_at).toLocaleString()} by {act.created_by}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Add Activity / Note</Typography>
            {activityError && <Alert severity="error" sx={{ mb: 2 }}>{activityError}</Alert>}
            {activitySuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>{activitySuccess}</Alert>
            )}
            <Box component="form" onSubmit={handleAddActivity} display="flex" gap={2} flexWrap="wrap">
              <TextField
                select
                name="type"
                label="Type"
                value={activityForm.type}
                onChange={handleActivityChange}
                sx={{ minWidth: 120 }}
              >
                {activityTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                name="description"
                label="Description"
                value={activityForm.description}
                onChange={handleActivityChange}
                sx={{ flex: 1, minWidth: 200 }}
                required
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<Add />}
                disabled={activityLoading}
                sx={{ minWidth: 120 }}
              >
                {activityLoading ? 'Adding...' : 'Add'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      {/* Delete Activity Dialog */}
      <Dialog open={!!deleteActivityId} onClose={() => setDeleteActivityId(null)}>
        <DialogTitle>Delete Activity</DialogTitle>
        <DialogContent>Are you sure you want to delete this activity?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteActivityId(null)}>Cancel</Button>
          <Button onClick={handleDeleteActivity} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      {/* Edit Activity Dialog */}
      <Dialog open={!!editActivity} onClose={handleEditActivityClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditActivitySubmit} sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              name="type"
              label="Type"
              value={editActivityForm.type}
              onChange={handleEditActivityChange}
              sx={{ minWidth: 120 }}
            >
              {activityTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              name="description"
              label="Description"
              value={editActivityForm.description}
              onChange={handleEditActivityChange}
              required
            />
            {editActivityError && <Alert severity="error">{editActivityError}</Alert>}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button onClick={handleEditActivityClose} disabled={editActivityLoading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={editActivityLoading}>{editActivityLoading ? 'Saving...' : 'Save'}</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LeadDetails; 