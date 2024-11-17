class EventPicture < ApplicationRecord
  belongs_to :event
  belongs_to :user

  has_many :tag_users
  has_one_attached :image

  after_create_commit :broadcast_to_friends

  validates :event_id, presence: true
  validates :user_id, presence: true

  private
  def broadcast_to_friends
    bar = Bar.find(event.id)
    address = Address.find(bar.address_id)
    country = Country.find(address.country_id)
    user.friends.each do |friend|
      Rails.logger.info "BROADCASTING to feed for friend #{friend.id}: #{friend.inspect}"

      # Este es el mensaje que se manda hacia el canal de cada amigo
      ActionCable.server.broadcast("feed_#{friend.id}", {
        type: "new_post",
        activity: "#{user.handle} uploaded a new picture to the event '#{event.name}'",
        user: user.handle,
        event: event,
        bar: bar,
        country_name: country.name,
        description: description,
        created_at: created_at,
        image_url: Rails.application.routes.url_helpers.rails_blob_path(image, only_path: true)
      })
    end
  end
end
