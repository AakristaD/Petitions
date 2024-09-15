import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import SwitchRightIcon from '@mui/icons-material/SwitchRight';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useUserStore } from '../store/userStore';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

function ResponsiveAppBar() {
    const [openDialog, setOpenDialog] = React.useState(false);
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const user = useUserStore(state => state.user)
    const clearUser = useUserStore(state => state.clearUser)
    const navigate = useNavigate();


    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };


    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const isLoggedIn = user;

    const handleLogout = async () => {
        try {
            const { token } = user;
            const response = await axios.post('http://localhost:4941/api/v1/users/logout', {}, {
                headers: {
                    'X-Authorization': token
                },
            });
            if (response.status === 200) {
                setOpenSnackbar(true); // Open the snackbar
                clearUser();
                console.log('User logged out successfully');
                handleCloseDialog(); // Close the dialog
                navigate('/view-petitions'); // Redirect to the view-petitions page
                window.location.reload();
            }
        } catch (error) {
            console.error('Error during logout', error);
        }
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const settings = isLoggedIn ? ['Profile', 'Logout'] : ['Login'];

    // @ts-ignore
    return (

        <AppBar position="sticky" sx={{ backgroundColor: '#363636'}}>
            <Snackbar open={openSnackbar} autoHideDuration={6000} >
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    Successfully logged out.
                </Alert>
            </Snackbar>
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
            >
                <DialogTitle>{"Log out"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to log out?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancel
                    </Button>
                    <Button onClick={handleLogout} autoFocus>
                        Log out
                    </Button>
                </DialogActions>
            </Dialog>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <SwitchRightIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/view-petitions"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        CauseConnect
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {isLoggedIn ? (
                                <>
                                    <Button onClick={handleCloseNavMenu}>
                                        <Typography textAlign="center" component="a" href="/start-petition" sx={{ color: 'inherit', textDecoration: 'none', fontFamily: 'monospace'}}>Start A petition</Typography>
                                    </Button>
                                    <Button onClick={handleCloseNavMenu}>
                                        <Typography textAlign="center" component="a" href="/my-petitions" sx={{ color: 'inherit', textDecoration: 'none', fontFamily: 'monospace'}}>My Petitions</Typography>
                                    </Button>
                                </>
                            ) : null}
                            <MenuItem onClick={handleCloseNavMenu}>
                                <Typography textAlign="center" component="a" href="/view-petitions" sx={{ color: 'inherit', textDecoration: 'none', fontFamily: 'monospace'}}>Browse </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                    <SwitchRightIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        CauseConnect
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {!isLoggedIn ? (
                            <>
                                <Button
                                    onClick={handleCloseNavMenu}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'block',
                                        border: '1px solid white',
                                        padding: '5px 15px',
                                        margin: '0 5px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <Typography
                                        component="a"
                                        href="/login"
                                        sx={{
                                            color: 'inherit',
                                            textDecoration: 'none',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        Login
                                    </Typography>
                                </Button>
                                <Button
                                    onClick={handleCloseNavMenu}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'block',
                                        border: '1px solid white',
                                        padding: '5px 15px',
                                        margin: '0 5px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <Typography
                                        component="a"
                                        href="/Register"
                                        sx={{
                                            color: 'inherit',
                                            textDecoration: 'none',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        Register
                                    </Typography>
                                </Button>
                            </>
                        ) : null}
                        {isLoggedIn ? (
                            <>
                                <Button
                                    onClick={handleCloseNavMenu}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'block',
                                        border: '1px solid white',
                                        padding: '5px 15px',
                                        margin: '0 5px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <Typography
                                        component="a"
                                        href="/start-petition"
                                        sx={{
                                            color: 'inherit',
                                            textDecoration: 'none',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        Start A Petition
                                    </Typography>
                                </Button>
                                <Button
                                    onClick={handleCloseNavMenu}
                                    sx={{
                                        my: 2,
                                        color: 'white',
                                        display: 'block',
                                        border: '1px solid white',
                                        padding: '5px 15px',
                                        margin: '0 5px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        }
                                    }}
                                >
                                    <Typography
                                        component="a"
                                        href="/my-petitions"
                                        sx={{
                                            color: 'inherit',
                                            textDecoration: 'none',
                                            fontFamily: 'monospace'
                                        }}
                                    >
                                        My Petitions
                                    </Typography>
                                </Button>
                            </>
                        ) : null}
                        <Button
                            onClick={handleCloseNavMenu}
                            sx={{
                                my: 2,
                                color: 'white',
                                display: 'block',
                                border: '1px solid white',
                                padding: '5px 15px',
                                margin: '0 5px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                }
                            }}
                        >
                            <Typography
                                component="a"
                                href="/view-petitions"
                                sx={{
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    fontFamily: 'monospace',
                                    fontWeight: 300
                                }}
                            >
                                Browse
                            </Typography>
                        </Button>
                    </Box>


                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar
                                    src={`http://localhost:4941/api/v1/users/${user?.userId}/image`}
                                    alt={`User`}
                                    sx={{width: 60, height: 60, padding: 0, margin: 0, border: '2px solid white'}}
                                />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem
                                    key={setting}
                                    onClick={() => {
                                        if (setting === 'Logout') {
                                            handleOpenDialog();
                                        } else if (setting === 'Login') {
                                            navigate('/login');
                                        } else if (setting === 'Profile') {
                                            navigate('/profile');
                                        }
                                        handleCloseUserMenu();
                                    }}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        transition: 'background-color 0.3s',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                        },
                                        '&:active': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.16)',
                                        },
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    <Typography>
                                        {setting}
                                    </Typography>
                                </MenuItem>

                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;