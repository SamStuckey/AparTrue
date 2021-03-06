 const React = require('react'),
      PropertyStore = require('../stores/property_store'),
      PropertyActions = require('../actions/property_actions'),
      SessionStore = require('../stores/session_store'),
      StagingStore = require('../stores/staging_store'),
      hashHistory = require('react-router').hashHistory;

let currentUser;

const geocoder = new google.maps.Geocoder();

const fieldErrorMsg = 'field cannot be blank';
let addressError, cityError;

let isOwner = false;

const PropertyFrom = React.createClass ({
  getInitialState() {
    // get property from stage store
    const property = StagingStore.getStagedProperty();
    let address, city, zipcode;

    // if it's not an empty object then set things
    if (!!property.address) {
      address = property.address;
      zipcode = property.zipcode;
      city = property.city;
    }

    currentUser = SessionStore.currentUser();

    return ({
      address: address || "",
      city: city || "",
      zipcode: zipcode || "",
      price: "",
      num_bedrooms: "",
      available: false,
      ownerId: false,
      lat: null,
      lng: null,
      imageFile: null,
      imageUrl: null
    });
  },

  availClicked() {
    if (this.state.available) {
      return "x";
    } else {
      return " ";
    }
    this.forceUpdate();
  },

  lordClicked() {
    if (this.state.ownerId) {
      return "x";
    } else {
      return " ";
    }
    this.forceUpdate();
  },

  componentDidMount () {
    this.sessionListener = SessionStore.addListener(this._sessionChange);
    this.propertyListener = PropertyStore.addListener(this._onChange);
    this.stagedListener = StagingStore.addListener(this._resetErrors);
  },

  componentWillUnmount () {
    this.sessionListener.remove();
    this.propertyListener.remove();
  },

  codeAddress() {
    const that = this;
    const address = `${this.state.address}, ${this.state.city}, ${this.state.zipcode}`;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        that.sendToAPI(results);
      } else {
        that._placeError(status);
      }
    });
  },

  handleSubmit (e) {
    e.preventDefault();
    const address = this.state.address,
          city = this.state.city;

    if (!(address, city)) {
      addressError = address ? "" : fieldErrorMsg;
      cityError =  city ? "" : fieldErrorMsg;
      this.forceUpdate();
    }

    this.codeAddress();
  },

  _onChange () {
    const newProperty = PropertyStore.mostRecentlyAdded();
    hashHistory.push(`properties/${newProperty.id}`);
  },

  _placeError (status) {
  },

  sendToAPI (results) {
    const latLng = results[0].geometry.location;
    const ownerId = isOwner ? SessionStore.userId() : null;

    this.setState({
      lat: latLng.lat(),
      lng: latLng.lng(),
      ownerId: ownerId
    });

    const formData = new FormData();

    formData.append("property[address]", this.state.address);
    formData.append("property[zipcode]", this.state.zipcode);
    formData.append("property[price]", this.state.price);
    formData.append("property[num_bedrooms]", this.state.num_bedrooms);
    formData.append("property[available]", this.state.available);
    formData.append("property[lat]", this.state.lat);
    formData.append("property[lng]", this.state.lng);
    formData.append("property[city]", this.state.city);
    formData.append("property[owner_id]", this.state.ownerId);
    formData.append("property[image]", this.state.imageFile);

    PropertyActions.createProperty(formData);
  },

  showErrors () {
    PropertyStore.errors();
  },

  updateAddress (e) {
    this.setState({address: e.target.value});
  },

  updateZipcode (e) {
    const zip = parseInt(e.target.value) || "";
    this.setState({zipcode: zip});
  },

  updateCity (e) {
    this.setState({city: e.target.value});
  },

  updatePrice (e) {
    const price = parseInt(e.target.value) || "";
    this.setState({price: price});
  },

  updateNumBedRooms (e) {

    this.setState({num_bedrooms: e.target.value});
  },

  toggleOwnerId () {
    const user = SessionStore.currentUser();
    if (this.state.ownerId) {
      this.setState({ownerId: false});
    } else {
      this.setState({ownerId: user.id});
    }

  },

  toggleAvailable () {
    this.setState({available: !this.state.available});
  },

  updateFile (e) {
    const file = e.currentTarget.files[0];
    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      this.setState({imageFile: file, imageUrl: fileReader.result});
    };

    if (file) {
      fileReader.readAsDataURL(file);
    }
   },

   _resetErrors () {
     addressError = "";
     cityError = "";
   },

  render () {
    const address = [
      this.state.address,
      this.state.city,
      this.state.zipcode
    ].join(', ');

    return (
      <div className="page-wrapper group">
        <div className="property-form-top-gap"></div>
        <h1 className="header property-header">{address} is not in our database</h1>
        <div className="wide-backing-bar"></div>
        <div className="property-form-background">
        <form id="property-form" onSubmit={this.handleSubmit}>
          <div className="property-form-text-input-wrapper">
              <label className="field-label">
                <div className="form-field-error">{ addressError }</div>
                <p className="label-text">Address</p>
              <input
                  type="text"
                  placeholder="address"
                  className="property-form-input-field"
                  onChange={this.updateAddress}
                  value={this.state.address}
                  />
              </label>
              <label className="field-label">
                <div className="form-field-error">{ cityError }</div>
                <p className="label-text">City</p>
                <input
                  type="text"
                  placeholder="city"
                  className="property-form-input-field"
                  onChange={this.updateCity}
                  value={this.state.city}
                  />
              </label>
              <label className="field-label">
                <div className="form-field-error"></div>
                <p className="label-text">Zipcode</p>
                <input
                  type="text"
                  placeholder="zipcode"
                  className="property-form-input-field"
                  onChange={this.updateZipcode}
                  value={this.state.zipcode}
                  />
              </label>
              <label className="field-label">
                <div className="form-field-error"></div>
                <p className="label-text">Price</p>
                <input
                  type="text"
                  placeholder="price"
                  className="property-form-input-field"
                  onChange={this.updatePrice}
                  value={this.state.price}
                  />
              </label>
            </div>
          <label className="bedroom-field-label">
            <p className="label-text">Number of Bedrooms</p>
            <select
              className="bedroom-dropdown"
              onChange={this.updateNumBedRooms}
              >
              <option value="bedrooms" hidden>bedrooms</option>
              <option value="5">5</option>
              <option value="4">4</option>
              <option value="3">3</option>
              <option value="2">2</option>
              <option value="1">1</option>
              <option value="0">0</option>
            </select>
          </label>
          <div className="checkbox-wrapper">
            <label className="checkbox-field-label">
              <p className="label-text">Your property?</p>
              <div
                className="form-check-box"
                onClick={this.toggleOwnerId}
                >{this.lordClicked()}</div>
              <label><span className="checkbox-filler"></span></label>
            </label>
            <label className="checkbox-field-label">
              <p className="label-text">Is it available?</p>
              <div
                className="form-check-box"
                onClick={this.toggleAvailable}
                >{this.availClicked()}</div>
              <label ><span className="checkbox-filler"></span></label>
            </label>
          </div>
          <input type="file" className="file-upload" onChange={this.updateFile} />
          <input type="submit" className="button submit-form-button" value="Add Location"/>
        </form>

      </div>
      </div>
    );
  }
});

module.exports = PropertyFrom;
