class API::V1::ReviewsController < ApplicationController
  respond_to :json
  # before_action :set_user, only: [:index, :create]
  before_action :set_review, only: [:show, :update, :destroy]

  # def index
  #   @reviews = Review.where(user: @user)
  #   render json: { reviews: @reviews }, status: :ok
  # end

  # def index
  #   @reviews = Review.all
  #   render json: { reviews: @reviews }, status: :ok
  # end

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

  # def create
  #   # @user = User.find(params[:user_id])
    
  #   @review = Review.reviews.build(review_params)
  #   if @review.save
  #     render json: @review, status: :created, location: api_v1_review_url(@review)
  #   else
  #     render json: @review.errors, status: :unprocessable_entity
  #   end
  # end



  # Para crear un review:
  # {
#     "review": {
#         "text": "Great beer! I loved it!", 
#         "rating": 5,
#         "user_id": 16,
#         "beer_id": 1
#     }
# }
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

  private

  def set_review
    @review = Review.find_by(id: params[:id])
    render json: { error: "Review not found" }, status: :not_found unless @review
  end

  # def set_user
  #   @user = User.find(params[:user_id]) 
  # end

  def review_params
    params.require(:review).permit(:text, :rating, :user_id, :beer_id)
  end
end
