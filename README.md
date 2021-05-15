# Vaccine Check

A simple program to check if vaccination slots are available in selected districts

Run the app using ```node index.js``` or ```npm run start```

## Config

- intervalMinutes: timer for setInterval
- districts: JSON array with district code and name

You can get the district ids from the cowin website. Just check the network log after selecting your state and change the districts json in code.

### Sample districts JSON
```
[{
    code: '581',
    name: 'Hyderabad'
}, {
    code: '603',
    name: 'Rangareddy'
}, {
    code: '596',
    name: 'Medchal'
}]
```