import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Box,
    Grid,
    TextField,
    Button,
    Typography,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Select,
    MenuItem,
    Card,
    CardContent,
    CardMedia,
    FormControl,
    InputLabel, Divider
} from '@mui/material';
import { useUserStore } from '../store/userStore';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";

const EditPetition = () => {
    const [petition, setPetition] = useState<Petition>({
        petitionId: 0,
        title: "",
        categoryId: 0,
        creationDate: 0,
        ownerId: 0,
        ownerFirstName: "",
        ownerLastName: "",
        numberOfSupporters: 0,
        moneyRaised: 0,
        supportTiers: [],
        supportingCost: 0,
        description: ""
    });
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [supportTiers, setSupportTiers] = useState<{ supportTierId?: number; title: string; cost: number; description: string }[]>([]);
    const [newSupportTier, setNewSupportTier] = useState({ title: '', cost: 0, description: '' });
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ categoryId: number; name: string }[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [tierToDelete, setTierToDelete] = useState<number | null>(null);
    const [tierDialogOpen, setTierDialogOpen] = useState(false);
    const [currentTier, setCurrentTier] = useState<{ index: number; title: string; cost: number; description: string } | null>(null);

    useEffect(() => {
        axios.get(`http://localhost:4941/api/v1/petitions/${id}`)
            .then(response => {
                setPetition(response.data);
            })
            .catch(error => {
            });
    }, [id]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        axios.get(`http://localhost:4941/api/v1/petitions/${id}`)
            .then(response => {
                const petition = response.data;
                if (petition.ownerId !== user.userId) {
                    navigate('/view-petitions');
                    return;
                }
                setTitle(petition.title);
                setDescription(petition.description);
                setCategoryId(petition.categoryId);
                setSupportTiers(petition.supportTiers);
            })
            .catch(error => {
                console.error('Error fetching petition data', error);
                setSnackbarMessage('Failed to fetch petition data.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            });

        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Error fetching categories', error);
            });
    }, [id, user, navigate]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleTierChange = (field: string, value: string | number) => {
        if (currentTier) {
            setCurrentTier({ ...currentTier, [field]: value });

        }

    };

    const handleAddTier = () => {
        setCurrentTier({ index: supportTiers.length, title: '', cost: 0, description: '' });
        setTierDialogOpen(true);
    };

    const handleEditTier = (index: number) => {
        const tier = supportTiers[index];
        setCurrentTier({ index, ...tier });
        setTierDialogOpen(true);
    };

    const handleTierDialogClose = () => {
        setTierDialogOpen(false);
        setCurrentTier(null);
    };

    const handleTierDialogSave = async () => {
        if (!currentTier) return;

        const { index, ...tierData } = currentTier;
        const newSupportTiers = [...supportTiers];

        if (typeof newSupportTiers[index]?.supportTierId === 'undefined') {
            try {
                const response = await axios.put(`http://localhost:4941/api/v1/petitions/${id}/supportTiers`, tierData, {
                    headers: { 'X-Authorization': user.token }
                });
                newSupportTiers[index] = { ...tierData, supportTierId: response.data.supportTierId };
            } catch (error) {
                console.error('Error adding support tier', error);
                // @ts-ignore
                setSnackbarMessage(`${error.response.statusText}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
        } else {
            try {
                await axios.patch(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${newSupportTiers[index].supportTierId}`, tierData, {
                    headers: { 'X-Authorization': user.token }
                });
                newSupportTiers[index] = { ...newSupportTiers[index], ...tierData };
            } catch (error) {
                console.error('Error updating support tier', );
                // @ts-ignore
                setSnackbarMessage(`${error.response.statusText}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
        }

        setSupportTiers(newSupportTiers);
        handleTierDialogClose();
        setSnackbarMessage('Support tier saved successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        window.location.reload()
    };


    const handleDeleteTier = async () => {
        if (tierToDelete === null) return;
        try {
            await axios.delete(`http://localhost:4941/api/v1/petitions/${id}/supportTiers/${tierToDelete}`, {
                headers: { 'X-Authorization': user.token }
            });
            setSupportTiers(supportTiers.filter(tier => tier.supportTierId !== tierToDelete));
            setConfirmDialogOpen(false);
            setSnackbarMessage('Support tier deleted successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error deleting support tier', error);
            setSnackbarMessage("This tier has supporters, or is the only tier available. Cant delete. ");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const fileType = file.type;
            const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (validImageTypes.includes(fileType)) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
            } else {
                setSnackbarMessage('Invalid file type. Please select a JPEG, PNG, or GIF image.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }
    };

    const handleImageUpload = async () => {
        if (!image) {
            setSnackbarMessage('No image selected.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        try {
            const imageType = image.type;
            await axios.put(`http://localhost:4941/api/v1/petitions/${id}/image`, image, {
                headers: {
                    'X-Authorization': user.token,
                    'Content-Type': imageType
                }
            });
            setSnackbarMessage('Image updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error uploading image', error);
            setSnackbarMessage('Failed to upload image.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleDetailsUpdate = async () => {
        try {
            await axios.patch(`http://localhost:4941/api/v1/petitions/${id}`, { title, description, categoryId }, {
                headers: { 'X-Authorization': user.token }
            });
            setSnackbarMessage('Petition details updated successfully!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error updating petition details', error);
            setSnackbarMessage("Missing details or duplicate title. ");
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
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

                <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 3 }}
                    onClick={() => navigate(-1)}
                >
                    Back
                </Button>
                <Card sx={{ width: '100%', mb: 3, justifyContent:"center" }}>
                    <CardContent sx={{ justifyContent:"center"}}>
                        <CardMedia sx={{borderRadius: 10, border: "2px solid black", width:"100%", alignSelf:"center"}}
                                   component="img"
                                   height="300"
                                   image={`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`}
                                   alt={petition.title}
                        />
                        <br/>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="title"
                                    label="Title"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel id="category-label">Category</InputLabel>
                                    <Select
                                        labelId="category-label"
                                        id="categoryId"
                                        value={categoryId}
                                        label="Category"
                                        onChange={(e) => setCategoryId(e.target.value as string)}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.categoryId} value={category.categoryId}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    multiline
                                    rows={4}
                                    id="description"
                                    label="Description"
                                    name="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    sx={{ mt: 1 }}
                                    onClick={handleDetailsUpdate}
                                >
                                    Update Details
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                <Card sx={{ width: '100%', mb: 3, borderRadius: 2, boxShadow: 3, p: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2 }}>
                            Manage Support Tiers
                        </Typography>
                        {supportTiers.map((tier, index) => (
                            <Card key={index} sx={{ mb: 2, borderRadius: 2, boxShadow: 1, p: 2 }}>
                                <CardContent>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {tier.title}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        ${tier.cost}
                                    </Typography>
                                    <Typography variant="body2">
                                        {tier.description}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<EditIcon />}
                                            onClick={() => handleEditTier(index)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => {
                                                setConfirmDialogOpen(true);
                                                setTierToDelete(tier.supportTierId || null);
                                            }}
                                            disabled={!tier.supportTierId}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                        {supportTiers.length < 3 && (
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleAddTier}
                                >
                                    Add Support Tier
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
            <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
                <DialogTitle>Delete Support Tier</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this support tier? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialogOpen(false)} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteTier}
                        variant="outlined"
                        color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={tierDialogOpen} onClose={handleTierDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>{currentTier?.index !== undefined ? 'Edit Support Tier' : 'Add Support Tier'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Title"
                                value={currentTier?.title || ''}
                                onChange={(e) => handleTierChange('title', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="number"
                                label="Cost"
                                value={currentTier?.cost || 0}
                                InputProps={{
                                    inputProps: { min: 0 }
                                }}
                                onChange={(e) => handleTierChange('cost', parseInt(e.target.value))}
                            />
                        </Grid>
                    </Grid>
                    <hr/>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            required
                            fullWidth
                            label="Description"
                            value={currentTier?.description || ''}
                            onChange={(e) => handleTierChange('description', e.target.value)}
                        />
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleTierDialogClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleTierDialogSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EditPetition;
