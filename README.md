# Mobile Purchase Contest Website 📱🎉

A modern, responsive contest website for customers who have purchased mobile phones. Built with HTML, CSS, and JavaScript.

## Features ✨

### 🎯 **Contest Form**
- Comprehensive form collecting:
  - Personal details (First name, Last name, Mobile, Email)
  - Mobile information (Model, IMEI number)  
  - Complete address (Street, City, State dropdown, Country, PIN code)
- Real-time form validation with Indian state dropdown
- Modern, responsive design

### 🎁 **Prize Information**
- Beautiful prize showcase section
- Attractive visual presentation of contest rewards

### ✅ **Form Validation**
- Real-time field validation
- Email format validation
- Indian mobile number format (10 digits, starting with 6-9)
- IMEI validation (15 digits)
- PIN code validation (6 digits)
- Required field checking

### 💾 **Dual Storage System**
- **Firebase Realtime Database** - Cloud storage for real-time access from anywhere
- **localStorage** - Local backup for instant access and offline functionality
- All entries automatically saved to both storage systems
- Smart data merging prevents duplicates between storage systems
- Single download button includes data from both sources

### 📧 **Email Integration**
- EmailJS integration for sending contest details
- Fallback mailto option if EmailJS fails
- Professional email formatting

### 🎊 **Success Experience**
- Exciting celebration modal with animations and emojis
- Congratulatory message with clear next steps
- Professional winner notification process
- Clean customer experience (technical features hidden)

## How to Use 🚀

### For Participants:
1. Open `index.html` in a web browser
2. Fill out the contest form with accurate information
3. Submit the form to enter the contest
4. Entry is automatically saved to both Firebase (cloud) and localStorage (local backup)
5. Enjoy the celebration message and contest confirmation
6. Wait for results - winners will be contacted directly

### For Organizers:
1. Access the admin panel at `admin.html` (link in footer)
2. View contest statistics and recent entries from both Firebase and localStorage
3. **Data Export Options**:
   - Download the complete CSV file with all entries from both storage systems
   - Email HTML table + CSV data directly to raghavsharma0411@gmail.com
4. **Firebase Management**: Cloud data automatically synced and backed up
5. **Debug Tools**: Console commands for Firebase testing and troubleshooting
6. Clear all contest data from both storage systems

## File Structure 📁

```
Contest/
├── index.html          # Main contest form
├── admin.html          # Admin panel for data management
├── style.css           # Modern CSS styling
├── script.js           # JavaScript functionality
├── contest_entries.csv # CSV headers (for reference)
└── README.md           # This documentation
```

## Configuration ⚙️

### EmailJS Setup
The website uses EmailJS for email functionality with a custom template.

**Step 1: Update Configuration in `script.js`:**
```javascript
const ContestConfig = {
    emailjs: {
        publicKey: 'your-emailjs-public-key',
        serviceId: 'your-service-id',
        templateId: 'your-template-id',
        enabled: true
    },
    contest: {
        organizerEmail: 'raghavsharma0411@gmail.com'
    }
};
```

**Step 2: Create EmailJS Template:**
Use the custom template provided above with these variables:
- `{{title}}` - Export description
- `{{name}}` - Sender name (Contest Admin Panel)
- `{{time}}` - Export timestamp
- `{{message}}` - HTML table and CSV data
- `{{entry_count}}` - Number of entries
- `{{export_date}}` - Export date

### Contest Settings
- Contest end date: December 31, 2025 (configurable)
- Maximum entries: 1000 (configurable)
- CSV base filename: 'contest_entries' (configurable)
- Auto-download: Enabled for immediate file saving

## Browser Compatibility 🌐

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## Features in Detail 🔍

### Form Validation
- **Email**: Standard email format validation
- **Mobile**: Indian mobile number format (10 digits, starts with 6-9)
- **IMEI**: Exactly 15 digits
- **PIN Code**: Exactly 6 digits
- **Required Fields**: All fields are mandatory

### Data Storage
- **Firebase Realtime Database**: Cloud-based storage accessible from anywhere
- **localStorage**: Browser-based backup for offline access
- **Dual-layer protection**: Data saved to both systems simultaneously
- **Smart data merging**: Prevents duplicates across storage systems
- **Real-time synchronization**: Firebase data updates instantly
- **Unique entry ID generation** for each submission
- **CSV Format**: Separate Date (dd/mm/yyyy) and Time (HH:MM:SS) columns for better data organization
- **Automatic backups**: Never lose data with dual storage system

### Admin Panel
- **Access**: Navigate to `admin.html` (discrete link in footer)
- **Statistics**: View total entries, today's entries, and last submission time
- **Data Export Options**:
  - Download complete CSV file with all entries (for spreadsheets)
  - Email HTML table + raw CSV data to raghavsharma0411@gmail.com (no attachment needed)
- **All Entries Table**: Professional HTML table showing all contest submissions with search functionality
- **Data Management**: Clear all contest data (with confirmation)
- **Debug Tools**: Console commands for troubleshooting

## 🔥 **Firebase Integration**

### Firebase Configuration
The website uses Firebase Realtime Database with your provided configuration:
```
- Project ID: mobilecontest-bbbc5
- Database URL: https://mobilecontest-bbbc5-default-rtdb.firebaseio.com
- Real-time data synchronization
- Automatic backup and persistence
```

### Firebase Debug Commands (Console)
```javascript
// Test Firebase connection and entry count
testFirebaseConnection()

// Get current Firebase entry count
getFirebaseEntryCount()

// Test saving a dummy entry to Firebase
testFirebaseSave()

// Debug all storage systems (localStorage + Firebase)
debugContestStorage()

// Clear all data from both storage systems
clearContestStorage()
```

### Firebase Features
- **Real-time Database**: Instant data synchronization
- **Cloud Storage**: Access from any device/location
- **Automatic Backup**: Data persists even if localStorage is cleared
- **Error Handling**: Graceful fallback to localStorage if Firebase is unavailable
- **Async Operations**: Non-blocking Firebase operations with proper waiting
- **Data Integrity**: Prevents duplicate entries across storage systems

#### CSV File Example:
```csv
Entry ID,First Name,Last Name,Mobile,Email,Mobile Model,IMEI,Address,City,State,Country,PIN Code,Date,Time
CE1735219200001ABCDE,"John","Doe",9876543210,john@example.com,"iPhone 15",123456789012345,"123 MG Road, Bandra West","Mumbai","Maharashtra","India",400050,"26/12/2025","14:30:25"
```

### Email Functionality
- Automatic email sending via EmailJS
- Formatted email with all contest details
- Fallback mailto option for reliability
- Professional email templates

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interface
- Modern visual design with gradients and animations

## Security Features 🔒

- Client-side validation (server-side validation recommended for production)
- XSS protection through proper input handling
- No sensitive data exposure
- Local storage encryption recommended for production

## Customization Options 🎨

### Colors and Branding
Update CSS variables in `style.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #f093fb;
    /* Customize other colors as needed */
}
```

### Contest Rules
Update the rules section in `index.html` to match your contest requirements.

### Prize Information
Modify the prizes section in `index.html` to reflect your actual prizes.

## Development Notes 💻

- Built with vanilla JavaScript (no frameworks required)
- Uses modern CSS features (Grid, Flexbox, CSS Variables)
- Progressive enhancement approach
- Accessible design with ARIA labels
- Print-friendly styles included

## Support 📞

For technical support or questions about the contest website, contact the development team.

## License 📄

This contest website is part of the portfolio project. All rights reserved.

---

**Built with ❤️ for mobile enthusiasts**
