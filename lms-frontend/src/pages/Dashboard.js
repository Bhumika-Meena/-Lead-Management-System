import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Business,
  Assignment,
  People,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { leadsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getAll({ limit: 1000 });
      const leads = response.data.leads || [];
      
      // Calculate stats
      const totalLeads = leads.length;
      const newLeads = leads.filter(lead => lead.status === 'New').length;
      const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
      const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;

      setStats({
        totalLeads,
        newLeads,
        qualifiedLeads,
        convertedLeads,
      });

      // Get recent leads
      setRecentLeads(leads.slice(0, 5));

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
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
          Dashboard
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

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Leads
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.totalLeads}
                  </Typography>
                </Box>
                <Business sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    New Leads
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.newLeads}
                  </Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Qualified
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.qualifiedLeads}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Converted
                  </Typography>
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {stats.convertedLeads}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Leads and Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Leads
              </Typography>
              <List>
                {recentLeads.length > 0 ? (
                  recentLeads.map((lead) => (
                    <ListItem
                      key={lead.id}
                      button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      sx={{ borderRadius: 1, mb: 1 }}
                    >
                      <ListItemIcon>
                        <Business />
                      </ListItemIcon>
                      <ListItemText
                        primary={lead.name}
                        secondary={`${lead.email} • ${lead.lead_source}`}
                      />
                      <Chip
                        label={lead.status}
                        color={getStatusColor(lead.status)}
                        size="small"
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                    No leads found
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/leads')}
                  startIcon={<Business />}
                >
                  View All Leads
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/activities')}
                  startIcon={<Assignment />}
                >
                  View Activities
                </Button>
                {isAdmin && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/users')}
                    startIcon={<People />}
                  >
                    Manage Users
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 