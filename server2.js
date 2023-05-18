const corsAnywhere = require('cors-anywhere');

// กำหนดพอร์ตที่คุณต้องการใช้งาน
const PORT = 3001;

// ตั้งค่าตัวกลาง
const corsOptions = {
  originWhitelist: [], // กำหนดรายชื่อเว็บไซต์ที่อนุญาตให้เรียกใช้งาน (หรือเว้นว่างเพื่ออนุญาตทุกเว็บไซต์)
  requireHeader: ['origin', 'x-requested-with'], // กำหนดส่วนหัวที่จำเป็นสำหรับการอนุญาต
};

// เริ่มต้นตัวกลาง
corsAnywhere.createServer(corsOptions).listen(PORT, () => {
  console.log(`CORS Anywhere is running on port ${PORT}`);
});
