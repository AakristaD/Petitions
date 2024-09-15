import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import {CardActionArea, Chip} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import {Link} from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';


type SinglePetitionProps = {
    petition: Petition;
};

const SinglePetition: React.FC<SinglePetitionProps> = ({ petition }) => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then((response) => {
                setCategories(response.data);
            }, (error) => {
                // handle error
            });
    }, []);


    return (
        <Link to={`/view-petition/${petition.petitionId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card sx={{border: '2px solid black', borderRadius: 10}} variant="outlined">
                <CardActionArea>

                    <CardMedia sx={{borderBottom: '2px solid black'}}
                        component="img"
                        height="200"
                        image={`http://localhost:4941/api/v1/petitions/${petition.petitionId}/image`}
                        alt={petition.title}
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h6" component="div" sx={{ fontSize: '1rem' , fontWeight: 'bold'}}>
                            {petition.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <Chip label={categories.find(category => category.categoryId === petition.categoryId)?.name}/>
                        </Typography>
                        <br/>
                        <Typography variant="body1" color="text.secondary">
                            Supporters: {petition.numberOfSupporters}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Show Support For Only: ${petition.supportingCost}
                        </Typography>
                        <hr style={{borderColor: 'grey'}}/>
                        <Typography sx={{display: 'flex', justifyContent: 'center'}}>
                            <Avatar
                                src={`http://localhost:4941/api/v1/users/${petition.ownerId}/image`}
                                alt={`${petition.ownerFirstName} ${petition.ownerLastName}`}
                                sx={{width: 45, height: 45}}
                            />
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                            {petition.ownerFirstName} {petition.ownerLastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {new Intl.DateTimeFormat(undefined, { year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit' }).format(new Date(petition.creationDate))}
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Link>
    );
};

export default SinglePetition;