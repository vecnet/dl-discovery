class AddUidToUser < ActiveRecord::Migration
  def up
    add_column :users, :uid, :string
    change_column :users, :email, :string, unique: false, null: true
    remove_column :users, :encrypted_password
    remove_column :users, :reset_password_token
    remove_column :users, :reset_password_sent_at
    remove_column :users, :guest
    remove_column :users, :remember_created_at
    remove_column :users, :sign_in_count
    remove_column :users, :current_sign_in_at
    remove_column :users, :last_sign_in_at
    remove_column :users, :current_sign_in_ip
    remove_column :users, :last_sign_in_ip


    add_index :users, :uid, unique: true
    remove_index :users, :email
  end

  def down
    change_column :users, :email, :string, unique: true
    remove_column :users, :uid
    add_index :users, :email, unique: true
  end
end
