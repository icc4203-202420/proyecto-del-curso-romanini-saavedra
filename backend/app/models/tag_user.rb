class TagUser < ApplicationRecord
  belongs_to :user 
  belongs_to :tagged_user, class_name: 'User' 
  belongs_to :picture, class_name: 'EventPicture' 
  
  validates :tagged_user, presence: true
  validates :user, presence: true
  validates :picture, presence: true
end