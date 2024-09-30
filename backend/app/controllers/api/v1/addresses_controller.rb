class API::V1::AddressesController < ApplicationController
  respond_to :json

  before_action :set_address, only: [:show]

  # GET /addresses
  def index
    @addresses = Address.all
    render json: { addresses: @addresses }, status: :ok
  end
  
  # GET /addresses/:id
  def show
      render json: { address: @address.as_json }, status: :ok
  end

  private

  def set_address
    @address = Address.find_by(id: params[:id])
    render json: { error: 'Address not found' }, status: :not_found if @address.nil?
  end  

  def address_params
    params.require(:address).permit(:user_id, :country_id, :line1, :line2, :city)
  end
end
