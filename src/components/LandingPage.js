import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/GlobalStyles.css'; // Import the global styles instead of specific landing page styles

// Import images
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


function LandingPage() {

  console.log("Hiiiiiiiiiii")
  const [selectedCity, setSelectedCity] = useState('');

  // Filter events based on selected city
  const filteredEvents = selectedCity
    ? events.filter((event) => event.city === selectedCity)
    : events;

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  return (
    <div className="container">
      {/* Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        <Link to="#" className="filter-link">This Week</Link>
        <Link to="#" className="filter-link">This Month</Link>
        <select className="city-dropdown" value={selectedCity} onChange={handleCityChange} style={{ padding: '5px', fontSize: '1rem' }}>
          <option value="">Filter by City</option>
          <option value="New York">New York</option>
          <option value="Los Angeles">Los Angeles</option>
          <option value="Chicago">Chicago</option>
          <option value="Houston">Houston</option>
        </select>
      </div>

      {/* Event Boxes */}
      <div className="event-box-container" style={{ display: 'grid',  gap: '20px' }}>
        {filteredEvents.map((event) => (
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
  );
}

export default LandingPage;
