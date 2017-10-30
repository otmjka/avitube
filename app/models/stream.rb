class Stream < ActiveRecord::Base
  establish_connection "#{Rails.env}_flussonic".to_sym
  self.primary_key = "name"
  has_many :recordings, primary_key: :name, foreign_key: :stream
end
