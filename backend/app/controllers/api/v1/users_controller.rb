class API::V1::UsersController < ApplicationController
  include Authenticable

  respond_to :json
  before_action :set_user, only: [:show, :update]  
  before_action :set_user_friendship, only: [:index_friendships, :create_friendship]
  before_action :verify_jwt_token, only: [:index_friendships, :create_friendship]

  def index
    @users = User.includes(:reviews, :address).all 
  end

  def show
  
  end

  def create
    @user = User.new(user_params)
    if @user.save
      render json: @user.id, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    #byebug
    if @user.update(user_params)
      render :show, status: :ok, location: api_v1_users_path(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def index_friendships
    friendships = @user.friendships.includes(:friend)

    render json: friendships, status: :ok
  end

  def create_friendship
    friend_id = params.dig(:friendships, :friend_id)
    bar_id = params.dig(:friendships, :bar_id)

    friend = User.find_by(id: friend_id)
    bar = Bar.find_by(id: bar_id)

    friendship = @user.friendships.build(friend: friend, bar: bar)
    if friendship.save
      render json: {message: "Friendship created successfully"}, status: :ok
    else
      render json: {error: friendship.errors.full_messages}, status: :unprocessable_entity
    end
  end

  private

  def set_user_friendship
    @user = User.find(params[:user_id])
  end

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.fetch(:user, {}).
        permit(:id, :first_name, :last_name, :email, :age,
            { address_attributes: [:id, :line1, :line2, :city, :country, :country_id, 
              country_attributes: [:id, :name]],
              reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
            })
  end
end
