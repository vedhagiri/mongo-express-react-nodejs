const express = require('express');


const app = express();

const PORT = process.env.PORT || 5000;

app.get('/', (req, res, next) => res.send('API Sanity Check'));

app.listen(PORT, () => console.log(`server started on port ${PORT}`))
