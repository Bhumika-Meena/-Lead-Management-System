import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { usersAPI } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDialog, setUserDialog] = useState({ open: false, user: null });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'sales' });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);
  const [userSuccess, setUserSuccess] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDialogOpen = (user = null) => {
    setUserDialog({ open: true, user });
    setUserForm(user ? { name: user.name, email: user.email, password: '', role: user.role } : { name: '', email: '', password: '', role: 'sales' });
    setUserError(null);
  };

  const handleUserDialogClose = () => {
    setUserDialog({ open: false, user: null });
    setUserForm({ name: '', email: '', password: '', role: 'sales' });
    setUserError(null);
  };

  const handleUserFormChange = (e) => {
    setUserForm({ ...userForm, [e.target.name]: e.target.value });
    if (userError) setUserError(null);
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setUserLoading(true);
    setUserError(null);
    try {
      if (userDialog.user) {
        // Edit user
        await usersAPI.update(userDialog.user.id, userForm);
        setUserSuccess('User updated successfully');
      } else {
        // Add user
        await usersAPI.create(userForm);
        setUserSuccess('User added successfully');
      }
      handleUserDialogClose();
      fetchUsers();
      setTimeout(() => setUserSuccess(null), 3000);
    } catch (err) {
      setUserError('Failed to save user');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await usersAPI.delete(deleteDialog.user.id);
      setDeleteDialog({ open: false, user: null });
      setUserSuccess('User deleted successfully');
      fetchUsers();
      setTimeout(() => setUserSuccess(null), 3000);
    } catch (err) {
      setUserError('Failed to delete user');
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          User Management
        </Typography>
        <Button variant="contained" startIcon={<Add />} sx={{ borderRadius: 2 }} onClick={() => handleUserDialogOpen()}>
          Add User
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {userSuccess && <Alert severity="success" sx={{ mb: 3 }}>{userSuccess}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleUserDialogOpen(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, user })}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Add/Edit User Dialog */}
      <Dialog open={userDialog.open} onClose={handleUserDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{userDialog.user ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleUserFormSubmit} sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              value={userForm.name}
              onChange={handleUserFormChange}
              required
            />
            <TextField
              name="email"
              label="Email"
              value={userForm.email}
              onChange={handleUserFormChange}
              required
              type="email"
            />
            <TextField
              name="password"
              label="Password"
              value={userForm.password}
              onChange={handleUserFormChange}
              required={!userDialog.user}
              type="password"
              helperText={userDialog.user ? 'Leave blank to keep current password' : ''}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={userForm.role}
                label="Role"
                onChange={handleUserFormChange}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
              </Select>
            </FormControl>
            {userError && <Alert severity="error">{userError}</Alert>}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button onClick={handleUserDialogClose} disabled={userLoading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={userLoading}>{userLoading ? 'Saving...' : 'Save'}</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      {/* Delete User Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{deleteDialog.user?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users; 