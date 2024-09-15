import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, CardActionArea, Chip, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Pagination from '@mui/material/Pagination';
import { useUserStore } from '../store/userStore';
import SinglePetition from "./SinglePetition";

const ViewPetition = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
    const [errorFlag, setErrorFlag] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [supporters, setSupporters] = useState<Supporter[]>([]);
    const [supportersPage, setSupportersPage] = useState(1);
    const [similarPage, setSimilarPage] = useState(1);
    const [similarPetitions, setSimilarPetitions] = useState<Petition[]>([]);
    const supportersPerPage = 2;
    const user = useUserStore(state => state.user);
    const isLoggedIn = !!user;
    const [open, setOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<SupportTier | null>(null);
    const [supportMessage, setSupportMessage] = useState("");

    useEffect(() => {
        axios.get(`http://localhost:4941/api/v1/petitions/${id}/supporters`)
            .then(response => setSupporters(response.data))
            .catch(error => console.error(error));
    }, [id]);

    useEffect(() => {
        axios.get(`http://localhost:4941/api/v1/petitions/${id}`)
            .then(response => {
                setPetition(response.data);
                setErrorFlag(false);
                setErrorMessage("");
            })
            .catch(error => {
                setErrorFlag(true);
                setErrorMessage(error.toString());
            });
    }, [id]);

    useEffect(() => {
        axios.get('http://localhost:4941/api/v1/petitions/')
            .then(response => {
                const filteredPetitions = response.data.petitions.filter((p: Petition) =>
                    (petition.categoryId === p.categoryId || petition.ownerId === p.ownerId)
                    && petition.petitionId !== p.petitionId);
                setSimilarPetitions(filteredPetitions);
            })
            .catch(error => console.error(error));
    }, [petition]);

    const handleSupportersPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSupportersPage(value);
    };

    const handleSimilarPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setSimilarPage(value);
    };
    const similarPetitionsPerPage = 1;
    const handleSupportClick = (tier: SupportTier) => {
        setSelectedTier(tier);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSupportMessage("");
        setSelectedTier(null);
    };

    const handleConfirmSupport = async () => {
        if (!selectedTier) return;

        try {
            const { token } = user;
            await axios.post(`http://localhost:4941/api/v1/petitions/${id}/supporters`, {
                supportTierId: selectedTier.supportTierId,
                message: supportMessage || "‎"
            }, {
                headers: {
                    'X-Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            setOpen(false);
            setSupportMessage("");
            setSelectedTier(null);
            // Refresh supporters list
            const response = await axios.get(`http://localhost:4941/api/v1/petitions/${id}/supporters`);
            setSupporters(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                switch (error.response.status) {
                    case 400:
                        alert("Bad Request");
                        break;
                    case 401:
                        alert("Unauthorized");
                        break;
                    case 403:
                        alert("Forbidden: Cannot support your own petition or you have already supported at this tier.");
                        break;
                    case 404:
                        alert("Not Found: Petition or support tier does not exist.");
                        break;
                    default:
                        alert("An error occurred. Please try again.");
                }
            } else {
                console.error("There was an error!", error);
            }
        }
    };

    if (errorFlag) {
        return (
            <div>
                <h1>Petition</h1>
                <div style={{ color: "red" }}>
                    {errorMessage}
                </div>
                <Link to="/view-petitions">Go back to Petitions</Link>
            </div>
        );
    } else {
        return (
            <div>
                <h1>{petition.title}</h1>
                <Chip
                    sx={{}}
                    label="Back To Petitions"
                    component="a"
                    href="/view-petitions"
                    variant="outlined"
                    clickable
                />
                {isLoggedIn && (
                    <>
                        <Chip
                            label="My Petitions"
                            component="a"
                            href="/my-petitions"
                            variant="outlined"
                            clickable
                        />
                    </>
                )}
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                        <Card
                            sx={{ maxWidth: 345, height: '100%', margin: 'auto', marginTop: '2rem', backgroundColor: '#f5f5f5', border: "2px solid black", borderRadius:10 }}>
                            <CardContent>
                                <CardMedia sx={{borderRadius: 10, border: "2px solid grey"}}
                                    component="img"
                                    height="200"
                                    image={`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`}
                                    alt={petition.title}

                                />
                                <Typography>
                                    <p>
                                        <Typography variant="body2" color="text.secondary">
                                            Why this petition matters.
                                        </Typography>
                                        {petition.description}
                                    </p>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Minimum Support Cost: ${petition.supportTiers && petition.supportTiers.length > 0 ? Math.min(...petition.supportTiers.map(tier => tier.cost)) : 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Money Raised: ${petition.moneyRaised}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Supporters: {petition.numberOfSupporters}
                                </Typography>
                                <Typography sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                    <Avatar
                                        src={`http://localhost:4941/api/v1/users/${petition.ownerId}/image`}
                                        alt={`${petition.ownerFirstName} ${petition.ownerLastName}`}
                                        sx={{ width: 100, height: 100, border:"2px solid black" }}
                                    />
                                </Typography>
                                <Typography sx={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <h3>
                                        {petition.ownerFirstName} {petition.ownerLastName}
                                    </h3>
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Petition Created: {new Intl.DateTimeFormat(undefined, {
                                    year: 'numeric', month: '2-digit', day: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                }).format(new Date(petition.creationDate))}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Card
                            sx={{ maxWidth: 345, height: '100%', margin: 'auto', marginTop: '2rem', backgroundColor: '#f5f5f5', border: "2px solid black", borderRadius:10 }}>
                            <CardContent>
                                <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                    Support This Petition
                                </Typography>
                                {!isLoggedIn && (
                                    <>
                                        <Chip
                                            label="Log in to support this petition"
                                            component="a"
                                            href="/login"
                                            variant="outlined"
                                            clickable
                                        />
                                    </>
                                )}
                                {petition.supportTiers.map((tier, index) => (
                                    <Card
                                        sx={{ maxWidth: 345, height: '100%', margin: 'auto', marginTop: '2rem', backgroundColor: '#f5f5f5', border: "2px solid grey", borderRadius: 5}} key={tier.supportTierId}>
                                        <CardContent>
                                            <Typography>
                                                Tier {index + 1}: {tier.title}
                                            </Typography>
                                            <Typography>
                                                ${tier.cost}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {tier.description}
                                            </Typography>
                                            {isLoggedIn && petition.ownerId !== user.userId && !supporters.some(s => s.supportTierId === tier.supportTierId && s.supporterId === user.userId) && (
                                                <Button variant="outlined" color="primary" onClick={() => handleSupportClick(tier)}>
                                                    Support
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid
                        justifyContent="center"
                        alignItems="center"
                        item xs={12} sm={3}>

                        <Card
                            sx={{ maxWidth: 345, height: '100%', margin: 'auto', marginTop: '2rem', backgroundColor: '#f5f5f5', border: "2px solid black", borderRadius:10 }}>
                            <CardContent>

                                {petition.numberOfSupporters ?
                                    <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                                    Supporters
                                    </Typography> : <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>Be the first to support</Typography>}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        width: '100%',
                                    }}
                                >
                                    <Pagination
                                        count={Math.ceil(supporters.length / supportersPerPage)}
                                        page={supportersPage}
                                        onChange={handleSupportersPageChange}
                                    />
                                </Box>
                                {supporters.slice((supportersPage - 1) * supportersPerPage, supportersPage * supportersPerPage).map((supporter, index) => (
                                    <Card sx={{ maxWidth: 345, height: '100%', margin: 'auto', marginTop: '2rem', backgroundColor: '#f5f5f5', border: "2px solid black", borderRadius:10 }} key={supporter.supportId}>
                                        <CardContent>
                                            <div>
                                                <h4>
                                                    {supporter.supporterFirstName} {supporter.supporterLastName} supported this petition
                                                </h4>
                                                <Typography variant="body2" color="text.secondary">
                                                    <Chip label={petition.supportTiers.find(tier => tier.supportTierId === supporter.supportTierId)?.title} />
                                                </Typography>
                                                <p>
                                                    {supporter.message}
                                                </p>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Intl.DateTimeFormat(undefined, {
                                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    }).format(new Date(supporter.timestamp))}
                                                </Typography>
                                            </div>
                                            <Typography
                                                sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                                <Avatar
                                                    src={`http://localhost:4941/api/v1/users/${supporter.supporterId}/image`}
                                                    sx={{ width: 40, height: 40 }}
                                                />
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <br/>
                        <br/>
                        <Typography gutterBottom variant="h6" component="div"
                                    sx={{fontSize: '1rem', fontWeight: 'bold'}}>
                            Similar Petitions
                        </Typography>
                        <CardContent>
                            <Grid
                                justifyContent="center"
                                container spacing={2}
                                alignItems="center">
                                <Pagination count={Math.ceil(similarPetitions.length / similarPetitionsPerPage)}
                                            page={similarPage} onChange={handleSimilarPageChange}/>
                                {similarPetitions.slice((similarPage - 1) * similarPetitionsPerPage, similarPage * similarPetitionsPerPage).map((petition) => (
                                    <Box display="flex" justifyContent="center" alignItems="center" width="100%"
                                         height="100%" key={petition.petitionId}>
                                        <Card sx={{
                                            borderRadius: 10,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%'
                                        }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    width: '100%',
                                                }}
                                            >
                                                <SinglePetition petition={petition}/>
                                            </Box>
                                        </Card>
                                    </Box>
                                ))}
                            </Grid>
                        </CardContent>
                    </Grid>
                </Grid>
                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Support Petition</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {selectedTier && `You are supporting the petition at tier "${selectedTier.title}" with a cost of $${selectedTier.cost}.`}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="supportMessage"
                            label="Support Message (optional)"
                            type="text"
                            fullWidth
                            variant="standard"
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmSupport} color="primary">
                            Confirm Support (${selectedTier?.cost})
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default ViewPetition;
