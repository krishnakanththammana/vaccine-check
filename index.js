const request = require('request');
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();


let {auth, districts, mailOptions} = require('./options');

app.get('/ping', (req, res) => {
    res.send("pong");
});

// manually trigger the request
app.get('/check', (req, res) => {
    sendReuqest();
    res.send("checking");
});

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth
});

const sendReuqest = () => {
    districts.forEach(district => {
        console.log(`Checking for ${district.name} :: ${new Date()}... will print in console if anything is available`);
        const today = new Date();
        const dateForCheck = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district.code}&date=${dateForCheck}`;
        request({url}, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                checkVaccineAvailable((JSON.parse(body)).centers, district);
            }
        });
    });
};

const checkVaccineAvailable = (centers, district) => {
    centers.forEach(center => {
        const {sessions} = center;
        const min_age_limit = 18;
        if(sessions && sessions.length) {
            const sessions18 = sessions.filter(session => (session.min_age_limit === min_age_limit && session.available_capacity > 0));
            if(sessions18.length && sessions18[0].available_capacity_dose1 > 0) {
                const vaccineAvailabeText = `vaccination available for ${min_age_limit} in ${district.name} district at ${center.name}`
                console.log(vaccineAvailabeText);
                mailOptions = {
                    ...mailOptions,
                    subject: 'Vaccination Check - Vaccine available',
                    text: vaccineAvailabeText
                };
                sendMail(mailOptions);
            } else {
               // console.log(`no vaccines found for ${min_age_limit} in district ${district.name} at ${center.name}`);
            }
        }
    });
}

const sendMail = function(mailOptions_in) {
    transporter.sendMail(mailOptions_in, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    }); 
}

const intervalMinutes = 5;
let counter = 0;

console.log("/**********************************/");
console.log(`* Checking once every ${intervalMinutes} minutes *`);
console.log("/**********************************/");
// send a request Immediately after the app starts and then schedule it according to ${intervalMinutes}
sendReuqest();
const initialMailOptions = {
    ...mailOptions,
    subject: "Vaccine check - Server started",
    text: "Node server started checking for vaccines and will let you know if any slots are available    - Krish"
}
sendMail(initialMailOptions);

setInterval(() => {
    counter++;
    console.log(`/******* check: ${counter} *******/`);
    sendReuqest();
}, 1000 * 60 * intervalMinutes); // convert intervalMinutes to milliseconds

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})


