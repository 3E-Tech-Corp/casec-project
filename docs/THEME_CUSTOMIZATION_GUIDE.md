# Theme Customization Implementation Guide

## 🎨 Overview

This feature allows system administrators to fully customize the visual appearance of the CASEC platform:

- **Replace "CASEC" text** with your organization's logo
- **Customize all colors**: Primary, accent, status, text, background
- **Upload favicon** for browser tab branding
- **Choose from 6 theme presets** for quick styling
- **Add custom CSS** for advanced customization
- **Typography control**: Change font families
- **Live preview** before applying changes

---

## 🆕 What's New

### Database
- ✅ `ThemeSettings` table (20+ color fields)
- ✅ `ThemePresets` table (6 built-in presets)
- ✅ Logo and favicon storage
- ✅ Custom CSS support
- ✅ Organization name override

### Backend
- ✅ `ThemeController` with 7 endpoints
- ✅ Public theme API (no auth required)
- ✅ Admin theme management
- ✅ Logo/favicon upload
- ✅ Theme reset functionality
- ✅ Activity logging

### Frontend
- ✅ Theme customization admin page
- ✅ Color pickers for all colors
- ✅ Theme provider with CSS variables
- ✅ Logo component (replaces "CASEC" text)
- ✅ Live theme application
- ✅ Preset selection

---

## 🗄️ Database Schema

### ThemeSettings Table
```sql
ThemeId                      INT PRIMARY KEY
OrganizationName             NVARCHAR(200)
LogoUrl                      NVARCHAR(500)
FaviconUrl                   NVARCHAR(500)

-- Primary Colors
PrimaryColor                 NVARCHAR(50)
PrimaryDarkColor             NVARCHAR(50)
PrimaryLightColor            NVARCHAR(50)

-- Accent Colors
AccentColor                  NVARCHAR(50)
AccentDarkColor              NVARCHAR(50)
AccentLightColor             NVARCHAR(50)

-- Status Colors
SuccessColor                 NVARCHAR(50)
ErrorColor                   NVARCHAR(50)
WarningColor                 NVARCHAR(50)
InfoColor                    NVARCHAR(50)

-- Text Colors
TextPrimaryColor             NVARCHAR(50)
TextSecondaryColor           NVARCHAR(50)
TextLightColor               NVARCHAR(50)

-- Background Colors
BackgroundColor              NVARCHAR(50)
BackgroundSecondaryColor     NVARCHAR(50)

-- Other Colors
BorderColor                  NVARCHAR(50)
ShadowColor                  NVARCHAR(50)

-- Typography
FontFamily                   NVARCHAR(200)
HeadingFontFamily            NVARCHAR(200)

-- Advanced
CustomCss                    NVARCHAR(MAX)
IsActive                     BIT
UpdatedBy                    INT
UpdatedAt                    DATETIME
```

### ThemePresets Table
```sql
PresetId              INT PRIMARY KEY
PresetName            NVARCHAR(100)
Description           NVARCHAR(500)
PrimaryColor          NVARCHAR(50)
PrimaryDarkColor      NVARCHAR(50)
PrimaryLightColor     NVARCHAR(50)
AccentColor           NVARCHAR(50)
AccentDarkColor       NVARCHAR(50)
AccentLightColor      NVARCHAR(50)
PreviewImage          NVARCHAR(500)
IsDefault             BIT
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
sqlcmd -S localhost -U sa -P YourPassword \
  -i Database/AddThemeCustomization.sql
```

**What it does**:
- ✅ Creates ThemeSettings table
- ✅ Creates ThemePresets table
- ✅ Inserts default CASEC theme
- ✅ Inserts 6 theme presets
- ✅ Creates stored procedures

### Step 2: Add Theme Controller

```bash
cp ThemeController.cs CasecApi/Controllers/
```

### Step 3: Update Frontend

```bash
# Copy theme components
cp ThemeProvider.jsx casec-frontend/src/components/
cp LogoOrText.jsx casec-frontend/src/components/
cp admin/ThemeCustomization.jsx casec-frontend/src/pages/admin/

# Update tailwind config
cp tailwind.config.js casec-frontend/
```

### Step 4: Wrap App with ThemeProvider

**In `App.jsx`**:
```jsx
import ThemeProvider from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* Your existing routes */}
      </BrowserRouter>
    </ThemeProvider>
  );
}
```

### Step 5: Update Layout with Logo Component

**In `Layout.jsx`** (replace "CASEC" text):
```jsx
import LogoOrText from './LogoOrText';

// Replace this:
<Link to="/" className="text-2xl font-display font-bold text-primary">
  CASEC
</Link>

// With this:
<LogoOrText />
```

### Step 6: Add Route (Admin only)

**In `App.jsx`**:
```jsx
<Route path="/admin/theme" element={
  <ProtectedRoute requireAdmin>
    <Layout><ThemeCustomization /></Layout>
  </ProtectedRoute>
} />
```

### Step 7: Add Navigation Link

**In `Layout.jsx`** admin links:
```jsx
const adminLinks = [
  // ... existing links
  { path: '/admin/theme', label: 'Theme Customization' }
];
```

### Step 8: Restart Backend & Frontend

```bash
# Backend
cd CasecApi && dotnet run

# Frontend
cd casec-frontend && npm run dev
```

---

## 🎨 Built-in Theme Presets

### 1. CASEC Green (Default)
- **Primary**: Green (#047857)
- **Accent**: Amber (#f59e0b)
- **Style**: Professional, natural

### 2. Ocean Blue
- **Primary**: Blue (#0284c7)
- **Accent**: Teal (#14b8a6)
- **Style**: Calm, trustworthy

### 3. Royal Purple
- **Primary**: Purple (#7c3aed)
- **Accent**: Pink (#ec4899)
- **Style**: Elegant, creative

### 4. Sunset Orange
- **Primary**: Orange (#ea580c)
- **Accent**: Red (#dc2626)
- **Style**: Energetic, bold

### 5. Forest Green
- **Primary**: Green (#16a34a)
- **Accent**: Lime (#84cc16)
- **Style**: Natural, organic

### 6. Professional Navy
- **Primary**: Navy (#1e40af)
- **Accent**: Blue (#3b82f6)
- **Style**: Corporate, formal

---

## 💡 Usage Guide

### How to Customize Theme

1. **Login as Admin**
2. **Navigate to**: Admin → Theme Customization
3. **Update Organization Name**: Change "CASEC" to your name
4. **Upload Logo**: 
   - Click "Choose Logo"
   - Select PNG, SVG, JPG, or WEBP (max 5MB)
   - Click "Upload"
   - Logo replaces text in header
5. **Upload Favicon**:
   - Click "Choose Favicon"
   - Select ICO, PNG, or SVG (max 1MB)
   - Appears in browser tab
6. **Choose Preset** (Optional):
   - Click any preset card
   - Colors apply instantly
7. **Customize Colors**:
   - Click color box to open picker
   - Or type hex code directly
   - See live preview
8. **Update Typography** (Optional):
   - Change font families
   - Example: "Roboto, sans-serif"
9. **Add Custom CSS** (Advanced):
   - Write CSS rules
   - Applied globally
10. **Save Changes**:
    - Click "Save Changes" button
    - Refresh page to see results

---

## 🎯 Use Cases

### Use Case 1: Organization Rebranding

**Scenario**: Organization changes name from "CASEC" to "Community Alliance"

**Steps**:
1. Update organization name: "Community Alliance"
2. Upload new logo
3. Upload new favicon
4. Select matching color preset
5. Save changes
6. All pages now show new branding

### Use Case 2: Match Corporate Colors

**Scenario**: Need to match parent company's brand guidelines

**Steps**:
1. Open brand guidelines
2. Copy primary color hex code
3. Paste into Primary Color field
4. Repeat for accent color
5. Adjust shades (dark/light) as needed
6. Save changes
7. Platform now matches corporate brand

### Use Case 3: Quick Theme Change

**Scenario**: Want fresh look without custom work

**Steps**:
1. Browse 6 theme presets
2. Click "Ocean Blue" preset
3. Colors apply instantly
4. Click "Save Changes"
5. Done in 30 seconds!

---

## 🔧 API Endpoints

### Get Active Theme (Public - No Auth)
```http
GET /api/theme/active

Response:
{
  "success": true,
  "data": {
    "themeId": 1,
    "organizationName": "CASEC",
    "logoUrl": "/uploads/theme/logo_abc123.png",
    "faviconUrl": "/uploads/theme/favicon_xyz789.ico",
    "primaryColor": "#047857",
    "accentColor": "#f59e0b",
    // ... all other colors
  }
}
```

### Get Theme (Admin Only)
```http
GET /api/theme
Authorization: Bearer {token}
```

### Update Theme (Admin Only)
```http
PUT /api/theme
Authorization: Bearer {token}

Body:
{
  "organizationName": "My Organization",
  "primaryColor": "#1e40af",
  "accentColor": "#3b82f6",
  // ... any fields to update
}
```

### Upload Logo (Admin Only)
```http
POST /api/theme/logo
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: file (image)

Response:
{
  "success": true,
  "data": {
    "url": "/uploads/theme/logo_abc123.png"
  }
}
```

### Upload Favicon (Admin Only)
```http
POST /api/theme/favicon
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: file (icon)
```

### Get Theme Presets (Admin Only)
```http
GET /api/theme/presets
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "presetId": 1,
      "presetName": "CASEC Green (Default)",
      "description": "Professional green and amber theme",
      "primaryColor": "#047857",
      "accentColor": "#f59e0b",
      "isDefault": true
    },
    // ... 5 more presets
  ]
}
```

### Reset Theme (Admin Only)
```http
POST /api/theme/reset
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Theme reset to default",
  "data": { /* default theme */ }
}
```

---

## 🎨 Customizable Elements

### Colors (20 total)

**Primary Brand** (3):
- Primary color (main brand)
- Primary dark (hover states)
- Primary light (backgrounds)

**Accent** (3):
- Accent color (highlights)
- Accent dark (hover)
- Accent light (backgrounds)

**Status** (4):
- Success (green)
- Error (red)
- Warning (amber)
- Info (blue)

**Text** (3):
- Primary text (main content)
- Secondary text (muted)
- Light text (on dark backgrounds)

**Background** (2):
- Main background
- Secondary background (cards)

**Other** (2):
- Border color
- Shadow color

### Typography (2)
- Body font family
- Heading font family

### Images (2)
- Organization logo
- Favicon

### Advanced (1)
- Custom CSS

---

## 🖼️ Logo Requirements

### Logo Specifications
- **Formats**: PNG (recommended), SVG, JPG, WEBP
- **Max Size**: 5MB
- **Recommended Dimensions**: 
  - Width: 150-250px
  - Height: 40-60px
  - Aspect ratio: 3:1 to 5:1
- **Background**: Transparent PNG works best
- **Color**: Design should work on light background

### Logo Usage
- Replaces "CASEC" text in header
- Displayed on all pages
- Clickable (links to home)
- Auto-scales to fit header

### Favicon Specifications
- **Formats**: ICO (recommended), PNG, SVG
- **Max Size**: 1MB
- **Recommended Size**: 32x32px or 16x16px
- **Purpose**: Browser tab icon

---

## 🎨 CSS Variables Reference

After theme loads, these CSS variables are available:

```css
/* Primary Colors */
var(--color-primary)
var(--color-primary-dark)
var(--color-primary-light)

/* Accent Colors */
var(--color-accent)
var(--color-accent-dark)
var(--color-accent-light)

/* Status Colors */
var(--color-success)
var(--color-error)
var(--color-warning)
var(--color-info)

/* Text Colors */
var(--color-text-primary)
var(--color-text-secondary)
var(--color-text-light)

/* Background Colors */
var(--color-background)
var(--color-background-secondary)

/* Other */
var(--color-border)
var(--color-shadow)

/* Typography */
var(--font-family)
var(--font-family-heading)
```

### Using in Custom CSS
```css
.my-custom-button {
  background-color: var(--color-primary);
  color: var(--color-text-light);
  border: 2px solid var(--color-primary-dark);
  font-family: var(--font-family);
}

.my-custom-button:hover {
  background-color: var(--color-primary-dark);
}
```

---

## 🔄 How Theme System Works

### 1. Theme Storage
- Admin updates theme via UI
- Saved to `ThemeSettings` table
- Only one active theme at a time

### 2. Theme Loading
- **Public endpoint**: `/api/theme/active`
- **No authentication** required
- Called on every page load
- Returns complete theme object

### 3. Theme Application
- `ThemeProvider` component loads theme
- Sets CSS variables on `:root`
- Updates document title
- Updates favicon
- Injects custom CSS

### 4. Component Usage
- Tailwind classes use CSS variables
- `text-primary` → `var(--color-primary)`
- `bg-accent` → `var(--color-accent)`
- Logo component checks `theme.logoUrl`

### 5. Changes Apply Immediately
- Save theme → sets CSS variables
- No page refresh for colors
- Logo/favicon require refresh

---

## 📋 Testing Checklist

### Theme Customization
- [ ] Access theme customization page (admin only)
- [ ] Update organization name
- [ ] Upload logo (PNG, SVG)
- [ ] Logo displays in header
- [ ] Upload favicon (ICO, PNG)
- [ ] Favicon shows in browser tab
- [ ] Select theme preset
- [ ] Colors change immediately
- [ ] Edit primary color
- [ ] Edit accent color
- [ ] Edit all 20+ colors
- [ ] Update font families
- [ ] Add custom CSS
- [ ] Click "Save Changes"
- [ ] Refresh page
- [ ] New theme persists
- [ ] Click "Reset to Default"
- [ ] Theme returns to CASEC green

### Cross-Page Theme
- [ ] Theme applies on all pages
- [ ] Logo shows on all pages
- [ ] Colors consistent everywhere
- [ ] Buttons use theme colors
- [ ] Cards use theme colors
- [ ] Text uses theme colors

### Public Access
- [ ] Theme loads without login
- [ ] Registration page themed
- [ ] Board page themed
- [ ] Events page themed

---

## 🎓 Best Practices

### Logo Design
1. **Keep it simple**: Clean, recognizable design
2. **Test on light background**: Ensure visibility
3. **Use vector**: SVG scales perfectly
4. **Transparent background**: PNG with transparency
5. **Appropriate size**: Don't upload 4000px wide logo

### Color Selection
1. **Contrast**: Ensure text readable on backgrounds
2. **Accessibility**: Check WCAG contrast ratios
3. **Consistency**: Use related shades
4. **Test everywhere**: Check all pages
5. **Brand alignment**: Match brand guidelines

### Typography
1. **Web-safe fonts**: Ensure broad support
2. **Fallbacks**: Provide font stack
3. **Readability**: Body text should be legible
4. **Hierarchy**: Headings should stand out
5. **Performance**: Avoid loading too many fonts

### Custom CSS
1. **Use sparingly**: Only when needed
2. **Test thoroughly**: Check all pages
3. **Document changes**: Comment your CSS
4. **Avoid !important**: Use specificity instead
5. **Validate syntax**: One error breaks all

---

## 🐛 Troubleshooting

### Logo not showing
**Check**:
- File uploaded successfully?
- Correct image format?
- Path correct in database?
- File exists in `/uploads/theme/`?

**Solution**:
```sql
SELECT LogoUrl FROM ThemeSettings WHERE IsActive = 1;
```

### Colors not applying
**Check**:
- Saved theme successfully?
- Refreshed page?
- Browser cache cleared?
- CSS variables set?

**Solution**: Open browser DevTools → Elements → `:root` → Check CSS variables

### Favicon not updating
**Cause**: Browser caches favicons aggressively

**Solution**:
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Try incognito mode

### Theme loads slowly
**Cause**: Large logo file

**Solution**:
1. Optimize image (compress)
2. Resize to appropriate dimensions
3. Use SVG for vector logos

---

## 🔐 Security Notes

### File Upload Validation
- File type whitelist enforced
- File size limits enforced
- Unique filenames generated
- Old files deleted automatically

### Admin Only Access
- Theme updates: Admin role required
- File uploads: Admin role required
- Get active theme: Public (no auth)

### SQL Injection Protection
- Entity Framework parameterized queries
- No raw SQL with user input

### XSS Protection
- Custom CSS sanitization recommended
- Logo URLs validated
- File extensions validated

---

## 📈 Future Enhancements

Possible additions:
- **Dark mode**: Toggle light/dark theme
- **Multiple themes**: Switch between saved themes
- **Theme scheduling**: Auto-change for holidays
- **Advanced editor**: Visual theme builder
- **Color palette generator**: AI-suggested colors
- **Preview mode**: See changes before saving
- **Theme export/import**: Share themes
- **Font upload**: Custom font files
- **CSS preprocessor**: SCSS support

---

## 📊 Summary

You now have:
- ✅ **Complete theme customization** (20+ colors)
- ✅ **Logo upload** (replaces "CASEC" text)
- ✅ **Favicon upload** (browser tab branding)
- ✅ **6 theme presets** (one-click styling)
- ✅ **Custom CSS** (advanced control)
- ✅ **Typography control** (font families)
- ✅ **Public theme API** (no auth required)
- ✅ **Theme provider** (React context)
- ✅ **CSS variables** (dynamic theming)
- ✅ **Activity logging** (audit trail)

**Your platform can now match any brand!** 🎨

---

**Need Help?**
- Check color contrast for accessibility
- Test logo on different screen sizes
- Start with preset, then customize
- Use transparent PNG for logos
- Keep custom CSS minimal
