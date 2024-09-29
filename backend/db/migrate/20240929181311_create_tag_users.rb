class CreateTagUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :tag_users do |t|
      t.integer :tagged_user, null: false, index: true
      t.integer :user, null: false, index: true
      t.integer :picture, null:false, index: true 

      t.timestamps
    end

    add_foreign_key :tag_users, :users, column: :tagged_user
    add_foreign_key :tag_users, :users, column: :user
    add_foreign_key :tag_users, :event_pictures, column: :picture
  end
end
