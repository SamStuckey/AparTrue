class Api::PropertiesController < ApplicationController
  def index
    if property_params[:address] != "dummy"
      @properties = Property.satisfy_params(property_params)
    else
      @properties = Property.all
    end

    if @properties
      render "api/properties/index"
    else
      render json: ["No properties found"], status: 422 # NOTE update error codes
    end
  end

  def show
    @property = Property.find(params[:id])
    if @property
      render "api/properties/show"
    else
      render json: ["property not found"], status: 400 # NOTE update error codes
    end
  end

  def create
    prop_par = property_params
    prop_par[:image] = nil if property_params[:image] == "null"

    @property = Property.new(prop_par)

    city_name = property_params[:city]
    neighborhood = Neighborhood.find_by_name(city_name)

    if neighborhood
      @property.neighborhood_id = neighborhood.id
    else
      @property.neighborhood_id = Neighborhood.create_and_return_id(city_name)
    end

    if @property.save
      render "api/properties/show"
    else
      render json: @property.errors
    end
  end

  private
  def is_owner?
    params[:is_owner]
  end

  def neighborhood
    Neighborhood.find_by_name(params[:city])
  end

  def property_params
    form_params = params.require(:property).permit(
      :address, :owner_id, :price, :num_bedrooms, :available,
      :lat, :lng, :zipcode, :city, :neighborhood_id, :image, :id,
      bounds: [northEast: [:lat, :lng], southWest: [:lat, :lng]]
    )
  end
end
