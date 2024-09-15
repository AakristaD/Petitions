import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Container, TextField, Typography, Grid, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useUserStore } from '../store/userStore';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";

// Define User interface
interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    token: string;
    password: string;
    imageFilename: string;
}

const EditUser = () => {
    const navigate = useNavigate();
    const { user, setUser } = useUserStore(state => ({
        user: state.user,
        setUser: state.setUser
    }));
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = React.useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
    const [previewOpen, setPreviewOpen] = useState(false);
    const [hasProfilePicture, setHasProfilePicture] = useState(false);


    useEffect(() => {
        if (user && typeof user.userId === 'number') {
            axios.get(`http://localhost:4941/api/v1/users/${user.userId}`, {
                headers: {
                    'X-Authorization': user.token
                }
            })
                .then(response => {
                    const userData: User = { ...response.data, token: user.token, userId: user.userId };
                    setFirstName(userData.firstName);
                    setLastName(userData.lastName);
                    setEmail(userData.email);
                    setUser(userData); // Ensure the user store is updated
                    setHasProfilePicture(true); // Assume the user has a profile picture if the request is successful
                })
                .catch(error => {
                    console.error('Failed to fetch user details', error);
                });
        }
    }, [user, setUser]);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileType = file.type;
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (validImageTypes.includes(fileType)) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
                setPreviewOpen(true);
            } else {
                setSnackbarMessage('Invalid file type. Please select a JPEG, PNG, or GIF image.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }
    };
    const handleClickShowPassword = () => setShowPassword((show) => !show);


    const handleRemoveImage = async () => {
        try {
            const { token, userId } = user;
            await axios.delete(`http://localhost:4941/api/v1/users/${userId}/image`, {
                headers: {
                    'X-Authorization': token
                }
            });
            setImage(null);
            setImagePreview(null);
            setHasProfilePicture(false);
            setSnackbarMessage('Profile picture removed successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            setSnackbarMessage('Failed to remove profile picture.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const updateData: Partial<User & { password?: string; currentPassword?: string }> = {
            firstName,
            lastName,
            email
        };

        if (newPassword) {
            if (newPassword.length < 6) {
                setSnackbarMessage('Password must be at least 6 characters.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
            updateData.currentPassword = currentPassword;
            updateData.password = newPassword;
        }

        try {
            const { token, userId } = user;
            await axios.patch(`http://localhost:4941/api/v1/users/${userId}`, updateData, {
                headers: {
                    'X-Authorization': token
                }
            });

            const updatedUser = { ...user, firstName, lastName, email };

            if (image) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const binaryString = reader.result as string;
                    const binaryData = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        binaryData[i] = binaryString.charCodeAt(i);
                    }

                    await axios.put(`http://localhost:4941/api/v1/users/${userId}/image`, binaryData, {
                        headers: {
                            'X-Authorization': token,
                            'Content-Type': image.type
                        }
                    });

                    setSnackbarMessage('Profile updated successfully with new image!');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);
                    setUser(updatedUser);
                    setTimeout(() => {
                        setTimeout(() => {
                            navigate('/profile');
                            window.location.reload();
                        }, 200);
                    }, 200);
                };
                reader.readAsBinaryString(image);
            } else {
                setSnackbarMessage('Profile updated successfully!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setUser(updatedUser);
                setTimeout(() => {
                    setTimeout(() => {
                        navigate('/profile');
                        window.location.reload();
                    }, 200);
                }, 200);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 400:
                        setSnackbarMessage('Bad Request: Please check your input.');
                        break;
                    case 401:
                        setSnackbarMessage('Unauthorized or Invalid current password.');
                        break;
                    case 403:
                        setSnackbarMessage('Email is already in use.');
                        break;
                    default:
                        setSnackbarMessage('An error occurred. Please try again.');
                }
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            } else {
                console.error('There was an error!', error);
            }
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handlePreviewClose = () => {
        setPreviewOpen(false);
    };

    return (
        <Container component="main" maxWidth="md">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                name="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                id="lastName"
                                label="Last Name"
                                name="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                fullWidth
                                name="currentPassword"
                                label="Current Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                helperText="Enter current password to change password."
                                onChange={e => setCurrentPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />

                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                margin="normal"
                                fullWidth
                                name="newPassword"
                                label="New Password"
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                autoComplete="current-password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                            >
                                Upload Profile Picture
                                <input
                                    type="file"
                                    hidden
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Grid>
                        {hasProfilePicture && (
                            <Grid item xs={6}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    onClick={handleRemoveImage}
                                >
                                    Remove Profile Picture
                                </Button>
                            </Grid>
                        )}
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Save Changes
                    </Button>
                </Box>
            </Box>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Dialog open={previewOpen} onClose={handlePreviewClose}>
                <DialogTitle>Image Preview</DialogTitle>
                <DialogContent>
                    {imagePreview && <img src={imagePreview} alt="Image Preview" style={{ maxWidth: '100%' }} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePreviewClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EditUser;
