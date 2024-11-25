import React from 'react';
import { Button, Flex, Heading, View } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

function Header({ user, signOut }) {
  return (
    <View as="header" padding="1rem" backgroundColor="var(--amplify-colors-neutral-10)">
      <Flex justifyContent="space-between" alignItems="center">
        {/* App Logo or Title */}
        <Heading level={3} margin="0">
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--amplify-colors-font-primary)' }}>
          Tikkti
          </Link>
        </Heading>

        {/* Navigation Links (Profile and Sign Out) */}
        <Flex gap="1rem" alignItems="center">
          {user ? (
            <>

<Link 
                to="/landing" 
                style={{ 
                  textDecoration: 'none', 
                  color: 'var(--amplify-colors-font-primary)', 
                  fontSize: '1rem', 
                  padding: '8px 20px', 
                  borderRadius: '5px', 
                  display: 'inline-block', 
                  backgroundColor: 'var(--amplify-colors-background-secondary)',
                  border: '1px solid var(--amplify-colors-border)', 
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease, transform 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--amplify-colors-background-tertiary)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--amplify-colors-background-secondary)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Events
              </Link>


              {/* Profile link styled as a button */}
              <Link 
                to="/profile" 
                style={{ 
                  textDecoration: 'none', 
                  color: 'var(--amplify-colors-font-primary)', 
                  fontSize: '1rem', 
                  padding: '8px 20px', 
                  borderRadius: '5px', 
                  display: 'inline-block', 
                  backgroundColor: 'var(--amplify-colors-background-secondary)',
                  border: '1px solid var(--amplify-colors-border)', 
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease, transform 0.2s ease',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--amplify-colors-background-tertiary)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--amplify-colors-background-secondary)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Profile
              </Link>

              {/* Sign Out Button with Amplify theme */}
              <Button 
                onClick={signOut} 
                variation="primary" 
                size="small" 
                style={{ 
                  fontSize: '1rem', 
                  padding: '8px 20px', 
                  borderRadius: '5px',
                  backgroundColor: 'var(--amplify-colors-button-primary)',
                  color: 'var(--amplify-colors-font-primary)',
                  fontWeight: '500',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'background-color 0.3s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--amplify-colors-button-primary-hover)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--amplify-colors-button-primary)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link 
              to="/sign-in" 
              style={{ 
                textDecoration: 'none', 
                color: 'var(--amplify-colors-font-primary)', 
                fontSize: '1rem', 
                fontWeight: '500',
                padding: '8px 20px', 
                borderRadius: '5px',
                display: 'inline-block',
                backgroundColor: 'var(--amplify-colors-background-secondary)',
                border: '1px solid var(--amplify-colors-border)', 
                transition: 'background-color 0.3s ease, transform 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--amplify-colors-background-tertiary)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--amplify-colors-background-secondary)'}
            >
              Sign In
            </Link>
          )}
        </Flex>
      </Flex>
    </View>
  );
}

export default Header;
