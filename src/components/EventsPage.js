import React from 'react';
import { Button } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { Heading, View } from '@aws-amplify/ui-react';
import '../styles/Events.css';
import { Link } from 'react-router-dom';

import event1Image from '../assets/images/event1.jpg';
import event2Image from '../assets/images/event2.jpg';
import event3Image from '../assets/images/event3.jpg';
import event4Image from '../assets/images/event4.jpg';
import event5Image from '../assets/images/event5.jpg';

const events = [
  { id: 1, title: 'Tech Innovators Conference 2024', description: 'Explore the latest trends in technology with leading innovators and entrepreneurs.', city: 'New York', date: 'Sat 16 - Sun 17', image: event1Image, address: '123 Innovation St, Manhattan, NY 10001' },
  { id: 2, title: 'LA Food & Wine Festival', description: 'A culinary celebration featuring top chefs, exquisite wines, and live music.', city: 'Los Angeles', date: 'Sun 18 - Mon 19', image: event2Image, address: '456 Gourmet Ave, Los Angeles, CA 90012' },
  { id: 3, title: 'Chicago Marathon 2024', description: 'Join thousands of runners in one of the world’s most scenic marathon routes.', city: 'Chicago', date: 'Mon 20 - Tue 21', image: event3Image, address: '789 Runner Blvd, Chicago, IL 60604' },
  { id: 4, title: 'Houston Space Expo', description: 'Discover the future of space exploration with NASA experts and interactive exhibits.', city: 'Houston', date: 'Tue 22 - Wed 23', image: event4Image, address: '101 Cosmic Drive, Houston, TX 77058' },
  { id: 5, title: 'New York Jazz Festival', description: 'Celebrate the best of jazz with performances by world-renowned artists.', city: 'New York', date: 'Wed 24 - Thu 25', image: event5Image, address: '202 Melody Park, Brooklyn, NY 11201' },
];

function EventsPage() {
  const navigate = useNavigate();

  const handleSignIn = () => {
    sessionStorage.setItem('tempRole', 'user');
    navigate('/landing'); // Redirect for user sign-in
  };

  const handleOrganizerSignIn = () => {
    sessionStorage.setItem('tempRole', 'organizer');
    navigate('/organizer-landing'); // Redirect for organizer sign-in
  };

  return (
    <div className="events-page">
      <header className="events-header">
        <View
          padding="0 20px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Heading level={1} fontSize="2rem" color="var(--amplify-colors-font-primary)">
            Event Time
          </Heading>
          <div>
          <Button 
  onClick={handleSignIn} 
  variation="primary" 
  size="small" 
  className="custom-signin-button"
>
User  Sign In
</Button>
 <Button 
  onClick={handleOrganizerSignIn} 
  variation="primary" 
  size="small" 
  className="custom-signin-button"
>
Organizer Sign In
</Button>

          </div>
        </View>
      </header>

      <div className="container">
        <div className="hero-image"></div>
        <div className="events-content">
          <div className="ongoing-event">Ongoing Events</div>
          <div className="event-box-container" style={{ display: 'grid', gap: '20px' }}>
            {events.map((event) => (
              <Link
                to={`/event/${event.id}`}
                key={event.id}
                className="event-box-link"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="event-box"
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#fff',
                  }}
                >
                  <p style={{ fontSize: '0.8rem', marginBottom: '5px', color: '#777' }}>{event.date}</p>
                  <p
                    style={{
                      fontWeight: 'Bold',
                      fontSize: '1.2rem',
                      color: '#4fc3f7',
                      marginTop: '10px',
                    }}
                  >
                    {event.title}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#333', marginTop: '10px' }}>
                    {event.address}, {event.city}
                  </p>
                  <hr style={{ margin: '10px 0', borderColor: '#ddd' }} />
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '5px',
                    }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
        <footer className="footer">
          <p>&copy; 2024 Seat Pakad. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default EventsPage;
