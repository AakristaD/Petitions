import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Grid,
    MenuItem,
    InputLabel,
    Select,
    FormControl,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { useUserStore } from '../store/userStore';

// Define Category interface
interface Category {
    categoryId: number;
    name: string;
}

const CreatePetition = () => {
    const navigate = useNavigate();
    const user = useUserStore(state => state.user);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [supportTiers, setSupportTiers] = useState([{ title: '', cost: '', description: '' }]);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState<'error' | 'success'>('error');
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        // Fetch categories from the server
        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then(response => {
                setCategories(response.data);
            })
            .catch(error => {
                console.error('Failed to fetch categories', error);
            });
    }, []);

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Typography variant="h6" color="error">
                    You must be logged in to create a petition.
                </Typography>
            </Box>
        );
    }

    const handleTierChange = (index: number, field: string, value: string) => {
        const newSupportTiers = [...supportTiers];
        newSupportTiers[index] = { ...newSupportTiers[index], [field]: value };
        setSupportTiers(newSupportTiers);
    };

    const handleAddTier = () => {
        setSupportTiers([...supportTiers, { title: '', cost: '', description: '' }]);
    };

    const handleRemoveTier = (index: number) => {
        const newSupportTiers = supportTiers.filter((_, i) => i !== index);
        setSupportTiers(newSupportTiers);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!image) {
            setSnackbarMessage('Please upload a valid image.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (supportTiers.length < 1 || supportTiers.length > 3) {
            setSnackbarMessage('There must be between 1 and 3 support tiers.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const petitionData = {
            title,
            description,
            categoryId: parseInt(categoryId),
            supportTiers: supportTiers.map(tier => ({ ...tier, cost: parseFloat(tier.cost) }))
        };

        try {
            const { token } = user;
            const response = await axios.post('http://localhost:4941/api/v1/petitions', petitionData, {
                headers: {
                    'X-Authorization': token
                }
            });

            if (response.status === 201) {
                const petitionId = response.data.petitionId;

                const reader = new FileReader();
                reader.onloadend = async () => {
                    const binaryString = reader.result as string;
                    const binaryData = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        binaryData[i] = binaryString.charCodeAt(i);
                    }

                    await axios.put(`http://localhost:4941/api/v1/petitions/${petitionId}/image`, binaryData, {
                        headers: {
                            'X-Authorization': token,
                            'Content-Type': image.type
                        }
                    });
                };
                reader.readAsBinaryString(image);

                setSnackbarMessage('Petition created successfully!');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                setTimeout(() => {
                    navigate('/my-petitions');
                }, 2000);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 400:
                        setSnackbarMessage('Bad Request: Please check your input.');
                        break;
                    case 401:
                        setSnackbarMessage('Unauthorized: Please log in.');
                        break;
                    case 403:
                        setSnackbarMessage('Forbidden: Petition title already exists.');
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

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (['image/png', 'image/jpeg', 'image/gif'].includes(file.type)) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
                setPreviewOpen(true);
            } else {
                setSnackbarMessage('Invalid file type. Please upload a PNG, JPEG, or GIF image.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
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
                        <Grid item xs={12}>
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
                            <FormControl fullWidth required>
                                <InputLabel id="category-label">Category</InputLabel>
                                <Select
                                    labelId="category-label"
                                    id="categoryId"
                                    value={categoryId}
                                    label="Category"
                                    onChange={(e) => setCategoryId(e.target.value as string)}
                                >
                                    {categories.map((category: Category) => (
                                        <MenuItem key={category.categoryId} value={category.categoryId}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {supportTiers.map((tier, index) => (
                            <React.Fragment key={index}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label={`Support Tier ${index + 1} Title`}
                                        value={tier.title}
                                        onChange={(e) => handleTierChange(index, 'title', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        required
                                        fullWidth
                                        type="number"
                                        label={`Support Tier ${index + 1} Cost`}
                                        value={tier.cost ||  "‎"}
                                        onChange={(e) => handleTierChange(index, 'cost', e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        required
                                        fullWidth
                                        label={`Support Tier ${index + 1} Description`}
                                        value={tier.description}
                                        onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                                    />
                                </Grid>
                                {supportTiers.length > 1 && (
                                    <Grid item xs={12}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleRemoveTier(index)}
                                        >
                                            Remove Tier
                                        </Button>
                                    </Grid>
                                )}
                            </React.Fragment>
                        ))}
                        {supportTiers.length < 3 && (
                            <Grid item xs={12}>
                                <Button variant="outlined" onClick={handleAddTier}>
                                    Add Support Tier
                                </Button>
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                            >
                                Upload Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/png, image/jpeg, image/gif"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Grid>
                    </Grid>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Create Petition
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

export default CreatePetition;
