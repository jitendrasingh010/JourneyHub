const nodemailer=require('nodemailer')

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"jitendrasingh63793@gmail.com",
        pass:"kgni txfg wvpp hszy"
    }
})
module.exports=transporter;
