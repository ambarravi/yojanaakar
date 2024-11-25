import React from 'react';
import { Button } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { Heading, View } from '@aws-amplify/ui-react'; // Import Amplify UI components
import '../styles/Events.css'; // Import your custom CSS file for additional styling
import { Link } from 'react-router-dom';

import event1Image from '../assets/images/event1.jpg';
import event2Image from '../assets/images/event2.jpg';
import event3Image from '../assets/images/event3.jpg';
import event4Image from '../assets/images/event4.jpg';
import event5Image from '../assets/images/event5.jpg';

// Mock event data
const events = [
    { 
      id: 1, 
      title: 'Tech Innovators Conference 2024', 
      description: 'Explore the latest trends in technology with leading innovators and entrepreneurs.', 
      city: 'New York', 
      date: 'Sat 16 - Sun 17', 
      image: event1Image, 
      address: '123 Innovation St, Manhattan, NY 10001' 
    },
    { 
      id: 2, 
      title: 'LA Food & Wine Festival', 
      description: 'A culinary celebration featuring top chefs, exquisite wines, and live music.', 
      city: 'Los Angeles', 
      date: 'Sun 18 - Mon 19', 
      image: event2Image, 
      address: '456 Gourmet Ave, Los Angeles, CA 90012' 
    },
    { 
      id: 3, 
      title: 'Chicago Marathon 2024', 
      description: 'Join thousands of runners in one of the world’s most scenic marathon routes.', 
      city: 'Chicago', 
      date: 'Mon 20 - Tue 21', 
      image: event3Image, 
      address: '789 Runner Blvd, Chicago, IL 60604' 
    },
    { 
      id: 4, 
      title: 'Houston Space Expo', 
      description: 'Discover the future of space exploration with NASA experts and interactive exhibits.', 
      city: 'Houston', 
      date: 'Tue 22 - Wed 23', 
      image: event4Image, 
      address: '101 Cosmic Drive, Houston, TX 77058' 
    },
    { 
      id: 5, 
      title: 'New York Jazz Festival', 
      description: 'Celebrate the best of jazz with performances by world-renowned artists.', 
      city: 'New York', 
      date: 'Wed 24 - Thu 25', 
      image: event5Image, 
      address: '202 Melody Park, Brooklyn, NY 11201' 
    },
  ];
  

function EventsPage() {
  const navigate = useNavigate();

  console.log(process.env.REACT_APP_COGNITO_REDIRECT_SIGN_IN)
  console.log(process.env.REACT_APP_COGNITO_REDIRECT_SIGN_OUT)
  console.log(process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID)
  console.log(process.env.REACT_APP_COGNITO_OAUTH_DOMAIN)
  console.log(process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID)
  
  const handleSignIn = () => {
      navigate('/landing');
  };






  return (
    <div className="events-page">
    {/* Header section with Amplify styled header */}
    <header className="events-header">
    <View 
        padding="0 20px" 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        width="100%"  // Ensures full width is utilized
    >
        <Heading level={1} fontSize="2rem" color="var(--amplify-colors-font-primary)">
            Event Time
        </Heading>
        <Button 
            onClick={handleSignIn} 
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
            }}// Ensures the button aligns to the right
        >
            Sign In
        </Button>
    </View>
</header>

          {/* Main container for consistent padding */}
          <div className="container">

              {/* Hero image */}
              <div className="hero-image"></div>
          
              {/* Main content */}
              <div className="events-content">
              <div class="ongoing-event">
    Ongoing Events
</div>
                {/* Event Boxes Section */}
                <div className="event-box-container" style={{ display: 'grid',  gap: '20px' }}>
                   
                {events.map((event) => (
          <Link to={`/event/${event.id}`} key={event.id} className="event-box-link" style={{ textDecoration: 'none' }}>
            <div className="event-box" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff' }}>
              {/* Date */}
              <p style={{ fontSize: '0.8rem', marginBottom: '5px', color: '#777' }}>{event.date}</p>
              
              {/* Title */}
              
              <p style={{ fontWeight: 'Bold', fontSize: '1.2rem', color: '#4fc3f7', marginTop: '10px' }}>{event.title}</p>

              {/* Horizontal Line */}
            
                   {/* Address and City */}
                   <p style={{ fontSize: '0.9rem', color: '#333', marginTop: '10px' }}>
                {event.address}, {event.city}
              </p>
              <hr style={{ margin: '10px 0', borderColor: '#ddd' }} />

              {/* Image */}
              <img
                src={event.image}
                alt={event.title}
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '5px' }}
              />

         
            </div>
          </Link>
        ))}


                </div>
              </div>

              {/* Footer section */}
              <footer className="footer">
                  <p>&copy; 2024 Seat Pakad. All rights reserved.</p>
              </footer>
          </div>
      </div>
  );
}

export default EventsPage;
