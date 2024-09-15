import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { Avatar, Box, Button, Card, CardContent, Container, Divider, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
    const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });
    const userState = useUserStore(state => state.user);

    const handleGetUserDetails = async () => {
        const { userId, token } = userState;
        try {
            const response = await axios.get(`http://localhost:4941/api/v1/users/${userId}`, {
                headers: {
                    'X-Authorization': token
                },
            });
            if (response.status === 200) {
                setUser(response.data);
                console.log('User details retrieved successfully', response.data);
            }
        } catch (error) {
            console.error('Error during retrieving user details', error);
        }
    };

    useEffect(() => {
        if (userState?.token) {
            handleGetUserDetails();
        }
    }, [userState]);

    return (
        userState?.token ? (
            <Container maxWidth="sm" sx={{ mt: 5 }}>
                <Card sx={{ p: 3, textAlign: 'center', boxShadow: 3 }}>
                    <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                            src={`http://localhost:4941/api/v1/users/${userState.userId}/image`}
                            sx={{ width: 120, height: 120, mb: 2 }}
                        />
                        <Button
                            href="/edit-user"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 'calc(50% - 60px)',
                                backgroundColor: 'navajowhite',
                                borderRadius: '50%',
                                p: 1,
                                minWidth: 0
                            }}
                        >
                            <EditIcon />
                        </Button>
                    </Box>
                    <Typography variant="h5" component="div">
                        {user.firstName} {user.lastName}
                    </Typography>
                    {user.email && (
                        <Typography variant="body1" color="textSecondary">
                            {user.email}
                        </Typography>
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            First Name
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {user.firstName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Last Name
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {user.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Email
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                            {user.email}
                        </Typography>

                    </Box>
                </Card>
            </Container>
        ) : (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Typography variant="h5" component="div">
                    Not logged in
                </Typography>
            </Box>
        )
    );
};

export default Profile;
