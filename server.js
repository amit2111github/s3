const app = require("express")();
const fileUpload = require("express-fileupload");
app.use(fileUpload());

const aws = require("aws-sdk");
const region = "us-east-1";
const fs = require("fs");
const path = require("path");


aws.config.update({region , accessKeyId , secretAccessKey});

const s3 = new aws.S3();
 
app.get("/getbucket" , async (req , res) => {
	try {
		s3.listBuckets(function(err, data) {
		  	if (err) {
		  		console.log("Error", err);
		  		return res.json({error : "something went wrong"});
		  	}
		  	console.log("Success", data.Buckets);
		  	return res.json(data.Buckets);
		});
	}
	catch(err) {
		console.log(err);
		return res.json({error : "something went wrong"});
	}
});

app.get("/create/:name" ,(req ,res) =>{
	const {name} = req.params;
	s3.createBucket({Bucket : name} , (err , data) => {
		if(err) {
			console.log(err);
			return res.json({error  : "failed to create bucker"});
		}
		// console.log(data);
		return res.json(data);
	});
});
app.get("/delete/:name" ,(req ,res) =>{
	const {name} = req.params;
	s3.deleteBucket({Bucket : name} , (err , data) => {
		if(err) {
			console.log(err);
			return res.json({error  : "failed to delete bucker"});
		}
		return res.json(data);
	});
});

app.get("/upload-home" ,(req ,res) =>{
	return res.sendFile(path.join(__dirname , "index.html"));
});

app.post("/upload" , (req , res)=>{
	const file = req.files.myFile;
	const Bucket = "amit-demo-bucket-1";
	s3.upload({Bucket , Key : file.name , Body: file.data} ,(err , data) => {
		if(err) return res.json({error : "Failed to Upload file"});
		console.log(data.Location);
		return res.json({msg : `Successfully uploaded ` + data.Location});
	});
});

app.get("/view/:Key" ,(req , res) => {
	console.log("inside 1");
	const Bucket = "amit-demo-bucket-1";
	const {Key} = req.params;
	const Expires = 60 * 5;
	s3.getSignedUrl('getObject', {Bucket,Key ,Expires} ,(err , data) => {
		if(err) {
			console.log(err);
			return res.json({error  : "failed to create signed bucker"});
		}
		const ws = fs.createReadStream(data);
		ws.pipe(res);
	});
});

const server = app.listen(process.env.PORT || 3000 , () => {
	console.log(`Listening on port ${server.address().port}`);
});