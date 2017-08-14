const express = require('express');
const csv = require("fast-csv");
const fs = require('fs');
const request = require('request');

const router = express.Router();

// declare axios for making http requests
const axios = require('axios');
const API = 'https://jsonplaceholder.typicode.com';

/* GET api listing. */
router.post('/', (req, res) => {
	console.log(req.body.url)
	if(req['body']['url']) {
		var csvData = [];

		csv
			.fromStream(request(req['body']['url']), {headers: true})
			.on("data-invalid", function(data){
			   res.status(500).send('invalid');
			 })
			.on("data", function(data){
				csvData.push(data);
			})
			.on("end", function(){
				res.status(200).json(csvData);
			})
			.on("error", function(error){
				res.status(500).send(error);
				console.log(error);
			});
	} else {
		res.status(500).send('url is invalid');
	}
});

// Get all posts
router.get('/posts', (req, res) => {
  // Get posts from the mock api
  // This should ideally be replaced with a service that connects to MongoDB
  axios.get(`${API}/posts`)
    .then(posts => {
      res.status(200).json(posts.data);
    })
    .catch(error => {
      res.status(500).send(error)
    });
});

module.exports = router;