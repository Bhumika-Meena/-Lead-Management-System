import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Visibility,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { leadsAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LeadForm from '../components/LeadForm';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    lead_source: '',
    assigned_to: '',
    search: '',
  });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, lead: null });
  const [assignDialog, setAssignDialog] = useState({ open: false, lead: null, assignedTo: '' });
  const [editDialog, setEditDialog] = useState({ open: false, lead: null });
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    if (isAdmin) {
      fetchUsers();
    }
  }, [filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });
      
      const response = await leadsAPI.getAll(params);
      setLeads(response.data.leads || []);
    } catch (err) {
      setError('Failed to load leads');
      console.error('Leads error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Users error:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDelete = async () => {
    try {
      await leadsAPI.delete(deleteDialog.lead.id);
      setLeads(prev => prev.filter(lead => lead.id !== deleteDialog.lead.id));
      setDeleteDialog({ open: false, lead: null });
      setSuccess('Lead deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete lead');
    }
  };

  const handleAssign = async () => {
    try {
      await leadsAPI.assign(assignDialog.lead.id, assignDialog.assignedTo);
      setLeads(prev => prev.map(lead => 
        lead.id === assignDialog.lead.id 
          ? { ...lead, assigned_to: assignDialog.assignedTo }
          : lead
      ));
      setAssignDialog({ open: false, lead: null, assignedTo: '' });
    } catch (err) {
      setError('Failed to assign lead');
    }
  };

  const handleEdit = (lead) => {
    setEditDialog({ open: true, lead });
  };

  const handleEditSuccess = () => {
    setEditDialog({ open: false, lead: null });
    fetchLeads();
  };

  const handleEditCancel = () => {
    setEditDialog({ open: false, lead: null });
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

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unassigned';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Leads Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/leads/new')}
          sx={{ borderRadius: 2 }}
        >
          Add New Lead
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Contacted">Contacted</MenuItem>
                  <MenuItem value="Qualified">Qualified</MenuItem>
                  <MenuItem value="Converted">Converted</MenuItem>
                  <MenuItem value="Disqualified">Disqualified</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Source</InputLabel>
                <Select
                  value={filters.lead_source}
                  label="Source"
                  onChange={(e) => handleFilterChange('lead_source', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Social Media">Social Media</MenuItem>
                  <MenuItem value="Cold Call">Cold Call</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {isAdmin && (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Assigned To</InputLabel>
                  <Select
                    value={filters.assigned_to}
                    label="Assigned To"
                    onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    {users.map(user => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} hover>
                <TableCell>{lead.name}</TableCell>
                <TableCell>{lead.email}</TableCell>
                <TableCell>{lead.phone}</TableCell>
                <TableCell>{lead.lead_source}</TableCell>
                <TableCell>
                  <Chip
                    label={lead.status}
                    color={getStatusColor(lead.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getUserName(lead.assigned_to)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/leads/${lead.id}`)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(lead)}
                  >
                    <Edit />
                  </IconButton>
                  {isAdmin && (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => setAssignDialog({ 
                          open: true, 
                          lead, 
                          assignedTo: lead.assigned_to || '' 
                        })}
                      >
                        <Assignment />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteDialog({ open: true, lead })}
                      >
                        <Delete />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, lead: null })}>
        <DialogTitle>Delete Lead</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{deleteDialog.lead?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, lead: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialog.open} onClose={() => setAssignDialog({ open: false, lead: null, assignedTo: '' })}>
        <DialogTitle>Assign Lead</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Assign to</InputLabel>
            <Select
              value={assignDialog.assignedTo}
              label="Assign to"
              onChange={(e) => setAssignDialog(prev => ({ ...prev, assignedTo: e.target.value }))}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog({ open: false, lead: null, assignedTo: '' })}>
            Cancel
          </Button>
          <Button onClick={handleAssign} variant="contained">
            Assign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lead Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Lead</DialogTitle>
        <DialogContent>
          <LeadForm lead={editDialog.lead} onSuccess={handleEditSuccess} onCancel={handleEditCancel} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Leads; 