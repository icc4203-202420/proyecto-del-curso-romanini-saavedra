class EventPicture < ApplicationRecord
  belongs_to :event
  belongs_to :user

  has_many :tag_users
  has_one_attached :image

  validates :event_id, presence: true
  validates :user_id, presence: true
end
