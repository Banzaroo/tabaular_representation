
import React, { Component } from 'react';
import axios from 'axios';
import {Form, FormGroup, Label, Input, Table, Progress} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
class App extends Component {
  constructor(props) {
    super(props);
      this.state = {
        selectedFile: null,
        loaded:0,
        data:[],
        delimeter: '|',
        lines: 2,
        path: ''
      }
   
  }
  checkTypes = (types,file) => {
    return types.every( type => file.type !== type);
  }
  checkMimeType=(event)=>{
    let file = event.target.files[0];
    let err = null;
    const types = ['text/plain']
    if (this.checkTypes(types,file)) { 
      err = file.type +' is not a supported format\n';
      NotificationManager.error(err);
      event.target.value = null
      return false;
    }
    return true;
  }
  checkFileSize=(txt)=>{
    let file = txt;
    let MaxSize = 1000;
    let err = null; 
    if (file.size > MaxSize){
      err = file.type + 'is too large, please pick a smaller file\n';
      NotificationManager.error(err);
    }
    return true;
  }
  onChangeHandler=event=>{
    var file = event.target.files[0]
      if(this.checkMimeType(event)){
        if(this.checkFileSize(file)){
          this.setState({
              selectedFile: file,
              loaded:0
          });
        }
      }
  }
  onClickHandler = () => {
    const data = new FormData(); 
    if(!this.state.selectedFile){
      NotificationManager.error("Please upload a text file");
      return;
    }
    data.append('file', this.state.selectedFile);
    data.append('delimeter',this.state.delimeter);
    data.append('lines',this.state.lines);
    console.log(data);
    axios.post("http://localhost:8888/upload", data, {
      onUploadProgress: ProgressEvent => {
        this.setState({
          loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
        })
      },
    }).then(res => { // then print response status
      NotificationManager.success("upload success");
      console.log(res);
      this.setState({
        path: res.data.path
      })
      this.getData();
    }).catch(err => { // then print response status
      NotificationManager.error('upload fail');
      console.log(err);
    })
  }
  setDelimiter = (event) => {
    this.setState({
      delimeter: event.target.value
    });
    this.filterData();
  }
  setLines = (event) => {
    this.setState({
      lines: event.target.value
    });
    this.filterData();
  }
  filterData = () => {
    this.getData();
  }
  getData = () =>{
    axios.get("http://localhost:8888/getData/"+ this.state.delimeter +'/' + 
    this.state.lines + '/' + this.state.path).then(res =>{
      this.setState({
        data: res.data.records
      });
    }).catch(err => {
      this.setState({
        data: {}
      })
    });
  }
  render() {
    return (
      <div className="container">
	      <div className="row">
      	  <div className="offset-md-3 col-md-6">
              <Form>
                <FormGroup>
                  <Label for="delimiter">Delimiter</Label>
                  <Input type="text" name="delimiter" id="delimiter" value = {this.state.delimeter} onChange = {this.setDelimiter}/>
                </FormGroup>
                <FormGroup>
                  <Label for="lines">Lines</Label>
                  <Input type="number" name="lines" id="lines" value = {this.state.lines} onChange = {this.setLines} min={1}/>
                </FormGroup>
              </Form>
              <Form>
                <FormGroup>
                  <label>Upload Your File </label>
                  <input type="file" className="form-control" onChange={this.onChangeHandler}/>
                </FormGroup>
                <FormGroup>
                  <Progress max="100" color="success" value={this.state.loaded} >{Math.round(this.state.loaded,2) }%</Progress>
                  <button type="button" className="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>
                </FormGroup>
              </Form>
              <br/>
              <br/>
              <br/>
              <div>OUTPUT</div>
              <Table>
                <tbody>
                {this.state.data.length ? 
                  this.state.data.map(col => (
                    <tr>
                      <td>{col.columns0}</td>
                      <td>{col.columns1}</td>
                      <td>{col.columns2}</td>
                      <td>{col.columns3}</td>
                    </tr>
                  ))
                  : 
                  (<tr>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                  </tr>)
                }
                </tbody>
              </Table>
              <NotificationContainer/>
	      </div>
      </div>
      </div>
    );
  }
}
export default App;