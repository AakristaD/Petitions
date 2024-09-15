import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import ViewPetitions from "./components/ViewPetitions";
import NotFound from "./components/NotFound";
import ResponsiveAppBar from "./components/ResponsiveAppBar";
import ViewPetition from "./components/ViewPetition";
import LogIn from "./components/LogIn";
import Register from "./components/Register";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Profile from "./components/Profile";
import MyPetitions from "./components/MyPetitions";
import CreatePetition from "./components/CreatePetition";
import EditUser from "./components/EditUser";
import EditPetition from "./components/Edit.Petition";

function App() {
    const [open, setOpen] = useState(false); // Set to false initially

    return (
        <div className="App">
            <Router>
                <ResponsiveAppBar/>
                <div>
                    <Routes>
                        <Route path="/view-petitions" element={<ViewPetitions />} />
                        <Route path="/view-petition/:id" Component={ViewPetition} />
                        <Route path="/login" element={<LogIn />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/my-petitions" element={<MyPetitions />} />
                        <Route path="/start-petition" element={<CreatePetition />} />
                        <Route path="/edit-user" element={<EditUser />} />
                        <Route path="/edit-petition/:id" element={<EditPetition />} />
                        <Route path="*" element={<ViewPetitions/>} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

export default App;