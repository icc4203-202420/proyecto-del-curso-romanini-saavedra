class API::V1::BreweriesController < ApplicationController
  respond_to :json

  before_action :set_brewery, only: [:show]

  # GET /breweries
  def index
    @breweries = Brewery.all
    render json: { breweries: @breweries }, status: :ok
  end
  
  # GET /breweries/:id
  def show
      render json: { brewery: @brewery.as_json }, status: :ok
  end

  private

  def set_brewery
    @brewery = Brewery.find_by(id: params[:id])
    render json: { error: 'Brewery not found' }, status: :not_found if @brewery.nil?
  end  

  def brewery_params
    params.require(:brewery).permit(:name, :estdate)
  end
end
