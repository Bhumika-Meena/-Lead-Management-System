import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { leadsAPI, activitiesAPI, usersAPI } from '../services/api';

const activityTypes = [
  'Call',
  'Email',
  'Meeting',
  'Note',
];

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    user: '',
    lead: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, leadsRes] = await Promise.all([
        usersAPI.getAll(),
        leadsAPI.getAll(),
      ]);
      setUsers(usersRes.data.users || []);
      setLeads(leadsRes.data.leads || []);

      const allActivities = [];
      await Promise.all(
        (leadsRes.data.leads || []).map(async (lead) => {
          const actRes = await activitiesAPI.getByLeadId(lead.id);
          (actRes.data.activities || []).forEach((activity) => {
            allActivities.push({
              ...activity,
              leadName: lead.name,
              leadId: lead.id,
              assignedTo: lead.assigned_to,
            });
          });
        })
      );
      allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setActivities(allActivities);
    } catch (err) {
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.name : 'Unassigned';
  };

  // Filtering logic
  const filteredActivities = activities.filter((activity) => {
    const { search, type, user, lead } = filters;
    const matchesSearch =
      !search ||
      activity.description?.toLowerCase().includes(search.toLowerCase()) ||
      activity.leadName?.toLowerCase().includes(search.toLowerCase()) ||
      getUserName(activity.assignedTo)?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !type || activity.type === type;
    const matchesUser = !user || String(activity.assignedTo) === String(user);
    const matchesLead = !lead || String(activity.leadId) === String(lead);
    return matchesSearch && matchesType && matchesUser && matchesLead;
  });

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>
        All Activities
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Search"
              fullWidth
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search by description, lead, or user"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              select
              label="Type"
              fullWidth
              value={filters.type}
              onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            >
              <MenuItem value="">All Types</MenuItem>
              {activityTypes.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="User"
              fullWidth
              value={filters.user}
              onChange={e => setFilters(f => ({ ...f, user: e.target.value }))}
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              select
              label="Lead"
              fullWidth
              value={filters.lead}
              onChange={e => setFilters(f => ({ ...f, lead: e.target.value }))}
            >
              <MenuItem value="">All Leads</MenuItem>
              {leads.map(lead => (
                <MenuItem key={lead.id} value={lead.id}>{lead.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Lead</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActivities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No activities found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <Chip label={activity.type} />
                    </TableCell>
                    <TableCell>{activity.description}</TableCell>
                    <TableCell>{activity.leadName}</TableCell>
                    <TableCell>{getUserName(activity.assignedTo)}</TableCell>
                    <TableCell>
                      {activity.created_at
                        ? new Date(activity.created_at).toLocaleString()
                        : ''}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Activities;
