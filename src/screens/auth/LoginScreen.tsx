import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError('');
    try {
      await login(values.email, values.password);
    } catch (err) {
      setError('Invalid email or password');
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            School Management
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            Sign in to continue
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              <Formik
                initialValues={{ email: 'admin@school.com', password: 'password123' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                  <View>
                    <TextInput
                      label="Email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={touched.email && !!errors.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}

                    <TextInput
                      label="Password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={touched.password && !!errors.password}
                      secureTextEntry
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}

                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={loading}
                      disabled={loading}
                      style={styles.button}
                    >
                      Sign In
                    </Button>
                  </View>
                )}
              </Formik>

              <View style={styles.demoContainer}>
                <Text variant="titleSmall" style={styles.demoTitle}>
                  Demo Accounts:
                </Text>
                <Text variant="bodySmall" style={styles.demoText}>
                  Admin: admin@school.com
                </Text>
                <Text variant="bodySmall" style={styles.demoText}>
                  Teacher: teacher@school.com
                </Text>
                <Text variant="bodySmall" style={styles.demoText}>
                  Student: student@school.com
                </Text>
                <Text variant="bodySmall" style={styles.demoText}>
                  Password: password123
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          duration={3000}
        >
          {error}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    elevation: 4,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  demoContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  demoTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  demoText: {
    color: '#666',
    marginBottom: 2,
  },
});
