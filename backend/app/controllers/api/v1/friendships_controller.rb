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



      puts "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"

      puts "FRIENDSHIP EN BACKEND: #{@friendship.inspect}"

      puts "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n"

      notify_friendship(@friendship)
  
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

    def notify_friendship(friendship)
      user_sending = User.find(friendship.user_id)
      user_receiving = User.find(friendship.friend_id)
      message = "You and #{user_sending.handle} are now friends!"
      data = {type: 'friendship_created'}

      ExpoPushNotificationService.send_notification(
        user_receiving.expo_push_token,
        message, 
        data,
        "You Have a New Friend!"
      )
    end
end
