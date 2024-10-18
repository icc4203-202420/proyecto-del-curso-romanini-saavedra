class API::V1::BarsBeersController < ApplicationController
  respond_to :json

  # GET /barBeer
  def index
    @bars_beers = BarsBeer.all
    render json: { bars_beers: @bars_beers }, status: :ok
  end 
end
