class CreateTagUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :tag_users do |t|
      t.references :tagged_user, null: false, foreign_key: { to_table: :users }
      t.references :user, null: false, foreign_key: { to_table: :users }
      t.references :picture, null: false, foreign_key: { to_table: :event_pictures }
      
      t.timestamps
    end
  end
end
