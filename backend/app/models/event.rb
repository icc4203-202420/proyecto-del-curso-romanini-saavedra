class Event < ApplicationRecord
  belongs_to :bar
  has_many :attendances
  has_many :users, through: :attendances

  has_many_attached :flyers
  has_many :event_pictures, dependent: :destroy

  validates :name, presence: true
  validates :flyers, content_type: { in: ['image/png', 'image/jpg', 'image/jpeg'],
                                    message: 'must be a valid image format' },
                    size: { less_than: 5.megabytes } 

  def thumbnail
    flyers.map { |flyer| flyer.variant(resize_to_limit: [200, nil]).processed }
  end  
end
