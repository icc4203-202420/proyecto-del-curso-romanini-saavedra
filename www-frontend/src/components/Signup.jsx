import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required').min(2, 'First name must be at least 2 characters long'),
  lastName: Yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters long'),
  email: Yup.string().email('Invalid email address').required('Email is required').matches(/\.[a-zA-Z]{2,}$/, 'Email must end with a dot followed by two characters or more'),
  password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters long'),
  handle: Yup.string().required('Handle is required').min(3, 'Handle must be at least 3 characters long'),
  line1: Yup.string(),  // Optional
  line2: Yup.string(),  // Optional
  city: Yup.string(),   // Optional
  countryName: Yup.string()  // Optional
});

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  handle: '',
  line1: '',
  line2: '',
  city: '',
  countryName: ''
};

const SignupForm = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await axios.post('http://127.0.0.1:3001/api/v1/signup', {
        user: {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          password: values.password,
          handle: values.handle,
        },
        address: {
          line1: values.line1,
          line2: values.line2,
          city: values.city,
          country_name: values.countryName 
        }
      });
      //console.log('User created:', response.data);
      navigate('/login');
    } catch (error) {
        if (error.response && error.response.status === 422) {
          setErrors({ 
            server: error.response.data.error || 'Registration error. Please check the submitted data.'
          });
        } else {
          setErrors({ 
            server: 'Server error. Please try again later.'
          });
        }
        console.error('Error during registration:', error);
      } finally {
        setSubmitting(false);
      }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          mt: 8,
        }}
      >
        <Typography component="h1" variant="h5">
          Registrarse
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form style={{ width: '100%' }}>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="First Name"
                  name="firstName"
                  error={touched.firstName && Boolean(errors.firstName)}
                  helperText={touched.firstName && errors.firstName}
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Last Name"
                  name="lastName"
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Email"
                  name="email"
                  type="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Password"
                  name="password"
                  type="password"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Handle"
                  name="handle"
                  error={touched.handle && Boolean(errors.handle)}
                  helperText={touched.handle && errors.handle}
                  margin="normal"
                />
              </Box>
              {/* Campos de dirección opcionales */}
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Address Line 1"
                  name="line1"
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Address Line 2"
                  name="line2"
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="City"
                  name="city"
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Field
                  as={TextField}
                  fullWidth
                  variant="outlined"
                  label="Country Name"
                  name="countryName"
                  margin="normal"
                />
              </Box>
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Sign up'}
                </Button>
              </Box>
              {errors.server && (
                <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
                  {errors.server}
                </Typography>
              )}
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default SignupForm;
