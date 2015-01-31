class AddUidToUser < ActiveRecord::Migration
  def change
    change_table(:users) do |t|
      t.string :uid, null: false, unique: true, default: ""
      t.column :email, :string, unique: false
    end

    add_index :users, :uid, unique: true
  end
end
