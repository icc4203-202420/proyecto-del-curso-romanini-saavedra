class API::V1::ReviewsController < ApplicationController
  respond_to :json
  before_action :set_review, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  def index
    beer = Beer.find(params[:beer_id])
    reviews = beer.reviews
    render json: reviews, status: :ok
  end


  def show
    if @review
      render json: { review: @review }, status: :ok
    else
      render json: { error: "Review not found" }, status: :not_found
    end
  end

  def create
    @review = Review.new(review_params)

    if @review.save
      render json: { review: @review, message: "Review created succesffuly."}, status: :created
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def update
    if @review.update(review_params)
      render json: @review, status: :ok
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @review.destroy
    head :no_content
  end

  def friends_reviews
    user = User.find(params[:user_id])
    friend_ids = user.friendships.pluck(:friend_id)
  
    reviews = Review
      .where(user_id: friend_ids)
      .includes(:user, beer: { bars: :address }) # Incluye las relaciones necesarias
  
    render json: reviews.map { |review|
      bar = review.beer.bars.first # Seleccionamos un bar donde se sirve la cerveza
      bar_obj = nil
      
      if bar.present?
        address = bar.address # Obtenemos la dirección del bar
        bar_obj = {
          id: bar.id,
          name: bar.name,
          address: {
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            country: address.country.name # Asumiendo que el bar tiene una dirección asociada a un país
          }
        }
      end
  
      {
        id: review.id,
        beer_name: review.beer.name,
        avg_rating: review.beer.avg_rating,
        friend_id: review.user.id,
        friend_handle: review.user.handle,
        rating: review.rating,
        text: review.text,
        created_at: review.created_at,
        bar_obj: bar_obj # Si bar es nil, entonces bar_obj será nil
      }
    }, status: :ok
  end

  private

  def set_review
    @review = Review.find_by(id: params[:id])
    render json: { error: "Review not found" }, status: :not_found unless @review
  end

  def review_params
    params.require(:review).permit(:text, :rating, :user_id, :beer_id)
  end

  def verify_jwt_token
    authenticate_user!
    head :unauthorized unless current_user
  end
end
