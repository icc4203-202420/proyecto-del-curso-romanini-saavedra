class FeedChannel < ApplicationCable::Channel
  def subscribed
    @user = User.find(params[:user_id])

    # Canal único para cada usuario
    stream_from "feed_#{@user.id}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
