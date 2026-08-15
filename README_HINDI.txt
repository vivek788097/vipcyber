VIP CYBER CAFE — ALL-IN-ONE FINAL

इस version में:
1. Admin Login
2. Operator Login
3. Admin को सभी services का पूरा access
4. Operator को केवल selected services
5. Online Services:
   - Sarkari Result
   - eDistrict UP
   - Sahaj Retail
6. Flight Ticket → Akbar Travels
7. Train Ticket → IRCTC
8. Mobile/DTH Recharge
9. Bill Payment
10. Bill Print
11. Due Payment
12. Due Payment Reminder
13. Other Website/Service Add — Admin खुद नाम और link जोड़ सकता है
14. हर service के saved data पर Delete Data
15. Operator Enable/Disable/Delete

DEFAULT ADMIN:
ID: admin
Password: VIP@2026

RUN:
npm install
npm start
फिर browser में http://localhost:3000

ONLINE ADMIN:
यह package online-hosting-ready है। Internet पर चलाने के लिए इसे Node.js hosting/server पर deploy करना होगा।
Production में ADMIN_PASSWORD, SESSION_SECRET और HTTPS जरूर इस्तेमाल करें।

IMPORTANT:
Flight/Train/Online links बाहरी websites हैं। Booking/payment उनकी अपनी website पर होगा।


BANK SERVICE UPDATE:
- Bank Services में Bank Form/Record option है।
- Admin Panel में Bank Services — Link Add से कोई भी नई bank service का नाम + URL जोड़ सकते हैं।
- Added bank links Operator को Bank Services permission होने पर दिखेंगे।
- Admin bank links delete भी कर सकता है।


DESIGN UPDATE:
- Login, Admin और Operator screens में modern VIP background design जोड़ा गया है.
- Background responsive है और desktop/mobile दोनों पर काम करेगा.


BILL + REMINDER UPDATE:
- Due Payment और Due Reminder में Mobile Number, Due Amount और Due Date fields हैं।
- Admin Panel में Due Date के हिसाब से reminder दिखता है।
- Bill Print में Customer Name, Mobile Number, Amount, Date और Service/Details भरें।
- Print करते ही "VIP CYBER CAFE" का पूरा bill/receipt print window खुलेगा।


GST UPDATE:
- Bill Print में GST 18% जोड़ा गया है।
- Grand Total = Amount + 18% GST.
- उदाहरण: ₹1,000 + ₹180 GST = ₹1,180 Grand Total.
नोट: GST registration/tax invoice की कानूनी जरूरतें आपके वास्तविक business/tax status पर निर्भर करती हैं।
