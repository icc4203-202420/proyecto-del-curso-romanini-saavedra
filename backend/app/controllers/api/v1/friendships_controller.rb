class API::V1::FriendshipsController < ApplicationController
    respond_to :json
    before_action :set_friendship, only: [:show, :destroy]
    before_action :verify_jwt_token, only: [:create, :destroy]
  
    # GET /users/:user_id/friendships
    def index
      user = User.find(params[:user_id])
      friendships = user.friendships
      render json: friendships, status: :ok
    end
  
    # GET /friendships/:id
    def show
      if @friendship
        render json: { friendship: @friendship }, status: :ok
      else
        render json: { error: "Friendship not found" }, status: :not_found
      end
    end
  
    # POST /friendships
    def create
      @friendship = Friendship.new(friendship_params)

      notify_friendship(@friendship.friend_id)
  
      if @friendship.save
        render json: { friendship: @friendship, message: "Friendship created successfully." }, status: :created
      else
        render json: @friendship.errors, status: :unprocessable_entity
      end
    end
  
    # DELETE /friendships/:id
    def destroy
      @friendship.destroy
      head :no_content
    end
  
    private
  
    def set_friendship
      @friendship = Friendship.find_by(id: params[:id])
      render json: { error: "Friendship not found" }, status: :not_found unless @friendship
    end
  
    def friendship_params
      params.require(:friendship).permit(:user_id, :friend_id, :bar_id)
    end
  
    def verify_jwt_token
      authenticate_user!
      head :unauthorized unless current_user
    end

    def notify_friendship(friend_id)
      user = User.find(friend_id)
      message = "#{current_user.handle} just added you as a friend!"
      data = {type: 'friendship_created'}

      ExpoPushNotificationService.send_notification(
        user.expo_push_token,
        message, 
        data,
        "You Have a New Friend!"
      )
    end
end
