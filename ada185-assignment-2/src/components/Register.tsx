import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { useImageStore } from "../store/imageStore";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import {Chip} from "@mui/material";


function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            <Link color="inherit" href="https://mui.com/">
                Your Website
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();

const Register = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [firstNameError, setFirstNameError] = useState<string | null>(null);
    const [lastNameError, setLastNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [password, setPassword] = useState('');

    const setUser = useUserStore(state => state.setUser);
    const setImage = useImageStore(state => state.setImage);
    const image = useImageStore(state => state.image);
    const clearImage = useImageStore(state => state.clearImage);

    const navigate = useNavigate();

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (validImageTypes.includes(file.type)) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
            } else {
                setSnackbarMessage('Invalid file type. Please select a JPEG, PNG, or GIF image.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }
    };
    const user = useUserStore(state => state.user);
    useEffect(() => {
        if (user && user.token) {
            navigate('/view-petitions');
        }
    }, [user, navigate]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const firstName = data.get('firstName') as string;
        const lastName = data.get('lastName') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        let valid = true;

        setFirstNameError(null);
        setLastNameError(null);
        setEmailError(null);
        setPasswordError(null);

        if (firstName.trim() === '') {
            setFirstNameError('First name is required');
            valid = false;
        }

        if (lastName.trim() === '') {
            setLastNameError('Last name is required');
            valid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email address');
            valid = false;
        }

        if (password.length < 6) {
            setPasswordError('Password needs to be at least 6 characters long');
            valid = false;
        }

        if (valid) {
            try {
                await axios.post('http://localhost:4941/api/v1/users/register', {
                    firstName,
                    lastName,
                    email,
                    password
                });

                const loginResponse = await axios.post('http://localhost:4941/api/v1/users/login', {
                    email,
                    password
                });

                setUser(loginResponse.data);

                if (image) {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        try {
                            const arrayBuffer = reader.result as ArrayBuffer;
                            const byteArray = new Uint8Array(arrayBuffer);
                            await axios.put(`http://localhost:4941/api/v1/users/${loginResponse.data.userId}/image`, byteArray, {
                                headers: {
                                    'X-Authorization': loginResponse.data.token,
                                    'Content-Type': image.type
                                }
                            });

                            setSnackbarMessage('User registered successfully with image!');
                            setSnackbarSeverity('success');
                            setSnackbarOpen(true);

                            setTimeout(() => {
                                setTimeout(() => {
                                    navigate('/view-petitions');
                                    window.location.reload();
                                }, 200);
                            }, 200);
                        } catch (imageError) {
                            console.error('Error uploading image', imageError);
                            setSnackbarMessage('User registered, but there was an error uploading the image.');
                            setSnackbarSeverity('error');
                            setSnackbarOpen(true);

                            setTimeout(() => {
                                setTimeout(() => {
                                    navigate('/profile');
                                    window.location.reload();
                                }, 200);
                            }, 200);
                        }
                    };
                    reader.readAsArrayBuffer(image);
                } else {
                    setSnackbarMessage('User registered successfully!');
                    setSnackbarSeverity('success');
                    setSnackbarOpen(true);

                    setTimeout(() => {
                        window.location.reload();
                        setTimeout(() => {
                            navigate('/profile');
                        }, 500);
                    }, 2000);
                }

            } catch (error) {
                if (axios.isAxiosError(error) && error.response) {
                    if (error.response.status === 403) {
                        setEmailError('Email already in use');
                    } else {
                        setSnackbarMessage('There was an error registering the user. Please try again later.');
                        setSnackbarSeverity('error');
                        setSnackbarOpen(true);
                    }
                } else {
                    console.error('There was an error registering the user!', error);
                }
            }
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };




    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Register Account
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="given-name"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    error={!!firstNameError}
                                    helperText={firstNameError}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="family-name"
                                    error={!!lastNameError}
                                    helperText={lastNameError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    error={!!emailError}
                                    helperText={emailError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    error={!!passwordError}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    helperText={passwordError ? 'Password is required' : ''}
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
                                <Button
                                    variant="contained"
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
                            {imagePreview && (
                                <Grid item xs={12}>
                                    <img src={imagePreview} alt="Image preview" style={{ width: '100%', marginTop: '10px' }} />
                                </Grid>
                            )}
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="login" variant="body2">
                                    Already have an account? Log In!
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Container>
        </ThemeProvider>
    );
}
export default Register;
