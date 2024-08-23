class Friendship < ApplicationRecord
  belongs_to :user
  belongs_to :friend, class_name: 'User'
  belongs_to :bar, optional: true

  validates :user, presence: true
  validates :friends, presence: true
end
