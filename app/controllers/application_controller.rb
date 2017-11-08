class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception


  def ensure_logged
    session[:user_id] || render(:file => File.join(Rails.root, 'public/403.html'), :status => 403, :layout => false)
  end
end
