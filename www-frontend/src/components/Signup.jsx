// src/components/Signup.jsx
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { TextField, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        handle: '',
        },
        validationSchema: Yup.object({
        firstName: Yup.string().required('Required'),
        lastName: Yup.string().required('Required'),
        email: Yup.string().email('Invalid email address').required('Required'),
        password: Yup.string().required('Required'),
        handle: Yup.string().required('Required'),
        }),
        onSubmit: (values) => {
        axios.post('http://127.0.0.1:3001/api/v1/signup', {
            user: {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            password: values.password,
            handle: values.handle,
            },
        })
        .then(response => {
            console.log('User created:', response.data);
            navigate('/')
        })
        .catch(error => {
            console.error('Error during signup:', error);
            // Mostrar mensaje de error
        });
        },
    });

    return (
        <div>
        <Typography variant="h4">Sign Up</Typography>
        <form onSubmit={formik.handleSubmit}>
            <TextField
            label="First Name"
            name="firstName"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
            fullWidth
            />
            <TextField
            label="Last Name"
            name="lastName"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
            fullWidth
            />
            <TextField
            label="Email"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            fullWidth
            />
            <TextField
            label="Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            fullWidth
            />
            <TextField
            label="Handle"
            name="handle"
            type="handle"
            value={formik.values.handle}
            onChange={formik.handleChange}
            error={formik.touched.handle && Boolean(formik.errors.handle)}
            helperText={formik.touched.handle && formik.errors.handle}
            fullWidth
            />
            <Button type="submit" variant="contained" color="primary">
            Sign Up
            </Button>
        </form>
        </div>
    );
};

export default SignupForm;
