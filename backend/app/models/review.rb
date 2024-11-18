class Review < ApplicationRecord
  belongs_to :user
  belongs_to :beer

  after_save :update_beer_rating
  after_destroy :update_beer_rating

  after_create_commit :broadcast_to_friends

  private

  def update_beer_rating
    beer.update_avg_rating
  end

  def broadcast_to_friends
    user.friends.each do |friend|
      Rails.logger.info "BROADCASTING to feed for friend #{friend.id}: #{friend.inspect}"

      # Este es el mensaje que se manda hacia el canal de cada amigo
      ActionCable.server.broadcast("feed_#{friend.id}", {
        type: "new_post",
        activity: "#{user.handle} uploaded a new review for a beer '#{beer.name}'",
        user: user.handle,
        beer: beer.name,
        review_url: Rails.application.routes.url_helpers.api_v1_beer_review_path(beer_id: beer.id, id: id, only_path: true)
      })
    end
  end

end
