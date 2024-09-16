class API::V1::CountriesController < ApplicationController
  respond_to :json

  before_action :set_country, only: [:show]

  # GET /countries
  def index
    @countries = Country.all
    render json: { countries: @countries }, status: :ok
  end
  
  # GET /countries/:id
  def show
      render json: { country: @country.as_json }, status: :ok
  end

  private

  def set_country
    @country = Country.find_by(id: params[:id])
    render json: { error: 'Country not found' }, status: :not_found if @country.nil?
  end  

  def country_params
    params.require(:country).permit(:name)
  end
end
