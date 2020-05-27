var express = require('express');
var app = express();
var multer = require('multer');
var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

function readFile(req, res, fs, filePath) {
    fs.exists(filePath, function(exists){
        if (exists) { 
          let fixedColumnLength = 4;
          let response  = {
              "records": []
          };
          let delimeter = req.params.delimeter;
          let line_numbers = parseInt(req.params.records);
          fs.readFile(filePath, 'utf8', (err, data) => {
              if (err) {
                  throw err;
              }
              if(data.length){
                  try{
                      let totalRecords = []
                      totalRecords =  data.split('\n');
                      let len = line_numbers >= totalRecords.length  ? totalRecords.length : line_numbers;
                      let tuples = {};
                      for(let i=0; i < len; i++){
                          let columns = totalRecords[i].split(delimeter);
                          let arr = [];
                          columns.forEach((col,index) => {
                              if(index < fixedColumnLength){
                                  tuples["columns"+index] = col;
                              }else{
                                  return;
                              }
                          });
                        response["records"].push(tuples);
                      }
                  }catch(error){
                      throw error;
                  }
              }
             
              res.send(JSON.parse(JSON.stringify(response)));
          });    
        } else {
           res.send(JSON.parse(JSON.stringify({"status": 404, "error_message": "File  not found"})));
        }
    });  
}
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
});
  
var upload = multer({ storage: storage }).array('file');

app.get('/',function(req,res){
    return res.send('Assignment is in progress')
})
app.post('/upload',function(req, res) {
    
    upload(req, res, function (err) {
     
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
        } else if (err) {
            return res.status(500).json(err)
        } 
        return res.send(JSON.parse(JSON.stringify({"status": 200, "path": req.files[0].filename})));
      })
});

/* Get content of the file based on the filters*/
app.get('/getData/:delimeter/:records/:filename', function(req, res) {
    const filePath = './public/' + req.params.filename;
    readFile(req, res, fs, filePath) 
});
app.listen(8888, function() {
    console.log('App running on port 8888');
});