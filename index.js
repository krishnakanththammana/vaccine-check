const request = require('request');
const express = require('express');

const app = express();

app.get('/ping', (req, res) => {
    res.send("pong");
});

// manually trigger the request
app.get('/check', (req, res) => {
    sendReuqest();
    res.send("checking");
});

const districts = [{
    code: '581',
    name: 'Hyderabad'
}, {
    code: '603',
    name: 'Rangareddy'
}, {
    code: '596',
    name: 'Medchal'
}];

const sendReuqest = () => {
    districts.forEach(district => {
        console.log(`Checking for ${district.name} :: ${new Date()}... will print in console if anything is available`);
        request({url: `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district.code}&date=15-05-2021`}, (error, response, body) => {
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
            if(sessions18.length) {
                console.log(`vaccination available for ${min_age_limit} in ${district.name} district at ${center.name}`);
            } else {
               // console.log(`no vaccines found for ${min_age_limit} in district ${district.name} at ${center.name}`);
            }
        }
    });
}

const intervalMinutes = 60;
let counter = 0;

console.log("/**********************************/");
console.log(`* Checking once every ${intervalMinutes} minutes *`);
console.log("/**********************************/");
// send a request Immediately after the app starts and then schedule it according to ${intervalMinutes}
sendReuqest();


setInterval(() => {
    counter++;
    console.log(`/******* check: ${counter} *******/`);
    sendReuqest();
}, 1000 * 60 * intervalMinutes); // convert intervalMinutes to milliseconds

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
})


