import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { authAPI, otpAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function formatDate(date) {
  return new Date(date).toLocaleString();
}

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit dialog state
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Confirmation flows
  const [pendingEmail, setPendingEmail] = useState(null);
  const [pendingPhone, setPendingPhone] = useState(null);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null); // 'email' or 'phone'
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState(null);

  // Password change
  const [pwDialog, setPwDialog] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [pwSuccess, setPwSuccess] = useState(null);
  const [pwPending, setPwPending] = useState(false);

  const [pwOtpToken, setPwOtpToken] = useState(null);
  const [pwOtpDialog, setPwOtpDialog] = useState(false);
  const [pwOtpCode, setPwOtpCode] = useState('');

  const [otpToken, setOtpToken] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getProfile();
      setProfile(res.data.user);
    } finally {
      setLoading(false);
    }
  };

  // Edit Profile
  const handleEditOpen = () => {
    setEditForm({ name: profile.name, email: profile.email, phone: profile.phone || '' });
    setEditDialog(true);
    setEditError(null);
  };
  const handleEditClose = () => {
    setEditDialog(false);
    setEditError(null);
  };
  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    if (editError) setEditError(null);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      // If email changed, trigger OTP flow
      if (editForm.email !== profile.email) {
        const res = await otpAPI.requestEmailChange(editForm.email);
        setPendingEmail(editForm.email);
        setOtpToken(res.data.otpToken);
        setConfirmDialog('email');
        handleEditClose();
        setEditLoading(false);
        return;
      }
      // Otherwise, update profile directly
      const res = await authAPI.updateProfile({ name: editForm.name, email: editForm.email });
      setProfile(res.data.user);
      setUser(res.data.user);
      handleEditClose();
    } catch (err) {
      setEditError('Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  // Email/Phone confirmation
  const handleConfirmClose = () => {
    setConfirmDialog(null);
    setConfirmError(null);
    setEmailCode('');
    setPhoneCode('');
  };
  const handleEmailCodeSubmit = async () => {
    setConfirmLoading(true);
    setConfirmError(null);
    try {
      await otpAPI.confirmEmailChange(emailCode, otpToken);
      setProfile({ ...profile, email: pendingEmail });
      setUser({ ...user, email: pendingEmail });
      setPendingEmail(null);
      setOtpToken(null);
      setEmailCode('');
      setConfirmError(null); // Clear error on success
      setConfirmDialog(null); // Close dialog on success
    } catch {
      setConfirmError('Invalid code');
    } finally {
      setConfirmLoading(false);
    }
  };
  const handlePhoneCodeSubmit = async () => {
    setConfirmLoading(true);
    setConfirmError(null);
    try {
      await authAPI.confirmPhoneChange(phoneCode);
      setProfile({ ...profile, phone: pendingPhone });
      setUser({ ...user, phone: pendingPhone });
      setPendingPhone(null);
      setConfirmDialog(null);
    } catch {
      setConfirmError('Invalid code');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Password change
  const handlePwOpen = () => {
    setPwForm({ currentPassword: '', newPassword: '' });
    setPwDialog(true);
    setPwError(null);
    setPwSuccess(null);
    setPwPending(false);
  };
  const handlePwClose = () => {
    setPwDialog(false);
    setPwError(null);
    setPwSuccess(null);
    setPwPending(false);
  };
  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    if (pwError) setPwError(null);
  };
  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError(null);
    try {
      const res = await otpAPI.requestPasswordChange(pwForm.newPassword);
      setPwOtpToken(res.data.otpToken);
      setPwOtpDialog(true);
      setPwDialog(false); // Close the password form dialog
    } catch {
      setPwError('Failed to initiate password change');
    } finally {
      setPwLoading(false);
    }
  };

  const handlePwOtpSubmit = async () => {
    setPwLoading(true);
    setPwError(null);
    try {
      await otpAPI.confirmPasswordChange(pwOtpCode, pwOtpToken);
      setPwOtpDialog(false);
      setPwOtpToken(null);
      setPwOtpCode('');
      setPwSuccess('Password changed successfully!');
    } catch {
      setPwError('Invalid code');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading || !profile) {
    return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Profile & Settings</Typography>
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6">Name</Typography>
          <Typography sx={{ mb: 2 }}>{profile.name}</Typography>
          <Typography variant="h6">Email</Typography>
          <Typography sx={{ mb: 2 }}>{profile.email}</Typography>
          <Typography variant="h6">Role</Typography>
          <Typography sx={{ mb: 2 }}>{profile.role}</Typography>
          {/* <Typography variant="h6">Created At</Typography>
          <Typography sx={{ mb: 2 }}>{profile.createdAt ? formatDate(profile.createdAt) : '-'}</Typography>
          <Typography variant="h6">Created By</Typography>
          <Typography sx={{ mb: 2 }}>{profile.createdByName || '-'}</Typography> */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button variant="contained" onClick={handleEditOpen}>Edit Profile</Button>
            <Button variant="outlined" onClick={handlePwOpen}>Change Password</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialog} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditSubmit} sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField name="name" label="Name" value={editForm.name} onChange={handleEditChange} required />
            <TextField name="email" label="Email" value={editForm.email} onChange={handleEditChange} required type="email" />
            {/* <TextField name="phone" label="Phone" value={editForm.phone} onChange={handleEditChange} required /> */}
            {/* {editError && <Alert severity="error">{editError}</Alert>} */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button onClick={handleEditClose} disabled={editLoading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Email Confirmation Dialog */}
      <Dialog open={confirmDialog === 'email'} onClose={handleConfirmClose} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Email Change</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>A confirmation code has been sent to <b>{pendingEmail}</b>. Please enter it below:</Typography>
          <TextField label="Confirmation Code" value={emailCode} onChange={e => setEmailCode(e.target.value)} fullWidth />
          {/* {confirmError && <Alert severity="error">{confirmError}</Alert>} */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button onClick={handleConfirmClose} disabled={confirmLoading}>Cancel</Button>
            <Button onClick={handleEmailCodeSubmit} variant="contained" disabled={confirmLoading || !emailCode}>{confirmLoading ? 'Verifying...' : 'Verify'}</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Phone Confirmation Dialog */}
      <Dialog open={confirmDialog === 'phone'} onClose={handleConfirmClose} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Phone Change</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>A confirmation code has been sent to <b>{pendingPhone}</b>. Please enter it below:</Typography>
          <TextField label="Confirmation Code" value={phoneCode} onChange={e => setPhoneCode(e.target.value)} fullWidth />
          {confirmError && <Alert severity="error">{confirmError}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button onClick={handleConfirmClose} disabled={confirmLoading}>Cancel</Button>
            <Button onClick={handlePhoneCodeSubmit} variant="contained" disabled={confirmLoading || !phoneCode}>{confirmLoading ? 'Verifying...' : 'Verify'}</Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={pwDialog} onClose={handlePwClose} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {pwPending ? (
            <Alert severity="info">{pwSuccess}</Alert>
          ) : (
            <Box component="form" onSubmit={handlePwSubmit} sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField name="currentPassword" label="Current Password" value={pwForm.currentPassword} onChange={handlePwChange} required type="password" />
              <TextField name="newPassword" label="New Password" value={pwForm.newPassword} onChange={handlePwChange} required type="password" />
              {pwError && <Alert severity="error">{pwError}</Alert>}
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button onClick={handlePwClose} disabled={pwLoading}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={pwLoading}>{pwLoading ? 'Saving...' : 'Save'}</Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Password Change Dialog */}
      <Dialog open={pwOtpDialog} onClose={() => setPwOtpDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Password Change</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            A confirmation code has been sent to your email. Please enter it below:
          </Typography>
          <TextField
            label="Confirmation Code"
            value={pwOtpCode}
            onChange={e => setPwOtpCode(e.target.value)}
            fullWidth
          />
          {/* Remove or comment out error display if you don't want it */}
          {pwError && <Alert severity="error">{pwError}</Alert>}
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button onClick={() => setPwOtpDialog(false)} disabled={pwLoading}>Cancel</Button>
            <Button onClick={handlePwOtpSubmit} variant="contained" disabled={pwLoading || !pwOtpCode}>
              {pwLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Profile; 