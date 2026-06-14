const express=require('express');
const router=express.Router();
const HotelController=require('../controller/hotelController');
const auth=require('../middelware/auth');
router.post('/addhotel',HotelController.addHotel);
router.get('/gethotel',HotelController.getHotel);
router.get('/gethotel/:id',HotelController.getHotelById);
router.put('/updatehotel/:id',auth,HotelController.updateHotel);
router.delete('/deletehotel/:id',auth,HotelController.deleteHotel);
router.put('/softdeletehotel/:id',auth,HotelController.softDeleteHotel);
router.put('/restorehotel/:id',auth,HotelController.restoreHotel);
router.put('/approvehotel/:id',auth,HotelController.approveHotel);
router.put('/reject/:id',auth,HotelController.rejectHotel);

module.exports=router;
