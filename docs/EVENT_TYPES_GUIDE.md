# Event Types Implementation Guide

## Overview

The system now supports **three types of events** with different behaviors and handling:

1. **CASEC Event** 🎉 - Official community events with registration
2. **Partner Event** 🤝 - Events hosted by partners (can link to external registration)
3. **Announcement** 📢 - Information only (no registration needed)

## Event Types Explained

### 1. CASEC Event (Default)
- **Purpose**: Official CASEC community events
- **Registration**: Internal system registration
- **Payment**: Through CASEC system
- **Examples**: Annual Gala, Workshops, Member Mixers
- **Features**:
  - Full registration tracking
  - Payment processing
  - Capacity management
  - Automated confirmations

### 2. Partner Event
- **Purpose**: Events hosted by partner organizations
- **Registration**: Can use external registration URL OR internal system
- **Payment**: Through partner OR CASEC
- **Examples**: Tech Innovation Summit, Joint Conferences
- **Features**:
  - Partner name and logo display
  - Partner website link
  - Optional external registration URL
  - Co-branding opportunities

### 3. Announcement
- **Purpose**: Information sharing without registration
- **Registration**: None (disabled)
- **Payment**: N/A
- **Examples**: Facility openings, Policy updates, Community news
- **Features**:
  - Read-only display
  - No capacity limits
  - Date tracking
  - Archive capability

## Database Changes

### New Fields in Events Table

```sql
EventType                NVARCHAR(50)    -- 'CasecEvent', 'PartnerEvent', 'Announcement'
EventCategory            NVARCHAR(100)   -- e.g., 'Gala', 'Workshop', 'Networking'
PartnerName              NVARCHAR(200)   -- Partner organization name
PartnerLogo              NVARCHAR(500)   -- Logo URL
PartnerWebsite           NVARCHAR(500)   -- Partner website
RegistrationUrl          NVARCHAR(500)   -- External registration link
IsRegistrationRequired   BIT             -- Can disable registration
IsFeatured               BIT             -- Highlight special events
```

## Setup Instructions

### Step 1: Run Database Migration

```bash
sqlcmd -S localhost -U sa -P YourPassword \
  -i Database/AddEventTypes.sql
```

This migration:
- Adds new event type fields
- Creates constraint for valid types
- Adds sample events of each type
- Creates event summary view
- Indexes for performance

### Step 2: Update Backend Controller

Replace your EventsController with the enhanced version:

```bash
cp EnhancedEventsController.cs CasecApi/Controllers/EventsController.cs
```

New endpoints:
- `GET /api/events/types` - Get event type info
- `GET /api/events/categories` - Get all categories
- Query filters: `?eventType=`, `?category=`, `?featured=`

### Step 3: Update Frontend

Replace Events page with enhanced version:

```bash
cp EnhancedEvents.jsx casec-frontend/src/pages/Events.jsx
```

New features:
- Event type filtering
- Category filtering
- Type-specific badges
- Partner info display
- External registration links
- Announcement handling

## Event Type Workflow Examples

### Example 1: Create CASEC Event

**Admin creates a workshop:**

```json
POST /api/events
{
  "title": "Leadership Skills Workshop",
  "description": "Develop your leadership skills...",
  "eventDate": "2025-02-28T14:00:00",
  "location": "CASEC Training Room B",
  "eventType": "CasecEvent",
  "eventCategory": "Workshop",
  "eventFee": 30.00,
  "maxCapacity": 25,
  "isRegistrationRequired": true,
  "isFeatured": false
}
```

**Members see:**
- 🎉 CASEC Event badge
- "Register" button
- $30 fee display
- 25 spots available
- Registration tracked internally

### Example 2: Create Partner Event

**Admin creates a partner event:**

```json
POST /api/events
{
  "title": "Tech Innovation Summit 2025",
  "description": "Join us for a day of innovation...",
  "eventDate": "2025-02-15T09:00:00",
  "location": "TechCorp Conference Center",
  "eventType": "PartnerEvent",
  "partnerName": "TechCorp Solutions",
  "partnerWebsite": "https://techcorp.example.com",
  "registrationUrl": "https://techcorp.example.com/register",
  "eventFee": 25.00,
  "maxCapacity": 150,
  "isRegistrationRequired": true
}
```

**Members see:**
- 🤝 Partner Event badge
- Partner info box with logo/link
- "Register on Partner Site" button
- Clicks to external registration
- Optional: Track internally too

### Example 3: Create Announcement

**Admin creates an announcement:**

```json
POST /api/events
{
  "title": "New Facilities Opening",
  "description": "We are excited to announce...",
  "eventDate": "2025-03-01T00:00:00",
  "location": "CASEC Community Center",
  "eventType": "Announcement",
  "eventFee": 0,
  "maxCapacity": 0,
  "isRegistrationRequired": false
}
```

**Members see:**
- 📢 Announcement badge
- "Information Only" label
- No registration button
- Read-only display
- Date for reference

## Frontend Features

### Event Type Badges

Each type has a distinct badge:

```jsx
🎉 CASEC Event    - Green (primary color)
🤝 Partner Event  - Blue
📢 Announcement   - Amber/Orange
```

### Filtering System

Members can filter by:
- **Event Type**: All / CASEC / Partner / Announcement
- **Category**: All / Workshop / Gala / Networking / etc.
- **Clear filters**: One-click reset

### Display Logic

**CASEC Event:**
- Shows price
- Shows capacity
- "Register" button
- Internal processing

**Partner Event (with external URL):**
- Shows partner info box
- "Register on Partner Site" button
- Opens in new tab
- Optional internal tracking

**Partner Event (internal registration):**
- Shows partner info
- Standard "Register" button
- Tracked internally

**Announcement:**
- No price display
- No capacity info
- "Information Only" label
- No action button

### Featured Events

Events marked `isFeatured = true`:
- Gold ring border
- ✨ "Featured" badge
- Appears at top of list
- Extra visual prominence

## Admin Event Management

### Creating Events

**Admin form should include:**

1. **Basic Info**
   - Title (required)
   - Description
   - Date & Time (required)
   - Location

2. **Event Type** (dropdown)
   - CASEC Event (default)
   - Partner Event
   - Announcement

3. **Category** (optional)
   - Workshop
   - Gala
   - Networking
   - Social
   - Educational
   - Custom...

4. **Registration Settings**
   - Is Registration Required? (checkbox)
   - Max Capacity (number)
   - Event Fee (decimal)

5. **Partner Info** (if Partner Event)
   - Partner Name
   - Partner Website URL
   - Partner Logo URL
   - External Registration URL (optional)

6. **Special Flags**
   - Featured Event? (checkbox)

### Example Admin Form JSX

```jsx
<select name="eventType" className="input w-full">
  <option value="CasecEvent">🎉 CASEC Event</option>
  <option value="PartnerEvent">🤝 Partner Event</option>
  <option value="Announcement">📢 Announcement</option>
</select>

{formData.eventType === 'PartnerEvent' && (
  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
    <h4 className="font-bold">Partner Information</h4>
    <input 
      type="text" 
      name="partnerName" 
      placeholder="Partner Organization Name"
      className="input w-full"
    />
    <input 
      type="url" 
      name="partnerWebsite" 
      placeholder="https://partner.com"
      className="input w-full"
    />
    <input 
      type="url" 
      name="registrationUrl" 
      placeholder="https://partner.com/register (optional)"
      className="input w-full"
    />
  </div>
)}

{formData.eventType === 'Announcement' && (
  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
    <p className="text-amber-800">
      ℹ️ Announcements do not allow registration. 
      Capacity and fees will be ignored.
    </p>
  </div>
)}
```

## Use Cases

### Use Case 1: Monthly Workshop Series

**Scenario**: CASEC runs monthly skill-building workshops

**Implementation**:
- Event Type: `CasecEvent`
- Category: `Workshop`
- Registration: Required
- Fee: $30
- Capacity: 25

**Members Experience**:
- Browse workshops
- Filter by "Workshop" category
- Register internally
- Payment tracked
- Confirmation email

### Use Case 2: Partner Conference

**Scenario**: Tech partner invites CASEC members to their conference

**Implementation**:
- Event Type: `PartnerEvent`
- Partner Name: "TechCorp"
- Registration URL: External partner site
- Fee: $50 (paid to partner)

**Members Experience**:
- See partner branding
- Click to partner site
- Register externally
- No internal capacity tracking

### Use Case 3: Facility Announcement

**Scenario**: New community center opening announcement

**Implementation**:
- Event Type: `Announcement`
- Registration: Not required
- Date: Opening date
- Fee: $0

**Members Experience**:
- See announcement
- No registration button
- Just information
- Date for reference

### Use Case 4: Annual Gala (Featured)

**Scenario**: Premier annual fundraising event

**Implementation**:
- Event Type: `CasecEvent`
- Category: `Gala`
- Featured: `true`
- Fee: $100
- Capacity: 250

**Members Experience**:
- Appears at top with gold ring
- ✨ Featured badge
- High visibility
- Premium positioning

## API Usage Examples

### Get All CASEC Events

```javascript
GET /api/events?eventType=CasecEvent
```

### Get Featured Events Only

```javascript
GET /api/events?featured=true
```

### Get Workshop Category

```javascript
GET /api/events?category=Workshop
```

### Get Partner Events

```javascript
GET /api/events?eventType=PartnerEvent
```

### Get All Event Types Info

```javascript
GET /api/events/types

Response:
[
  {
    "type": "CasecEvent",
    "displayName": "CASEC Event",
    "description": "Official CASEC community events",
    "icon": "🎉",
    "allowsRegistration": true
  },
  ...
]
```

## Categories

Categories are dynamic and created from existing events. Common categories:

- **Workshop** - Skill-building sessions
- **Gala** - Formal events
- **Networking** - Connection opportunities
- **Social** - Casual gatherings
- **Educational** - Learning events
- **Fundraiser** - Charity events
- **Conference** - Multi-track events
- **Community Service** - Volunteer activities

Categories automatically populate the filter dropdown from existing events.

## Best Practices

### 1. Event Type Selection

- **Use CASEC Event when:**
  - Event is organized by CASEC
  - Registration handled internally
  - Payment goes to CASEC
  - Full tracking needed

- **Use Partner Event when:**
  - Hosted by another organization
  - Shared co-sponsorship
  - External registration preferred
  - Partner branding important

- **Use Announcement when:**
  - Just sharing information
  - No action required from members
  - Policy updates
  - News items

### 2. Featured Events

Use sparingly for:
- Annual signature events
- Special one-time occasions
- High-priority events
- Limited-time opportunities

Limit to 2-3 featured events at a time.

### 3. Partner Events

When creating partner events:
- Always include partner name
- Add partner website if available
- Use external registration URL when partner prefers
- Can still track internally if needed
- Consider co-branding opportunities

### 4. Categories

Keep categories:
- Consistent across events
- Simple (one word when possible)
- Meaningful to members
- Limited in number (5-10 core categories)

## Testing Checklist

### Event Creation
- [ ] Create CASEC event with registration
- [ ] Create partner event with external URL
- [ ] Create partner event with internal registration
- [ ] Create announcement (no registration)
- [ ] Create featured event
- [ ] Create event with category

### Event Display
- [ ] CASEC event shows green badge
- [ ] Partner event shows blue badge  
- [ ] Announcement shows amber badge
- [ ] Featured events show ✨ badge
- [ ] Partner info box displays correctly
- [ ] External links open in new tab

### Filtering
- [ ] Filter by CASEC events
- [ ] Filter by partner events
- [ ] Filter by announcements
- [ ] Filter by category
- [ ] Combine multiple filters
- [ ] Clear filters works

### Registration
- [ ] CASEC event registration works
- [ ] Partner external URL opens correctly
- [ ] Announcement has no register button
- [ ] Capacity limits enforced
- [ ] Already registered shows correctly

## Troubleshooting

### Issue: Event type not showing

**Solution**: Check database constraint allows the type
```sql
SELECT * FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS 
WHERE CONSTRAINT_NAME = 'CK_Events_EventType';
```

### Issue: Categories not loading

**Solution**: Verify events have categories set
```sql
SELECT DISTINCT EventCategory FROM Events 
WHERE EventCategory IS NOT NULL;
```

### Issue: Partner info not displaying

**Solution**: Check fields are populated
```sql
SELECT EventId, Title, PartnerName, PartnerWebsite 
FROM Events 
WHERE EventType = 'PartnerEvent';
```

### Issue: Registration button on announcement

**Solution**: Verify IsRegistrationRequired = false
```sql
UPDATE Events 
SET IsRegistrationRequired = 0 
WHERE EventType = 'Announcement';
```

## Future Enhancements

Potential additions:
- **Recurring Events**: Weekly/monthly series
- **Multi-day Events**: Conferences spanning days
- **Virtual Events**: Online event support
- **Hybrid Events**: In-person + virtual
- **Event Ratings**: Member feedback
- **Event Photos**: Gallery per event
- **Event Check-in**: QR code attendance
- **Event Reminders**: Automated notifications
- **Waitlist**: When at capacity
- **Event Series**: Link related events

## Summary

You now have:
- ✅ Three event types (CASEC, Partner, Announcement)
- ✅ Event categories for organization
- ✅ Featured event highlighting
- ✅ Partner information display
- ✅ External registration URLs
- ✅ Flexible registration options
- ✅ Type-specific badges and colors
- ✅ Advanced filtering
- ✅ Database migration
- ✅ Updated controllers
- ✅ Enhanced frontend

**Events are now more flexible and organized!** 🎉

---

**Need Help?**
- Check sample events in database after migration
- Review EventsController for all endpoints
- See EnhancedEvents.jsx for UI examples
