# Frontend Integration Guide

## Connecting Frontend to the Backend API

The frontend HTML application from the previous deliverable needs to be updated to connect to this backend API instead of using localStorage.

## Quick Integration Steps

### Step 1: Update API Configuration

At the top of your frontend JavaScript, add:

```javascript
// API Configuration
const API_BASE_URL = 'https://localhost:5001/api';  // Update for production

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
```

### Step 2: Update Registration Function

Replace the existing registration with:

```javascript
async function handleSignup(e) {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    const membershipType = document.getElementById('membershipType').value;
    if (!membershipType) {
        alert('Please select a membership type!');
        return;
    }

    try {
        const familyMembers = document.getElementById('familyMembers').value
            .split('\n')
            .filter(name => name.trim())
            .map(name => ({
                firstName: name.trim().split(' ')[0],
                lastName: name.trim().split(' ').slice(1).join(' ')
            }));

        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: password,
                phoneNumber: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zip').value,
                profession: document.getElementById('profession').value,
                hobbies: document.getElementById('hobbies').value,
                bio: document.getElementById('bio').value,
                membershipTypeId: parseInt(membershipType),
                familyMembers: familyMembers.length > 0 ? familyMembers : null
            })
        });

        if (response.success) {
            localStorage.setItem('authToken', response.data.token);
            currentUser = response.data.user;
            
            alert('Registration successful! Welcome to CASEC!');
            loginUser();
            showPage('payment');
        }
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}
```

### Step 3: Update Login Function

```javascript
async function handleLogin(e) {
    e.preventDefault();

    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        });

        if (response.success) {
            localStorage.setItem('authToken', response.data.token);
            currentUser = response.data.user;
            
            loginUser();
            showPage('dashboard');
        }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
}
```

### Step 4: Load Membership Types Dynamically

```javascript
async function loadMembershipTypes() {
    try {
        const response = await apiCall('/membershiptypes');
        
        if (response.success) {
            const container = document.querySelector('.membership-types');
            container.innerHTML = '';
            
            response.data.forEach(type => {
                const card = document.createElement('div');
                card.className = 'membership-card';
                card.onclick = () => selectMembership(type.membershipTypeId);
                
                card.innerHTML = `
                    <div class="membership-icon">${type.icon || '👤'}</div>
                    <div class="membership-name">${type.name}</div>
                    <div class="membership-price">$${type.annualFee}/year</div>
                    <p class="text-muted">${type.description}</p>
                    <ul class="membership-features">
                        <li>Full platform access</li>
                        <li>Join all clubs</li>
                        <li>Event registration</li>
                        ${type.maxFamilyMembers > 1 ? `<li>Up to ${type.maxFamilyMembers} family members</li>` : ''}
                        ${type.hasBoardVotingRights ? '<li>Board voting rights</li>' : ''}
                        ${type.canManageClubs ? '<li>Create & manage clubs</li>' : ''}
                        ${type.canManageEvents ? '<li>Event organization</li>' : ''}
                    </ul>
                `;
                
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Failed to load membership types:', error);
    }
}
```

### Step 5: Load Clubs Dynamically

```javascript
async function loadClubs() {
    try {
        const response = await apiCall('/clubs');
        
        if (response.success) {
            const container = document.getElementById('clubsList');
            container.innerHTML = '';
            
            response.data.forEach(club => {
                const card = document.createElement('div');
                card.className = 'card club-card';
                
                card.innerHTML = `
                    <div class="club-icon">${club.icon || '📚'}</div>
                    <div class="club-info">
                        <h3>${club.name}</h3>
                        <p class="text-muted">${club.description || ''}</p>
                        <div class="club-meta">
                            <span>👥 ${club.memberCount} members</span>
                            ${club.meetingFrequency ? `<span>📅 ${club.meetingFrequency}</span>` : ''}
                        </div>
                        <button class="btn ${club.isUserMember ? 'btn-secondary' : 'btn-primary'} mt-2" 
                                onclick="toggleClubMembership(${club.clubId}, ${club.isUserMember})"
                                ${club.isUserMember ? '' : ''}>
                            ${club.isUserMember ? '✓ Joined' : 'Join Club'}
                        </button>
                    </div>
                `;
                
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Failed to load clubs:', error);
    }
}
```

### Step 6: Join/Leave Club Functions

```javascript
async function toggleClubMembership(clubId, isMember) {
    try {
        const endpoint = isMember ? `/clubs/${clubId}/leave` : `/clubs/${clubId}/join`;
        const response = await apiCall(endpoint, { method: 'POST' });
        
        if (response.success) {
            alert(response.message);
            loadClubs(); // Reload clubs to update UI
            updateDashboard();
        }
    } catch (error) {
        alert('Action failed: ' + error.message);
    }
}
```

### Step 7: Load Events

```javascript
async function loadEvents() {
    try {
        const response = await apiCall('/events');
        
        if (response.success) {
            const container = document.getElementById('eventsList');
            container.innerHTML = '';
            
            response.data.forEach(event => {
                const eventDate = new Date(event.eventDate);
                const card = document.createElement('div');
                card.className = 'card event-card';
                
                card.innerHTML = `
                    <div class="event-header">
                        <div class="event-details">
                            <h3>${event.title}</h3>
                            <p class="text-muted">${event.description || ''}</p>
                        </div>
                        <div class="event-date">
                            <div class="event-day">${eventDate.getDate()}</div>
                            <div class="event-month">${eventDate.toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                        </div>
                    </div>
                    <div class="event-info">
                        ${event.location ? `<span>📍 ${event.location}</span>` : ''}
                        <span>🕐 ${eventDate.toLocaleTimeString()}</span>
                        <span>👥 ${event.spotsRemaining} spots left</span>
                    </div>
                    <div class="event-footer">
                        <div class="event-price">$${event.eventFee}</div>
                        <button class="btn ${event.isUserRegistered ? 'btn-secondary' : 'btn-accent'}" 
                                onclick="toggleEventRegistration(${event.eventId}, ${event.isUserRegistered})"
                                ${event.isUserRegistered ? 'disabled' : ''}>
                            ${event.isUserRegistered ? '✓ Registered' : 'Register'}
                        </button>
                    </div>
                `;
                
                container.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Failed to load events:', error);
    }
}
```

### Step 8: Register for Events

```javascript
async function toggleEventRegistration(eventId, isRegistered) {
    if (isRegistered) return;
    
    try {
        const response = await apiCall(`/events/${eventId}/register`, {
            method: 'POST',
            body: JSON.stringify({
                eventId: eventId,
                numberOfGuests: 0
            })
        });
        
        if (response.success) {
            alert('Successfully registered for event!');
            loadEvents();
            updateDashboard();
        }
    } catch (error) {
        alert('Registration failed: ' + error.message);
    }
}
```

### Step 9: Update Dashboard

```javascript
async function updateDashboard() {
    try {
        const response = await apiCall('/users/dashboard');
        
        if (response.success) {
            const dashboard = response.data;
            
            document.getElementById('dashMembershipType').textContent = 
                dashboard.user.membershipTypeName;
            document.getElementById('dashClubCount').textContent = dashboard.clubCount;
            document.getElementById('dashEventCount').textContent = dashboard.eventCount;
            
            // Update recent activities if available
            if (dashboard.recentActivities && dashboard.recentActivities.length > 0) {
                const activityContainer = document.getElementById('recentActivity');
                activityContainer.innerHTML = dashboard.recentActivities
                    .map(activity => `
                        <div class="activity-item">
                            <strong>${activity.activityType}</strong>: ${activity.description}
                            <span class="text-muted">${new Date(activity.createdAt).toLocaleDateString()}</span>
                        </div>
                    `).join('');
            }
        }
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}
```

### Step 10: Initialize on Page Load

```javascript
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    
    if (token) {
        try {
            // Verify token is valid by loading profile
            const response = await apiCall('/users/profile');
            if (response.success) {
                currentUser = response.data;
                loginUser();
                showPage('dashboard');
            } else {
                localStorage.removeItem('authToken');
                showPage('signup');
            }
        } catch (error) {
            localStorage.removeItem('authToken');
            showPage('signup');
        }
    } else {
        showPage('signup');
    }
    
    // Load initial data
    await loadMembershipTypes();
    
    // Setup navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});
```

## CORS Configuration

Make sure your API's CORS is configured to allow your frontend origin. The API already has CORS enabled for all origins in development. For production, update `Program.cs`:

```csharp
options.AddPolicy("Production", policy =>
{
    policy.WithOrigins("https://yourdomain.com")
          .AllowAnyMethod()
          .AllowAnyHeader()
          .AllowCredentials();
});
```

## Testing the Integration

1. Start the API: `dotnet run` (in CasecApi folder)
2. Open frontend HTML in browser
3. Try registering a new user
4. Login with credentials
5. Browse clubs and events
6. Join a club
7. Register for an event

## Production Deployment

### Frontend Deployment Options:
- **Azure Static Web Apps** - Easy deployment with CI/CD
- **Netlify** - Simple drag-and-drop deployment
- **AWS S3 + CloudFront** - Scalable CDN hosting
- **GitHub Pages** - Free hosting for static sites

### API Deployment Options:
- **Azure App Service** - Managed .NET hosting
- **AWS Elastic Beanstalk** - Managed deployment
- **Docker** - Containerized deployment
- **IIS** - Traditional Windows hosting

## Environment Variables

For production, use environment variables instead of hardcoded URLs:

```javascript
const API_BASE_URL = process.env.API_URL || 'https://localhost:5001/api';
```

## Error Handling

Add global error handling:

```javascript
window.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
    alert('An unexpected error occurred. Please try again.');
});
```

## Complete Example

See the original frontend HTML file and apply these updates. The structure remains the same, but all localStorage calls are replaced with API calls.

---

**Result**: A fully integrated full-stack application with real-time data synchronization!
