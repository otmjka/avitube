class Stream < ActiveRecord::Base
  establish_connection "#{Rails.env}_flussonic".to_sym
  self.primary_key = "name"
end
