import React from 'react';
import { signUp } from 'aws-amplify/auth'; // Import Auth from aws-amplify
import '../styles/OrganizerLogin.css'; // Custom styles
import { Authenticator } from '@aws-amplify/ui-react';

function OrganizerRegister() {
  const handleCustomSignUp = async (formData) => {
    const { username, password, attributes } = formData;

    try {
      // Add custom:role attribute to the sign-up request
      await signUp({
        username,
        password,
        attributes: {
          ...attributes,
          'custom:role': 'organizer', // Assign organizer role
        },
      });
      alert('Account created successfully! Please verify your email and log in.');
      window.location.href = '/organizer-login'; // Redirect to login page
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="organizer-register">
      <h1>Organizer Registration</h1>
      <Authenticator
        initialState="signUp"
        components={{
          SignUp: {
            formFields: {
              username: {
                placeholder: 'Email Address',
                isRequired: true, // Make it required
              },
              name: {
                placeholder: 'Full Name',
                isRequired: true, // Make it required
              },
              phone_number: {
                placeholder: 'Phone Number',
                isRequired: true, // Make it required
              },
              password: {
                placeholder: 'Password',
                isRequired: true, // Make it required
              },
            },
            submitButton: {
              children: 'Register as Organizer',
            },
          },
          // Optionally, you can customize the 'Confirm Sign Up' step to show a verification code input.
          ConfirmSignUp: {
            formFields: {
              code: {
                placeholder: 'Verification Code',
              },
            },
            submitButton: {
              children: 'Verify Account',
            },
          },
        }}
        services={{
          signUp: handleCustomSignUp, // Custom handler for sign-up
        }}
        // Optional: Custom theme to make the form look better
        theme={{
          button: {
            backgroundColor: '#FF6347', // Custom button color
            borderRadius: '8px',
          },
          formField: {
            borderRadius: '4px',
            marginBottom: '10px',
          },
          input: {
            padding: '12px',
            borderRadius: '4px',
          },
        }}
      />
    </div>
  );
}

export default OrganizerRegister;
