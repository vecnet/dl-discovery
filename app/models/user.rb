class User < ActiveRecord::Base

  #attr_accessor :uid, :groups, :email
# Connects this user object to Blacklights Bookmarks.
  include Blacklight::User

  def self.find_by_uid(uid)
    User.where(uid: uid).limit(1).first
  end

  def self.find_or_create_from_pubtkt(pubtkt)
    user = User.find_by_uid(pubtkt.uid)
    user = User.create_from_pubtkt(pubtkt) if user.nil?
    # always update the group list from the pubtkt
    user.groups = pubtkt.tokens.split(',') if pubtkt.tokens.present?
    user
  end

  def self.create_from_pubtkt(pubtkt)
    user = User.new(uid: pubtkt.uid)
    user.save!
    user
  end

  # Method added by Blacklight; Blacklight uses #to_s on your
  # user class to get a user-displayable login/identifier for
  # the account.
  def to_s
    uid
  end

  def groups=(v)
    v = [v] unless v.is_a?(Array)
    @groups = v
  end

  def groups
    @groups.nil? ? [] : @groups
  end

  def admin?
    return false if self.groups.nil?
    self.groups.include?('dl_librarian')
  end
end
