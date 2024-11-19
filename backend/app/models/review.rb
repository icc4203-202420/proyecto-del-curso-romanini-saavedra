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

      bar = beer.bars.first
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

      # Este es el mensaje que se manda hacia el canal de cada amigo
      ActionCable.server.broadcast("feed_#{friend.id}", {
        type: "new_review",
        activity: "#{user.handle} uploaded a new review for a beer '#{beer.name}'",
        user: user.handle,
        bar_obj: bar_obj,
        beer: beer,
        rating: rating,
        avg_rating: beer.avg_rating,
        created_at: created_at,
        comment: text,
        review_url: Rails.application.routes.url_helpers.api_v1_beer_review_path(beer_id: beer.id, id: id, only_path: true)
      })
    end
  end

end
