import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text, Card, Snackbar } from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { apiService } from "../../api/apiService";

// NOTE: Assuming '../../context/AuthContext' contains the necessary login logic
// which will handle storing the returned user details (like token/user object)
// using AsyncStorage (the standard persistence method in React Native).
import { useAuth } from "../../context/AuthContext";

// --- API Configuration ---
const LOGIN_API_URL =
  "https://scm-production-8ceb.up.railway.app/api/users/login";

const loginSchema = Yup.object().shape({
  // CHANGED: 'email' field is now 'username'
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  // NEW FIELDS ADDED:
  type: Yup.string()
    .oneOf(
      ["STUDENT", "ADMIN", "TEACHER"],
      "Invalid user type. Must be ADMIN, TEACHER, or STUDENT."
    )
    .required("User type is required"),
  accountId: Yup.string()
    .required("Account ID is required")
    .matches(/^[0-9]+$/, "Account ID must be a number"),
});

export const LoginScreen: React.FC = () => {
  // CORRECTED: Removed 'setUser' which is not exposed by AuthContext
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  /**
   * Handles the login process by making an API call to authenticate the user.
   * On success, it calls the context's 'login' function to store the user details.
   */
  const handleLogin = async (values: {
    username: string;
    password: string;
    type: string;
    accountId: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Mapped 'username' to 'userName' for the API payload
        body: JSON.stringify({
          userName: values.username, // API expects 'userName'
          password: values.password,
          type: values.type,
          accountId: values.accountId,
        }),
      });

      // 1. Always read the JSON body. Error details are often here, even on non-200 responses.
      const data = await response.json();
      console.log("Login API response data:", data);

      // 2. Check for HTTP success AND API specific success status
      // Use `response.ok` (true for 2xx) or check `response.status` —
      // `response.statusCode` is not a property on the Fetch Response object.
      if (response.ok && data.status === "SUCCESS") {
        // Login Success: Pass the complete response data to the context's login function.
        await login(data);
      } else {
        // 3. Handle failure: Use HTTP status or API-provided message if available.
        const apiMessage = data?.message || data?.error;
        const statusText = response.status ? ` (HTTP ${response.status})` : "";
        throw new Error(
          (apiMessage && `${apiMessage}${statusText}`) ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      // Catch network errors or the error thrown above
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setShowSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                initialValues={{
                  username: "admin@school.com",
                  password: "password123",
                  type: "ADMIN", // Default type
                  accountId: "1", // Default account ID
                }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <View>
                    {/* CHANGED: TextInput now uses 'username' */}
                    <TextInput
                      label="Username"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      error={touched.username && !!errors.username}
                      autoCapitalize="none"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.username && errors.username && (
                      <Text style={styles.errorText}>{errors.username}</Text>
                    )}

                    <TextInput
                      label="Password"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      error={touched.password && !!errors.password}
                      secureTextEntry
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}

                    {/* NEW ACCOUNT ID INPUT */}
                    <TextInput
                      label="Account ID"
                      value={values.accountId}
                      onChangeText={handleChange("accountId")}
                      onBlur={handleBlur("accountId")}
                      error={touched.accountId && !!errors.accountId}
                      keyboardType="numeric"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.accountId && errors.accountId && (
                      <Text style={styles.errorText}>{errors.accountId}</Text>
                    )}

                    {/* NEW USER TYPE INPUT */}
                    <TextInput
                      label="User Type (ADMIN, TEACHER, STUDENT)"
                      value={values.type}
                      onChangeText={handleChange("type")}
                      onBlur={handleBlur("type")}
                      error={touched.type && !!errors.type}
                      autoCapitalize="characters"
                      style={styles.input}
                      mode="outlined"
                    />
                    {touched.type && errors.type && (
                      <Text style={styles.errorText}>{errors.type}</Text>
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
                {/* CHANGED: Demo text to reflect 'Username' */}
                <Text variant="bodySmall" style={styles.demoText}>
                  Username (Admin): admin@school.com / Type: ADMIN / ID: 1
                </Text>
                <Text variant="bodySmall" style={styles.demoText}>
                  Username (Teacher): teacher@school.com / Type: TEACHER / ID:
                  10
                </Text>
                <Text variant="bodySmall" style={styles.demoText}>
                  Username (Student): student@school.com / Type: STUDENT / ID:
                  100
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
          duration={4000} // Increased duration to 4s for better readability
          action={{
            label: "Close",
            onPress: () => setShowSnackbar(false),
          }}
          style={styles.snackbar}
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
    backgroundColor: "#e0f7fa", // Light blue background for a cleaner look
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center", // Center content vertically
  },
  content: {
    padding: 24,
  },
  title: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "bold",
    color: "#00796b", // Dark teal color
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    color: "#4db6ac", // Lighter teal color
  },
  card: {
    elevation: 8, // More prominent shadow
    borderRadius: 12,
  },
  input: {
    marginBottom: 16, // Increased spacing
  },
  errorText: {
    color: "#d32f2f", // Standard error red
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 12,
  },
  button: {
    marginTop: 16,
    paddingVertical: 4,
    backgroundColor: "#009688", // Primary teal color
    borderRadius: 8,
  },
  demoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f1f8e9", // Very light green background
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#8bc34a",
  },
  demoTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#388e3c", // Dark green text
  },
  demoText: {
    color: "#666",
    marginBottom: 2,
  },
  snackbar: {
    backgroundColor: "#d32f2f", // Red background for error visibility
  },
});
