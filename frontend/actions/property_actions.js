const ApiUtil = require('../util/property_api_util'),
      AppDispatcher = require('../dispatcher/dispatcher'),
      PropertyStore = require('../stores/property_store'),
      PropertyApiUtil = require('../util/property_api_util'),
      PropertyConstants = require('../constants/property_constants'),
      ErrorActions = require('../actions/error_actions');


const PropertyActions = {
  fetchAllProperties (bounds) {
    ApiUtil.fetchAllProperties(
      bounds,
      this.receiveAllProperties,
      ErrorActions.setErrors
    );
  },

  createProperty (property) {
    ApiUtil.createProperty(
      property,
      this.receiveProperty,
      ErrorActions.setErrors
    );
  },

  fetchProperty (id) {
    ApiUtil.fetchProperty(
      id,
      this.receiveProperty,
      ErrorActions.setErrors
    );
  },

  receiveAllProperties (properties) {
    AppDispatcher.dispatch({
      actionType: PropertyConstants.PROPERTIES_RECEIVED,
      properties: properties
    });
  },

  receiveProperty (property) {
    AppDispatcher.dispatch({
      actionType: PropertyConstants.PROPERTY_RECEIVED,
      property: property
    });
  }
};

module.exports = PropertyActions;
