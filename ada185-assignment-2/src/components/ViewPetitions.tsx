import axios from 'axios';
import SinglePetition from './SinglePetition';
import React, { useState, useEffect } from "react";
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

const ViewPetitions = () => {
    const [petitions, setPetitions] = useState<Petition[]>([]);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 8;
    const [pageSize, setPageSize] = useState(8);
    const [supportCost, setSupportCost] = useState<number | null>(null);
    const [numberOfResults, setNumberOfResults] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<string>('CREATED_ASC');
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        axios.get('http://localhost:4941/api/v1/petitions/categories')
            .then((response) => {
                setCategories(response.data);
            }, (error) => {
                // handle error
            });
    }, []);
    useEffect(() => {
        const params: { [key: string]: any } = {
            startIndex: (page - 1) * pageSize,
            count: pageSize,
            sortBy: sortOrder
        };

        if (searchTerm) {
            params.q = searchTerm;

        }
        if (selectedCategories.length > 0) {
            params.categoryIds = selectedCategories;

        }
        if (supportCost !== null) {
            params.supportingCost = supportCost;

        }

        axios.get('http://localhost:4941/api/v1/petitions', { params })
            .then(response => {
                setPetitions(response.data.petitions);
                setNumberOfResults(response.data.count);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, [searchTerm, page, pageSize, selectedCategories, supportCost, sortOrder]);

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);

    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setPage(1);


    };

    const handleCategoryChange = (event: SelectChangeEvent<number[]>) => {
        setSelectedCategories(event.target.value as number[]);
        console.log(selectedCategories)
        setPage(1);


    };

    const handleSupportCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSupportCost(value === '' ? null : parseInt(value, 10));
        setPage(1);

    };

    const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
        setSortOrder(event.target.value as string);
        setPage(1);

    };

    const handlePageSizeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setPageSize(event.target.value as number);
    };

    return (
        <Container>
            <Box my={4}>
                <TextField
                    id="outlined-basic"
                    label="Search Existing Petitions"
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    fullWidth
                />
                <Box mt={2} display="flex" justifyContent="space-between">
                    <FormControl variant="outlined" fullWidth style={{ marginRight: 16 }}>
                        <InputLabel id="category-label">Categories</InputLabel>
                        <Select
                            labelId="category-label"
                            multiple
                            value={selectedCategories}
                            onChange={handleCategoryChange}
                            label="Categories"
                        >
                            {categories.map(category => (
                                <MenuItem key={category.categoryId} value={category.categoryId}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" fullWidth style={{ marginRight: 16 }}>
                        <TextField
                            id="support-cost"
                            label="Max Support Cost"
                            variant="outlined"
                            type="number"
                            value={supportCost !== null ? supportCost : "‎"}
                            onChange={handleSupportCostChange}
                        />
                    </FormControl>

                    <FormControl variant="outlined" fullWidth>
                        <InputLabel id="sort-order-label">Sort By</InputLabel>
                        <Select
                            labelId="sort-order-label"
                            value={sortOrder}
                            onChange={handleSortOrderChange}
                            label="Sort By"
                        >
                            <MenuItem value="ALPHABETICAL_ASC">Alphabetical A-Z</MenuItem>
                            <MenuItem value="ALPHABETICAL_DESC">Alphabetical Z-A</MenuItem>
                            <MenuItem value="COST_ASC">Cost Ascending</MenuItem>
                            <MenuItem value="COST_DESC">Cost Descending</MenuItem>
                            <MenuItem value="CREATED_ASC">Creation Date Ascending</MenuItem>
                            <MenuItem value="CREATED_DESC">Creation Date Descending</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <hr style={{ borderColor: 'grey' }} />
                <Grid container spacing={2}>
                    {petitions.map((petition) => (
                        <Grid item xs={6} sm={3} key={petition.petitionId}>
                            <SinglePetition petition={petition} />
                        </Grid>
                    ))}
                </Grid>
                <Box mt={4}>
                    <Pagination
                        count={Math.ceil(numberOfResults / pageSize)}
                        page={page}
                        onChange={handleChange}
                    />
                </Box>
            </Box>
        </Container>
    );
};

export default ViewPetitions;
