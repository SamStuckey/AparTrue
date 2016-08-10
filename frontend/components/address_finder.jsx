const React = require('react'),
      PropertyStore = require('../stores/property_store'),
      FilterStore = require('../stores/filter_store'),
      PropertyActions = require('../actions/property_actions'),
      hashHistory = require('react-router').hashHistory,
      SessionStore = require('../stores/session_store');


const AddressFinder = React.createClass({
  getInitialState () {
    return ({
      properties: PropertyStore.all(),
      address: "",
      places: []
    });
  },

  componentDidMount () {
    this.searchBox = new google.maps.places.SearchBox(this.searchBoxInput);
    this.propertyListener = PropertyStore.addListener(this._onPropertyChange);
    this.boxListener = this.searchBox.addListener(
      'places_changed', this.placesChanged
    );
    PropertyActions.fetchAllProperties({properties: {}});
  },

  componentWillUnmount() {
    this.propertyListener.remove();
    this.boxListener.remove();
  },

  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.places[0]) { return; }
    const address = this.state.places[0].name;
    const addressComponents = address.split(', ');
    const streetAddress = addressComponents[0];
    // const zipcode = google magic
    // const city =  google magic
    const propertyId = PropertyStore.findByStreetAddress(streetAddress);
    if (!!propertyId) {
      // PropertyActions.stageProperty({
      //   streetAddress: streetAddress,
      //   zipcode: zipcode,
      //   city: city
      // });
      hashHistory.push(`properties/${propertyId}`);
    } else {
      hashHistory.push("properties/new");
    }
  },

  placesChanged () {
    const places = this.searchBox.getPlaces();
    this.setState({places: places, address: places[0]});
  },

  _onPropertyChange () {
    const properties = PropertyStore.all();
    this.setState({properties: properties});
  },

  updateAddress (e) {
    this.setState({address: e.target.value});
  },

  render () {
    return (
      <form className="google-address-finder" onSubmit={this.handleSubmit}>
        <input
          type="text"
          className="input-field"
          onChange={this.updateAddress}
          ref={(input) => this.searchBoxInput = input}
        />
        <input type="submit" className="search-button button" value="find" />
      </form>
    );
  }

});

module.exports = AddressFinder;