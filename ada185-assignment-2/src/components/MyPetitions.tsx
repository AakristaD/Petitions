import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Grid, Pagination, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from '@mui/material';
import SinglePetition from './SinglePetition';
import axios from 'axios';
import { useUserStore } from '../store/userStore';
import {useState} from "react";

const MyPetitions: React.FC = () => {
    const user = useUserStore(state => state.user);
    const [myPetitions, setMyPetitions] = React.useState<Petition[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [page, setPage] = React.useState(1);
    const petitionsPerPage = 4;
    const [open, setOpen] = React.useState(false);
    const [selectedPetition, setSelectedPetition] = React.useState<Petition | null>(null);
    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!user) {
            setLoading(false);
            setError('No user found.');
            return;
        }

        const fetchPetitions = async () => {
            try {
                const ownerResponse = await axios.get(`http://localhost:4941/api/v1/petitions?ownerId=${user.userId}`);
                const supporterResponse = await axios.get(`http://localhost:4941/api/v1/petitions?supporterId=${user.userId}`);

                const combinedPetitions = [...ownerResponse.data.petitions, ...supporterResponse.data.petitions];

                // Remove duplicates
                const uniquePetitions = Array.from(new Set(combinedPetitions.map(p => p.petitionId)))
                    .map(id => combinedPetitions.find(p => p.petitionId === id));

                setMyPetitions(uniquePetitions);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch petitions.');
                setLoading(false);
            }
        };

        fetchPetitions();
    }, [user]);

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleDeleteClick = (petition: Petition) => {
        setSelectedPetition(petition);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedPetition(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPetition) return;

        try {
            const response = await axios.delete(`http://localhost:4941/api/v1/petitions/${selectedPetition.petitionId}`, {
                headers: {
                    'X-Authorization': user.token
                }
            });

            if (response.status === 200) {
                setMyPetitions(myPetitions.filter(p => p.petitionId !== selectedPetition.petitionId));
                handleClose();
                setSnackbarSeverity('success');
                setSnackbarMessage('Petition deleted successfully.');
                setSnackbarOpen(true);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 401:
                        setSnackbarSeverity("error")
                        setSnackbarMessage('Unauthorized');
                        break;
                    case 403:
                        setSnackbarSeverity("error")
                        setSnackbarMessage('Petition has supporters. Cannot delete.');
                        break;
                    case 404:
                        setSnackbarSeverity("error")
                        setSnackbarMessage('Not Found: No petition found with the given ID.');
                        break;
                    default:
                        setSnackbarSeverity("error")
                        setSnackbarMessage('An error occurred. Please try again.');
                }
                setSnackbarOpen(true);
            } else {
                console.error("There was an error!", error);
            }
        }
    };

    const handleEditClick = (petitionId: number) => {
        navigate(`/edit-petition/${petitionId}`);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }

    // Calculate the petitions to display on the current page
    const indexOfLastPetition = page * petitionsPerPage;
    const indexOfFirstPetition = indexOfLastPetition - petitionsPerPage;
    const currentPetitions = myPetitions.slice(indexOfFirstPetition, indexOfLastPetition);
    const totalPages = Math.ceil(myPetitions.length / petitionsPerPage);

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2}>
                {currentPetitions.map(petition => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={petition.petitionId}>
                        <SinglePetition petition={petition} />
                        {petition.ownerId === user.userId && (
                            <>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    fullWidth
                                    sx={{ mt: 1 }}
                                    onClick={() => handleEditClick(petition.petitionId)}
                                >
                                    Edit Petition
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    sx={{ mt: 1 }}
                                    onClick={() => handleDeleteClick(petition)}
                                >
                                    Delete Petition
                                </Button>
                            </>
                        )}
                    </Grid>
                ))}
            </Grid>
            {myPetitions.length > petitionsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                    />
                </Box>
            )}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete Petition</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this petition? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MyPetitions;
