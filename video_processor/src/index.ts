import express from "express";
import ffmpeg from "fluent-ffmpeg";

// init app
const app = express();
app.use(express.json());

// endpoint to process video
app.post("/process-video", (req, res) => {
    // retrieve input file path from request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;

    if (!inputFilePath || !outputFilePath) {
        res.status(400).send("Bad Request: Missing file path.")
    }

    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=-1:360") // scale video to 360p
        .on("end", () => {
            res.status(200).send("Video processing successfully completed.");
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`);
        })
        .save(outputFilePath);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log(`Server is running at http://localhost:${port}`); 
});