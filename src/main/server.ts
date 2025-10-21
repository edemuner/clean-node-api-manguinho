import express from "express";

const app = express();
app.listen(5051, () => {
    console.log('Server running at http://localhost:5051');
});