class Lock < ActiveRecord::Base
  establish_connection "#{Rails.env}_flussonic".to_sym

  def start
    Time.at(start_at)
  end

  def finish
    Time.at(end_at)
  end

  def duration
    end_at - start_at
  end
end
