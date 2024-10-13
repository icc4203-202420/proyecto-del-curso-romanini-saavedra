import React from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Toast from 'react-native-toast-message';

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

const SignUpScreen = ({ navigation }) => {
  const handleSignUp = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await fetch('http://192.168.100.3:3000/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Account created successfully');
        navigation.navigate('Login'); // Redirigir a la pantalla de Login después del registro exitoso
        Toast.show({
            type: 'success',
            text1: 'Registro exitoso',
            text2: 'Tu cuenta ha sido creada!',
        });
      } else {
        setErrors({ server: data.error || 'Registration error. Please check the submitted data.' });
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrors({ server: 'Server error. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrarse</Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSignUp}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View>
            <TextInput
              style={styles.input}
              placeholder="First Name"
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              value={values.firstName}
            />
            {touched.firstName && errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              value={values.lastName}
            />
            {touched.lastName && errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
            />
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Handle"
              onChangeText={handleChange('handle')}
              onBlur={handleBlur('handle')}
              value={values.handle}
            />
            {touched.handle && errors.handle && <Text style={styles.errorText}>{errors.handle}</Text>}

            <TextInput
              style={styles.input}
              placeholder="Address Line 1"
              onChangeText={handleChange('line1')}
              onBlur={handleBlur('line1')}
              value={values.line1}
            />

            <TextInput
              style={styles.input}
              placeholder="Address Line 2"
              onChangeText={handleChange('line2')}
              onBlur={handleBlur('line2')}
              value={values.line2}
            />

            <TextInput
              style={styles.input}
              placeholder="City"
              onChangeText={handleChange('city')}
              onBlur={handleBlur('city')}
              value={values.city}
            />

            <TextInput
              style={styles.input}
              placeholder="Country Name"
              onChangeText={handleChange('countryName')}
              onBlur={handleBlur('countryName')}
              value={values.countryName}
            />

            <Button title={isSubmitting ? 'Sending...' : 'Sign up'} onPress={handleSubmit} disabled={isSubmitting} />

            {errors.server && <Text style={styles.errorText}>{errors.server}</Text>}
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default SignUpScreen;
