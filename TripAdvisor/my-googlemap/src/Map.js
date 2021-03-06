//create component called CurrentLocation where all functionality to pick browsers location lies 
import React from 'react'
import ReactDOM from 'react-dom'
import Geocode from 'react-geocode'

const mapStyles={
    map:{
        position :'absolute',
        width:'100%',
        height: '100%'
    }
};

Geocode.setApiKey('AIzaSyD-a_aMfM44H43DL1gkBccsYjcYgZTZWQk');

export class CurrentLocation extends React.Component{
    constructor(props){
        super(props);//make it stateful
        const {lat,lng,name}=this.props.initialCenter;
        this.state={
            currentLocation:{
                lat: lat,
                lng:lng,
                name:name
            },
            showingInfoWindow:false
        };
    }
 
    componentDidMount(){
        if(this.props.centerAroundCurrentLocation){
            if(navigator && navigator.geolocation){
                navigator.geolocation.getCurrentPosition(pos =>{
                    const coords= pos.coords;
                    this.setState({
                        currentLocation:{
                            lat: coords.latitude,
                            lng:coords.longitude,
                            name_loc:  Geocode.fromLatLng(coords.latitude,coords.longitude).then(
                                response=>{
                                    this.state.currentLocation.name_loc=response.results[0].formatted_address;   
                                },
                                error =>{
                                    console.log(error);
                                }
                            )

                        }
                    });
                });
                
            }
        }
        this.loadMap();
    }

    componentDidUpdate(prevProps,prevState){
        if(prevProps.google!== this.props.google){
            this.loadMap();
        }
        if(prevState.currentLocation !== this.state.currentLocation){
            this.recenterMap();
        }
    }

    recenterMap(){
        const map=this.map;
        const current =this.state.currentLocation;

        const google=this.props.google;
        const maps=google.maps;

        if(map){
            let center=new maps.LatLng(current.lat,current.lng);
            map.panTo(center);
        }
    }


    //only called after the component has been rendered and grabs a reference to the DOM component 
    loadMap(){
        
        if(this.props && this.props.google){
            //check if google is available 
            const{google}=this.props;
            const maps=google.maps;
            const mapRef=this.refs.map;

            //reference to the actual DOM element 
            const node=ReactDOM.findDOMNode(mapRef);

            let{zoom}=this.props;
            const{lat,lng,name}=this.state.currentLocation;
            const center= new maps.LatLng(lat,lng,name);
            const mapConfig=Object.assign(
                {},
                {
                    center:center,
                    zoom:zoom
                }
            );
            this.map= new maps.Map(node,mapConfig);
        }
    }

    renderChildren(){
        const {children}=this.props;

        if(!children) return;

        return React.Children.map(children, c=>{
            if(!c) return;
            return React.cloneElement(c,{
                map: this.map,
                google:this.props.google,
                mapCenter: this.state.currentLocation
            });
        });
    }

    render(){
        const style=Object.assign({},mapStyles.map);
        return(
            <div>
                <div style={style} ref="map">
                Loading map . . .
                </div>
                {this.renderChildren()}
            </div>
        );
    }
    
}

export default CurrentLocation;

CurrentLocation.defaultProps={
    zoom:20,
    initialCenter:{
        lat:40.723839,
        lng: -104.105515,
        name:'hey'
    },
    centerAroundCurrentLocation:false,
    visible:false
};