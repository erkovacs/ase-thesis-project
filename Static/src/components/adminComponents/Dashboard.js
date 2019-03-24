import React, { Component } from "react";
import { PieChart, Pie, Legend, Cell} from 'recharts';
import firebase from "firebase";

class PageContent extends Component {
  constructor(props){
    super(props);
    this.props = props;
    this.database = firebase.database();
    this.COLORS = [
      "#007bff", 
      "#6610f2",
      "#6f42c1",
      "#e83e8c", 
      "#dc3545",
      "#fd7e14",
      "#ffc107",
      "#28a745", 
      "#20c997", 
      "#17a2b8",
      "#6c757d",
      "#343a40",
      "#007bff",
      "#6c757d",
      "#28a745", 
      "#17a2b8",
      "#ffc107",
      "#dc3545",
      "#f8f9fa",
      "#343a40"
  ];
    this.state ={
      data : []
    };
  }
  componentWillMount = async () => {
    const dataSnapshot = await this.database.ref("attractions").once("value");
    const frequencyMap = {};
    const attractions = dataSnapshot.val();
    for(let key in attractions){
      if(typeof frequencyMap[attractions[key].category] === "undefined"){
        frequencyMap[attractions[key].category] = 1;
      }else {
        frequencyMap[attractions[key].category]++;
      }
    }
    const dataArray = [];
    for(let key in frequencyMap){
      if(key !== "" && frequencyMap[key] > 20){
        dataArray.push({name: key, value: frequencyMap[key]});
      }
    }
    this.setState({data: dataArray});
    console.log(dataArray);
  }
  render() {
    return (
      <div className="col-md-10 offset-md-2">
        <div>
          <h1>Your next vacation Admin Area</h1>
          <p>Here entities can be created, edited, etc.</p>
        </div>
        <div className="card text-white bg-primary mb-3 col-md-3">
          <div className="card-header">Header</div>
          <div className="card-body">
            <h5 className="card-title">Primary card title</h5>
            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
          </div>
        </div>
        <div className="card text-white bg-success mb-3 col-md-3">
          <div className="card-header">Header</div>
          <div className="card-body">
            <h5 className="card-title">Success card title</h5>
            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
          </div>
        </div>
        <div className="card text-white bg-danger mb-3 col-md-3">
          <div className="card-header">Header</div>
          <div className="card-body">
            <h5 className="card-title">Danger card title</h5>
            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
          </div>
        </div>
        <div className="card text-white bg-warning mb-3 col-md-3">
          <div className="card-header">Header</div>
          <div className="card-body">
            <h5 className="card-title">Warning card title</h5>
            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
          </div>
        </div>
        <div className="col-md-12">
        <h4>Attractions by category</h4>
        
        <PieChart width={900} height={300}>
          <Legend verticalAlign="top" height={36}/>
          <Pie data={this.state.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#82ca9d" label>
          {
          	this.state.data.map((entry, index) => <Cell fill={this.COLORS[index % this.COLORS.length]}/>)
          }
          </Pie>
        </PieChart>
        
        </div>
      </div>
    );
  }
}
export default PageContent;
