class API::V1::BrandsController < ApplicationController
  respond_to :json

  before_action :set_brand, only: [:show]

  # GET /brands
  def index
    @brands = Brand.all
    render json: { brands: @brands }, status: :ok
  end
  
  # GET /brands/:id
  def show
      render json: { brand: @brand.as_json }, status: :ok
  end

  private

  def set_brand
    @brand = Brand.find_by(id: params[:id])
    render json: { error: 'Brand not found' }, status: :not_found if @brand.nil?
  end  

  def brand_params
    params.require(:brand).permit(:name, :brewery_id)
  end
end
